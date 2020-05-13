# Web Compressor

Utility for creating _gzip_ and _brotli_ archives for the web

## Using as a CLI

`npx @web-alchemy/web-compressor <input-folder> <output-folder> --gzip --brotli`

## Using as a module

`npm install @web-alchemy/web-compressor`

```javascript
const { compress, formats } = require('@web-alchemy/web-compressor');

compress({
  from: '<input-folder>',
  to: '<output-folder>',
  formats: [formats.GZIP, formats.BROTLI]
});
```
