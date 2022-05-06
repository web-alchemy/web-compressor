# Web Compressor

Utility for creating _gzip_ and _brotli_ pre-compressed files for a static web serving.

## Using as a CLI

Base example (run inside folder with static assets):
```
npx @web-alchemy/web-compressor
```

Example with all parameters:
```
npx @web-alchemy/web-compressor \
  --input=<input-folder> \
  --output=<output-folder> \
  --formats=gzip,brotli \
  --ext-white-list=.html,.css,.js,.json,.svg,.txt,.xml \
  --concurrency=4 \
  --file-size=4096
```

## Using as a module

`npm install @web-alchemy/web-compressor`

```javascript
const { compress, formats } = require('@web-alchemy/web-compressor');

compress({
  input: '<input-folder>',
  output: '<output-folder>',
  formats: [formats.GZIP, formats.BROTLI]
  extWhiteList: ['.html', '.css', '.js', '.json', '.svg', '.txt', '.xml'],
  concurrency: 4,
  fileSize: 4096
}).then(() => {
  // operation end
}).catch(() => {
  // operation error
});
```

## Params Description

| CLI Param | Module Param | Description | default value |
| --- | --- | --- | --- |
| `--from` (alias `--input`) | `from` (alias `input`) | Input folder | `process.cwd()` |
| `--to` (alias `--output`) | `to` (alias `output`)| Output folder | `from` param value|
| `--formats` | `formats` | Formats of output files | `['gzip', 'brotli']`|
| `--ext-white-list` | `extWhiteList` | A list of extensions that will be used to filter the necessary files | `['.html', '.css', '.js', '.json', '.svg', '.txt', '.xml']` |
| `--concurrency` | `concurrency` | number of parallel handlers | `os.cpus().length` |
| `--file-size` | `fileSize` | File size treshold in bytes. Files smaller than this size will be ignored | `0` |


## Enabling precompressed files serving in web servers

- Nginx. [gzip](https://nginx.org/en/docs/http/ngx_http_gzip_static_module.html), [brotli](https://github.com/google/ngx_brotli)
- [Caddy](https://caddyserver.com/docs/caddyfile/directives/file_server)
- [H2O](https://h2o.examp1e.net/configure/file_directives.html#file.send-compressed)