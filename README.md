npm-updater
---------------

[![NPM version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/npm-updater.svg?style=flat-square
[npm-url]: https://npmjs.org/package/npm-updater

Prompt update of npm package.

## Installation

```bash
$ npm install npm-updater
```

## Usage

```js
var updater = require('npm-updater')

updater({
  package: require('./package.json'),
  level: 'major'
}).then(execCommands)
```

### Options

- `package`: pass module's `package.json` object, default will try to get from `../../package.json`.
- `registry`: support customize registry, default get `publishConfig.registry` from parent package.
- `name`: package name, default get from parent package.
- `version`: pkg version,default get from parent package.
- `tag`: compare with which tag, default to `latest`.
- `abort`: If remote version changed, should we abort? default to `true`.
- `level`: abort level, default to `minor`.
- `interval`: prompt interval, default to `1d`.
- `updateMessage`: appending update message.

## Notice

Please make sure you pacakge's initial version is bigger than `1.0.0`.

## License

MIT
