'use strict';

const coffee = require('coffee');
const path = require('path');

describe('test/index.test.js', () => {

  function fork(options, meta) {
    meta = meta || {};
    const bin = meta.bin || path.join(__dirname, './fixtures/my-bin');
    const cwd = path.join(__dirname, './fixtures');

    if (meta.cache !== true) {
      const ConfigStore = require('configstore');
      const store = new ConfigStore('npm_updater', {});
      store.delete(options.name);
    }

    return coffee.fork(bin, [ JSON.stringify(options) ], { cwd, env: meta.env });
  }

  it('should notify new version', done => {
    fork({ name: 'npm-updater', version: '2.0.0' })
      // .debug()
      .expect('stderr', /new version available: 2.0.0.*?\d+\.\d+\.\d+/)
      .end(done);
  });

  it('should notify major version', done => {
    fork({ name: 'npm-updater', version: '1.0.0' })
      // .debug()
      .expect('stderr', /new version available: 1.0.0.*?\d+\.\d+\.\d+/)
      .expect('stderr', /not compatible/)
      .expect('code', 1)
      .end(done);
  });

  it('should notify major version without abort', done => {
    fork({ name: 'npm-updater', version: '1.0.0', abort: false })
      // .debug()
      .expect('stderr', /new version available: 1.0.0.*?\d+\.\d+\.\d+/)
      .expect('code', 0)
      .end(done);
  });

  it('should notify major version with custom formatter', done => {
    fork({ name: 'npm-updater', version: '1.0.0', customFormatter: true })
      // .debug()
      .expect('stderr', /name: npm-updater/)
      .expect('stderr', /version: \d+\.\d+\.\d+/)
      .expect('stderr', /current: 1\.0\.0/)
      .expect('stderr', /isAbort: true/)
      .expect('code', 1)
      .end(done);
  });

  it('should not notify at interval ', function* () {
    yield fork({ name: 'npm-updater', version: '2.0.0', abort: false })
      // .debug()
      .expect('stderr', /new version available: 2.0.0.*?\d+\.\d+\.\d+/)
      .end();

    yield fork({ name: 'npm-updater', version: '2.0.0', abort: false }, { cache: true })
      // .debug()
      .expect('stdout', '')
      .expect('stderr', '')
      .end();

    yield fork({ name: 'npm-updater', version: '1.0.0' })
      // .debug()
      .expect('stderr', /new version available: 1.0.0.*?\d+\.\d+\.\d+/)
      .expect('stderr', /not compatible/)
      .expect('code', 1)
      .end();
  });

  it('should not notify when versions are identical or the remote is lower than the local', function* () {
    const pkg = require('../package.json');
    yield fork({ name: 'npm-updater', version: pkg.version })
      // .debug()
      .expect('stdout', '')
      .expect('stderr', '')
      .end();

    yield fork({ name: 'npm-updater', version: '99.0.0' })
      // .debug()
      .expect('stdout', '')
      .expect('stderr', '')
      .end();
  });

  it('should ignore when network error', function* () {
    yield fork({ name: 'npm-updater', version: '2.0.0', registry: 'http://not-exist' })
      // .debug()
      .expect('stdout', '')
      .expect('stderr', /Got error when check update: getaddrinfo ENOTFOUND/)
      .end();
  });
});
