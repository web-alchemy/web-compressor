const path = require('path');

const CONSTANTS = require('./lib/constants');
const { compress } = require('./lib/functions');

const [ , , from, to, format = CONSTANTS.FORMATS.GZIP] = process.argv;

const rootDir = process.cwd();

const fromFolder = path.join(rootDir, from);
const toFolder = path.join(rootDir, to);

compress({
  from: fromFolder,
  to: toFolder,
  format
}).catch(console.error)