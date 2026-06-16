const os = require('os');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const zlib = require('zlib');
const { Buffer } = require('buffer')
const { gzipAsync } = require('@gfx/zopfli');

const CONSTANTS = require('./constants');
const { walk, makeDir } = require('./fs-utils');
const {
  subscribe,
  pipe,
  map,
  filter,
  parallel,
  flatMap
} = require('./generators-utils');

const FORMAT_TO_STREAM = (params) => {
  const { withZopfli = false } = params;
  return {
    [CONSTANTS.FORMATS.GZIP]:
      withZopfli
        ? (
          function createZopfli(options) {
            return stream.Duplex.from(async function* (source) {
              const chunks = [];
              for await (const chunk of source) {
                chunks.push(chunk);
              }
              yield await gzipAsync(Buffer.concat(chunks), options);
            })
          }
        )
        : zlib.createGzip,
    [CONSTANTS.FORMATS.BROTLI]: zlib.createBrotliCompress,
    [CONSTANTS.FORMATS.ZSTD]: zlib.createZstdCompress || (() => {
      throw new Error(`Your version of Node.js doesn't support zstd. Node.js has zstd support since 23.8.0 and 22.15.0.`)
    })
  }
}


function createCompressStream({ fromPath, toPath, format, compressOptions, withZopfli }) {
  const params = { withZopfli }

  return stream.promises.pipeline(
    fs.createReadStream(fromPath),
    FORMAT_TO_STREAM(params)[format](compressOptions || CONSTANTS.DEFAULT_COMPRESS_SETTINGS[format]),
    fs.createWriteStream(toPath + CONSTANTS.FORMAT_TO_EXT[format])
  );
}


function getConcurrency() {
  if (typeof os.availableParallelism === 'function') {
    return os.availableParallelism();
  }

  return os.cpus().length || 1;
}


async function compress(params) {
  const {
    from = params.input,
    to = params.output,
    formats = [CONSTANTS.FORMATS.GZIP],
    extWhiteList = CONSTANTS.EXT_WHITE_LIST,
    concurrency = getConcurrency(),
    fileSize,
    withZopfli = false
  } = params;

  const handlers = [
    filter(item => item.dirent.isFile()),
    filter(item => extWhiteList.includes(path.extname(item.direntPath))),
    fileSize && map(async item => {
      const stat = await fs.promises.stat(item.direntPath);
      return {
        ...item,
        size: stat.size
      }
    }),
    fileSize && filter(item => item.size > fileSize),
    flatMap(function* (item) {
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

        return createCompressStream({ fromPath, toPath, format: item.format, withZopfli });
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