const os = require('os');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const zlib = require('zlib');
const { promisify } = require('util');

const CONSTANTS = require('./constants');
const TaskQueue = require('../queue');


const FORMAT_TO_STREAM = {
  [CONSTANTS.FORMATS.GZIP]: (options) => zlib.createGzip(options),
  [CONSTANTS.FORMATS.BROTLI]: (options) => zlib.createBrotliCompress(options)
}


function readDir(dir) {
  return promisify(fs.readdir)(dir, { withFileTypes: true });
}


function makeDir(dir) {
  return promisify(fs.mkdir)(dir, { recursive: true });
}


async function* walkDir(dirPath) {
  const node = {
    stat: await promisify(fs.stat)(dirPath),
    path: dirPath
  };
  const stack = [node];
  let item;

  while (item = stack.shift()) {
    if (item.stat.isDirectory()) {
      const dirents = await readDir(item.path);
      const nodes = dirents.map(dirent => ({
        stat: dirent,
        path: path.join(item.path, dirent.name)
      }));
      stack.push(...nodes);
    }

    yield item;
  }
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
    if (!fileNode.stat.isFile()) {
      continue;
    };

    const fromPath = fileNode.path;

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