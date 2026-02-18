const zlib = require('zlib');

const FORMATS = {
  'GZIP': 'gzip',
  'BROTLI': 'brotli',
  'ZSTD': 'zstd'
}

exports.FORMATS = FORMATS;

exports.DEFAULT_COMPRESS_SETTINGS = {
  [FORMATS.GZIP]: {
    level: zlib.constants.Z_BEST_COMPRESSION,
    strategy: zlib.constants.Z_DEFAULT_STRATEGY,
  },
  [FORMATS.BROTLI]: {
    params: {
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
      [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY
    }
  },
  [FORMATS.ZSTD]: {
    params: {
      [zlib.constants.ZSTD_c_compressionLevel]: 22,
      [zlib.constants.ZSTD_c_strategy]: zlib.constants.ZSTD_btultra2
    }
  }
}

exports.FORMAT_TO_EXT = {
  [FORMATS.GZIP]: '.gz',
  [FORMATS.BROTLI]: '.br',
  [FORMATS.ZSTD]: '.zst',
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