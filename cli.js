const path = require('path');

const CONSTANTS = require('./lib/constants');
const { compress } = require('./lib/functions');

const [ , , from, to, ...restArgs] = process.argv;

const formats = [];

if (restArgs.includes('--gzip')) {
  formats.push(CONSTANTS.FORMATS.GZIP);
}

if (restArgs.includes('--brotli')) {
  formats.push(CONSTANTS.FORMATS.BROTLI);
}

if (formats.length === 0) {
  formats.push(CONSTANTS.FORMATS.GZIP);
}

const rootDir = process.cwd();

const fromFolder = path.join(rootDir, from);
const toFolder = path.join(rootDir, to);

compress({
  from: fromFolder,
  to: toFolder,
  formats
}).catch(console.error)