'use strict';

const path = require('path');
const debug = require('debug')('npm-updater');
const chalk = require('chalk');
const Updater = require('./lib/updater');
const co = require('co');
const ms = require('humanize-ms');
const ConfigStore = require('configstore');
const store = new ConfigStore('npm_updater', {});

module.exports = options => {
  return co(function* () {
    return yield checkUpdate(options);
  });
};

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
function* checkUpdate(options) {
  const updater = new Updater();
  /* istanbul ignore next */
  options.package = options.package || getDefaultPackage();
  options.abort = options.hasOwnProperty('abort') ? options.abort : true;
  options.level = options.level || 'minor';
  options.interval = ms(options.interval || '1d');
  options.updateMessage = options.updateMessage || '';

  // check npm
  const result = yield updater.check(options);
  if (!result) return undefined;

  const checkFlag = checkTimestamp(result, options);
  result.isAbort = options.abort && compareVersion(result.type, options.level) >= 0;

  if (result.type === null || (!checkFlag && !result.isAbort)) {
    return result;
  }

  // print
  const formatFn = typeof options.formatter === 'function' ? options.formatter : formatter;
  const msg = formatFn(result);
  if (result.isAbort) {
    console.error(msg);
    process.exit(1);
  } else {
    console.warn(msg);
  }
  return result;
}

function checkTimestamp(result, options) {
  const version = String(result.version).replace(/\./g, '_');
  const key = `${options.name}.${version}`;
  debug('notify interval: store[%s] = %j', options.name, store.get(options.name));
  const last = store.get(key);
  if (!last || Date.now() - last > options.interval) {
    store.set(key, Date.now());
    return true;
  }

  return false;
}

function formatter(args) {
  const name = args.name;
  const version = args.version;
  const current = args.current;
  const isAbort = args.isAbort;
  const options = args.options;
  const updateMessage = options.updateMessage || '';
  if (isAbort) {
    return chalk.red(`[${name}] new version available: ${current} → ${version}, not compatible, you must update to use this.${updateMessage}`);
  }
  return chalk.yellow(`[${name}] new version available: ${current} → ${version}.${updateMessage}`);
}

function compareVersion(x, y) {
  const LEVEL_MAP = {
    major: 5,
    minor: 4,
    patch: 3,
    prerelease: 2,
    build: 1,
    null: 0,
  };
  return LEVEL_MAP[x] - LEVEL_MAP[y];
}

/* istanbul ignore next */
function getDefaultPackage() {
  // get package info from parent package
  const packagePath = path.join(__dirname, '../../package.json');
  let pkg = {};
  try {
    pkg = require(packagePath);
  } catch (err) {
    debug('read package %s error: %s', packagePath, err.message);
  }
  return pkg;
}

module.exports.Updater = Updater;

