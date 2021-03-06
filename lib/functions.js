const os = require('os');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const stream = require('stream');
const zlib = require('zlib');
const { promisify } = require('util');

const CONSTANTS = require('./constants');
const { walk, makeDir } = require('./fs-utils');
const {
  subscribe,
  pipe,
  map,
  filter,
  parallel,
  switchMap
} = require('./generators-utils');


const FORMAT_TO_STREAM = {
  [CONSTANTS.FORMATS.GZIP]: zlib.createGzip,
  [CONSTANTS.FORMATS.BROTLI]: zlib.createBrotliCompress
}


async function createCompressStream({ fromPath, toPath, format, compressOptions }) {
  return promisify(stream.pipeline)(
    fs.createReadStream(fromPath),
    FORMAT_TO_STREAM[format](compressOptions || CONSTANTS.DEFAULT_COMPRESS_SETTINGS[format]),
    fs.createWriteStream(toPath + CONSTANTS.FORMAT_TO_EXT[format])
  );
}


async function compress(params) {
  const {
    from = params.input,
    to = params.output,
    formats = [CONSTANTS.FORMATS.GZIP],
    extWhiteList = CONSTANTS.EXT_WHITE_LIST,
    concurrency = os.cpus().length,
    fileSize
  } = params;

  const handlers = [
    filter(item => item.dirent.isFile()),
    filter(item => extWhiteList.includes(path.extname(item.direntPath))),
    fileSize && map(async item => {
      const stat = await fsp.stat(item.direntPath);
      return {
        ...item,
        size: stat.size
      }
    }),
    fileSize && filter(item => item.size > fileSize),
    switchMap(function* (item) {
      for (const format of formats) {
        yield {
          ...item,
          format
        }
      }
    }),
    parallel({
      concurrency,
      handler: async (item) => {
        const fromPath = item.direntPath;
        const relativePath = path.relative(from, fromPath);
        const toPath = path.join(to, relativePath);
        const toBasePath = path.dirname(toPath);

        await makeDir(toBasePath);

        return createCompressStream({ fromPath, toPath, format: item.format });
      }
    }),
  ].filter(Boolean);

  const iterable = pipe(...handlers)(walk(from));
  return subscribe(iterable, x => x);
}


module.exports = {
  compress,
  createCompressStream
}