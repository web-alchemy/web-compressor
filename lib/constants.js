const zlib = require('zlib');

const FORMATS = {
  'GZIP': 'gzip',
  'BROTLI': 'brotli'
}

const DEFAULT_COMPRESS_SETTINGS = {
  [FORMATS.GZIP]: {
    level: 9
  },
  [FORMATS.BROTLI]: {
    params: {
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
      [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY
    }
  }
}

exports.FORMATS = FORMATS;

exports.DEFAULT_COMPRESS_SETTINGS = DEFAULT_COMPRESS_SETTINGS;

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
  '.txt'
];