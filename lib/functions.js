const os = require('os');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const zlib = require('zlib');
const { promisify } = require('util');

const CONSTANTS = require('./constants');
const TaskQueue = require('./queue');
const walkDir = require('./walk');


const FORMAT_TO_STREAM = {
  [CONSTANTS.FORMATS.GZIP]: (options) => zlib.createGzip(options),
  [CONSTANTS.FORMATS.BROTLI]: (options) => zlib.createBrotliCompress(options)
}


function makeDir(dir) {
  return promisify(fs.mkdir)(dir, { recursive: true });
}


async function createCompressStream({ fromPath, toPath, format, compressOptions }) {
  return promisify(stream.pipeline)(
    fs.createReadStream(fromPath),
    FORMAT_TO_STREAM[format](compressOptions || CONSTANTS.DEFAULT_COMPRESS_SETTINGS[format]),
    fs.createWriteStream(toPath + CONSTANTS.FORMAT_TO_EXT[format])
  );
}


async function compress({ from, to, formats = [CONSTANTS.FORMATS.GZIP], whiteList = CONSTANTS.EXT_WHITE_LIST, concurrency = os.cpus().length }) {
  const files = walkDir(from);

  const queue = new TaskQueue({ concurrency });

  for await (let fileNode of files) {
    if (!fileNode.dirent.isFile()) {
      continue;
    };

    const fromPath = fileNode.direntPath;

    if (!whiteList.includes(path.extname(fromPath))) {
      continue;
    };

    const relativePath = path.relative(from, fromPath);
    const toPath = path.join(to, relativePath);
    const toBasePath = path.dirname(toPath);

    await makeDir(toBasePath);

    for (format of formats) {
      await queue.add(() => createCompressStream({ fromPath, toPath, format }));
    }
  }

  await queue.whenDrain();
}


module.exports = {
  compress
}