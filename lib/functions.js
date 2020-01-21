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
  return promisify(fs.readdir)(path, { withFileTypes: true})
}


async function getAllFiles(dirPath, files = []) {
  const items = await readDir(dirPath);
  for (const dirItem of items) {
    const newPath = path.join(dirPath, dirItem.name);
    if (dirItem.isDirectory()) {
      await getAllFiles(newPath, files);
    } else {
      files.push(newPath);
    }
  }
  return files;
}


async function compress({ from, to, formats = [CONSTANTS.FORMATS.GZIP] }) {
  const files = await getAllFiles(from);

  for (const file of files) {
    if (!CONSTANTS.EXT_WHITE_LIST.includes(path.extname(file))) continue;

    const relPath = path.relative(from, file);
    const fromPath = path.join(from, relPath);
    const toPath = path.join(to, relPath);
    const toBasePath = path.dirname(toPath);

    await promisify(fs.mkdir)(toBasePath, { recursive: true });

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