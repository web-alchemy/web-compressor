const fs = require('fs');
const path = require('path');
const stream = require('stream');
const zlib = require('zlib');
const { promisify } = require('util');

const CONSTANTS = require('./constants');


const FORMAT_TO_STREAM = {
  [CONSTANTS.FORMATS.GZIP]: (options) => zlib.createGzip(options),
  [CONSTANTS.FORMATS.BROTLI]: (options) => zlib.createBrotliCompress(options)
}


function readDir(path) {
  return promisify(fs.readdir)(path, { withFileTypes: true });
}


function makeDir(basePath) {
  return promisify(fs.mkdir)(basePath, { recursive: true });
}


async function* getAllFiles(dirPath) {
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
    } else if (item.stat.isFile()) {
      yield item;
    }
  }
}


async function compress({ from, to, formats = [CONSTANTS.FORMATS.GZIP] }) {
  const files = getAllFiles(from);

  for await (const fileNode of files) {
    const file = fileNode.path;
    if (!CONSTANTS.EXT_WHITE_LIST.includes(path.extname(file))) continue;

    const relPath = path.relative(from, file);
    const fromPath = file;
    const toPath = path.join(to, relPath);
    const toBasePath = path.dirname(toPath);

    await makeDir(toBasePath);

    for (format of formats) {
      await promisify(stream.pipeline)(
        fs.createReadStream(fromPath),
        FORMAT_TO_STREAM[format](CONSTANTS.DEFAULT_COMPRESS_SETTINGS[format]),
        fs.createWriteStream(toPath + CONSTANTS.FORMAT_TO_EXT[format])
      );
    }
  }
}


module.exports = {
  compress
}