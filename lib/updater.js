'use strict';

const debug = require('debug')('npm-updater');
const urllib = require('urllib');
const assert = require('assert');
const semverDiff = require('semver-diff');

module.exports = class Updater {
  * check(options) {
    options = this.normalizeOptions(options);
    debug('get options %j', options);

    const url = `${options.registry}/${options.name}/${options.tag}`;
    debug('request %s', url);
    try {
      const response = yield urllib.request(url, { dataType: 'json', followRedirect: true });
      return this.compareVersion(response.data, options);
    } catch (err) {
      console.warn('Got error when check update: %s', err.message);
      debug('err: %j', err);
    }
  }

  normalizeOptions(options) {
    /* istanbul ignore next */
    const pkg = options.package || {};
    options.name = options.name || pkg.name;
    options.version = options.version || pkg.version;
    assert(options.name && options.version, '`options.name` and `options.version` are required and can not get from package');

    options = Object.assign({
      tag: 'latest',
    }, options);

    /* istanbul ignore next */
    options.registry = options.registry || (pkg.publishConfig && pkg.publishConfig.registry) || 'http://registry.npmjs.com';
    options.registry = options.registry.replace(/\/?$/, '');

    return options;
  }

  compareVersion(pkg, options) {
    const type = semverDiff(options.version, pkg.version);
    const result = {
      name: pkg.name,
      version: pkg.version,
      current: options.version,
      type,
    };
    debug('compareVersion: %j', result);
    result.pkg = pkg;
    result.options = options;
    return result;
  }
};
