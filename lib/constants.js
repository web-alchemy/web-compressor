const zlib = require('zlib');

const FORMATS = {
  'GZIP': 'gzip',
  'BROTLI': 'brotli'
}

exports.FORMATS = FORMATS;

exports.DEFAULT_COMPRESS_SETTINGS = {
  [FORMATS.GZIP]: {
    level: zlib.constants.Z_BEST_COMPRESSION
  },
  [FORMATS.BROTLI]: {
    params: {
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
      [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY
    }
  }
}

exports.FORMAT_TO_EXT = {
  [FORMATS.GZIP]: '.gz',
  [FORMATS.BROTLI]: '.br'
}

exports.EXT_WHITE_LIST = [
  '.html',
  '.css',
  '.js',
  '.json',
  '.svg',
  '.xml',
  '.txt',
  '.atom',
  '.rss'
];