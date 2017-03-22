'use strict'

var config = require('dotfile-config')('.npm_updater.json')
var debug = require('debug')('npm-updater')
var fmt = require('util').format
var ms = require('humanize-ms')
var urllib = require('urllib')
var assert = require('assert')
var semver = require('semver')
var copy = require('copy-to')
var path = require('path')
var fs = require('fs')
var chalk = require('chalk')

var conf = config.get()

var DEFAULT_OPTIONS = {
  abort: true,
  level: 'minor',
  tag: 'latest',
  interval: '1d',
  updateMessage: ''
}

var LEVEL_MAP = {
  major: 2,
  minor: 1,
  patch: 0
}

var DEFAULT_REGISTRY = 'http://registry.npmjs.com'

module.exports = function (customOptions) {
  customOptions = customOptions || {}
  var options = {}
  copy(customOptions).and(DEFAULT_OPTIONS).to(options)

  var pkg = options.package || getDefaultPackage()
  options.name = options.name || pkg.name
  options.version = options.version || pkg.version
  options.registry = options.registry || (pkg.publishConfig && pkg.publishConfig.registry) || DEFAULT_REGISTRY

  debug('get options %j', options)
  assert(options.name && options.version, '`options.name` and `options.version` are required and can not get from package')
  options.registry = options.registry.replace(/\/?$/, '/')
  options.interval = ms(options.interval)
  return checkUpdate(options)
}

function checkUpdate (options) {
  var url = getRemoteUrl(options)
  debug('request %s', url)
  return urllib.request(url, {
    dataType: 'json',
    followRedirect: true
  }).then(function (res) {
    var data = res.data
    debug('get version %s', data.version)
    return verifyVersion(data.version, options)
  }).catch(noop)
}

function getRemoteUrl (options) {
  return fmt('%s%s/%s', options.registry, options.name, options.tag)
}

function verifyVersion (version, options) {
  if (semver.gtr(version, '^' + options.version)) {
    return notify(version, 'major', options)
  }

  if (semver.gtr(version, '~' + options.version)) {
    return notify(version, 'minor', options)
  }

  if (semver.gt(version, options.version)) {
    return notify(version, 'patch', options)
  }
}

function notify (version, level, options) {
  debug('notify for remote version: %s, notify level: %s', version, level)
  level = LEVEL_MAP[level]

  var formatter = typeof options.formatFn === 'function' ? options.formatter : formatter;

  if (options.abort && level >= LEVEL_MAP[options.level]) {
    var msg = formatter({
      version: version,
      isAbort: true,
      options: options,
    })
    console.error(chalk.red(msg))
    process.exit(1)
  }

  if (!needNotify(version, options)) return debug('skip notify due to interval')
  updateDotConfig(version, options)
  var msg = formatter({
    version: version,
    isAbort: false,
    options: options,
  })
  return console.warn(chalk.yellow(msg))
}

function needNotify (version, options) {
  if (!conf[options.name] || !conf[options.name][version]) return true

  var last = conf[options.name][version]
  return Date.now() - last > options.interval
}

function updateDotConfig (version, options) {
  conf[options.name] = conf[options.name] || {}
  conf[options.name][version] = Date.now()
  config.set(conf)
}

function formatter(obj) {
  var version = obj.version;
  var isAbort = obj.isAbort;
  var options = obj.options;
  var name = options.displayName || options.name;
  var msg = fmt('[%s] new version available: %s → %s %s %s', name, options.version, version, isAbort ? '(not compatible, must update to use this)' : '', options.updateMessage);
  return msg;
}

function getDefaultPackage() {
  // get package info from parent package
  var packagePath = path.join(__dirname, '../../package.json')
  var pkg = {}
  try {
    pkg = require(packagePath)
  } catch (err) {
    debug('read package %s error: %s', packagePath, err.stack)
  }
  return pkg
}

function noop () {}
