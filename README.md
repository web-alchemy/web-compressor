# Web Compressor

Utility for creating _gzip_ and _brotli_ pre-compressed files for the static web serving.

## Using as a CLI

```
npx @web-alchemy/web-compressor \
  --from=<input-folder> \
  --to=<output-folder> \
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
  from: '<input-folder>',
  to: '<output-folder>',
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
| --from    | from | Input folder | `process.cwd()` |
| --to      | to   | Output folder | `from` param value|
| --formats | formats | formats of output files | `['gzip', 'brotli']`|
| --ext-white-list | extWhiteList | A list of extensions that will be used to filter the necessary files | `['.html', '.css', '.js', '.json', '.svg', '.txt', '.xml']` |
| --concurrency | concurrency | count of parallel handlers | `os.cpus().length` |
| --file-size | fileSize | File Size Treshold | `0` |


## Enabling precompressed files serving in web servers

- Nginx. [gzip](https://nginx.org/en/docs/http/ngx_http_gzip_static_module.html), [brotli](https://github.com/google/ngx_brotli)
- [Caddy](https://caddyserver.com/docs/caddyfile/directives/file_server)
- [H2O](https://h2o.examp1e.net/configure/file_directives.html#file.send-compressed)