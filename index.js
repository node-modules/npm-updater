/*!
 * npm-updater - index.js
 */

'use strict'

/**
 * Module dependencies.
 */

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

var conf = config.get()

// get package info from parent package
var packgePath = path.join(__dirname, '../../package.json')
var pkg = {}
try {
  pkg = require(packgePath)
} catch (err) {
  debug('read package %s error: %S', packgePath, err.stack)
}

var DEFAULT_OPTIONS = {
  registry: (pkg.publishConfig && pkg.publishConfig.registry) || 'http://registry.npmjs.com',
  name: pkg.name,
  version: pkg.version,
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

module.exports = function (customOptions) {
  customOptions = customOptions || {}
  var options = {}
  copy(customOptions).and(DEFAULT_OPTIONS).to(options)
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
  if (!needNotify(version, options)) return
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

function needNotify (version, options) {
  if (!conf[options.name] || !conf[options.name][version]) return true

  var last = conf[options.name][version]
  return Date.now() - last > options.interval
}


function notify (version, level, options) {
  debug('notify for remote version: %s, notify level: %s', version, level)
  updateDotConfig(version, options)

  level = LEVEL_MAP[level]

  if (options.abort && level >= LEVEL_MAP[options.level]) {
    var msg = fmt('[npm-updater] %s 的最新版本为 %s，与本地版本 %s 不兼容，请升级后使用。\n%s',
      options.name, version, options.version, options.updateMessage)
    console.error(red(msg))
    process.exit(1)
  }

  var msg = fmt('[npm-updater] %s 的最新版本为 %s，本地版本为 %s，请尽快升级到最新版本。\n%s',
    options.name, version, options.version, options.updateMessage)
  return console.warn(yellow(msg))
}

function updateDotConfig (version, options) {
  conf[options.name] = conf[options.name] || {}
  conf[options.name][version] = Date.now()
  config.set(conf)
}

function red (msg) {
  return fmt('\u001b[31m%s\u001b[39m', msg)
}

function yellow (msg) {
  return fmt('\u001b[33m%s\u001b[39m', msg)
}

function noop () {}
