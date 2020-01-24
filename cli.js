const path = require('path');

const { compress, formats: FORMATS } = require('./');

const [ , , from, to, ...restArgs] = process.argv;

const rootDir = process.cwd();
const fromFolder = path.isAbsolute(from) ? from : path.join(rootDir, from);
const toFolder = path.isAbsolute(to) ? to : path.join(rootDir, to);
const formats = [];

if (restArgs.includes('--gzip')) {
  formats.push(FORMATS.GZIP);
}

if (restArgs.includes('--brotli')) {
  formats.push(FORMATS.BROTLI);
}

if (formats.length === 0) {
  formats.push(FORMATS.GZIP);
}

compress({
  from: fromFolder,
  to: toFolder,
  formats
}).catch(console.error)