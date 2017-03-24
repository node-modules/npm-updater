# npm-updater

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/npm-updater.svg?style=flat-square
[npm-url]: https://npmjs.org/package/npm-updater
[travis-image]: https://img.shields.io/travis/node-modules/npm-updater.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/npm-updater
[codecov-image]: https://codecov.io/gh/node-modules/npm-updater/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/node-modules/npm-updater
[david-image]: https://img.shields.io/david/node-modules/npm-updater.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/npm-updater
[snyk-image]: https://snyk.io/test/npm/npm-updater/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/npm-updater
[download-image]: https://img.shields.io/npm/dm/npm-updater.svg?style=flat-square
[download-url]: https://npmjs.org/package/npm-updater

Check update of npm package.

## Installation

```bash
$ npm i npm-updater --save
```

## Usage

```js
const updater = require('npm-updater');

updater({
  package: require('./package.json'),
  level: 'major',
}).then(result => {
  console.log(result.name, result.version, result.current, result.type);
});
```

### Options

```js
/**
 * check a package lastest version
 * @param {Object} options - query Object
 * @param {Object} options.name - package name, default get from parent package.
 * @param {Object} options.version - package current version, default get from parent package.
 * @param {Object} [options.package] - pass module's `package.json` object
 * @param {String} [options.registry] - publishConfig.registry || npm
 * @param {String} [options.tag] - compare with which tag, default to `latest`.
 * @param {String} [options.interval] - notify interval, default to 1d.
 * @param {Boolean} [options.abort] - If remote version changed, should we abort? default to `true`.
 * @param {String} [options.level] - abort level, default to `minor`.
 * @param {String} [options.updateMessage] - appending update message.
 * @param {Function} [options.formatter] - custom format fn, with args { name, version, current, isAbort, options }.
 * @return {Object} - { name, version, current, type, pkg, options }, type: latest, major, minor, patch, prerelease, build, null
 */
 ```

 ## Notice

Please make sure you pacakge's initial version is bigger than `1.0.0`.

## License

MIT