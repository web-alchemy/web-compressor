const path = require('path');
const { performance } = require('perf_hooks');

const { compress, formats: FORMATS } = require('./');

const rootDir = process.cwd();
const [ , , ...restArgs] = process.argv;

const params = Object.fromEntries(restArgs.map(param => {
  const pair = param.split('=');
  return [
    pair[0].slice(2),
    (pair[1] === undefined || pair[1] === null) ? true : pair[1]
  ]
}));

const from = params.input || params.from;
const to = params.output || params.to || from;
const fromFolder = path.isAbsolute(from) ? from : path.join(rootDir, from);
const toFolder = path.isAbsolute(to) ? to : path.join(rootDir, to);

const formats = params['formats']
  ? params['formats'].split(',')
  : [FORMATS.GZIP, FORMATS.BROTLI];

if (params['ext-white-list']) {
  params['ext-white-list'] = params['ext-white-list'].split(',');
}

if (params['file-size']) {
  const fileSize = parseFloat(params['file-size']);
  if (typeof fileSize === 'number' && !Number.isNaN(fileSize) && Number.isFinite(fileSize)) {
    params['file-size'] = fileSize;
  } else {
    delete params['file-size'];
  }
}

if (params['concurrency']) {
  const concurrency = parseInt(params['concurrency']);
  if (typeof concurrency === 'number' && !Number.isNaN(concurrency) && Number.isFinite(concurrency)) {
    params['concurrency'] = concurrency;
  } else {
    delete params['concurrency'];
  }
}

const startTime = performance.now();

compress({
  from: fromFolder,
  to: toFolder,
  formats,
  extWhiteList: params['ext-white-list'],
  concurrency: params.concurrency,
  fileSize: params['file-size']
})
  .then(() => {
    const diffTime = performance.now() - startTime;
    console.log(`The Compression Process took ${diffTime}ms`)
  })
  .catch(console.error)