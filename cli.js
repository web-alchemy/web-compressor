const path = require('path');
const { performance } = require('perf_hooks');

const { compress, formats: FORMATS } = require('./');

const rootDir = process.cwd();
const [ , , from = rootDir, to = rootDir, ...restArgs] = process.argv;

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

const startTime = performance.now();

compress({
  from: fromFolder,
  to: toFolder,
  formats
})
  .then(() => {
    const diffTime = performance.now() - startTime;
    console.log(`The Compression Process took ${diffTime}ms`)
  })
  .catch(console.error)