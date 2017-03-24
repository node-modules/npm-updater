'use strict';

const assert = require('assert');
const Updater = require('../../lib/updater');

describe('test/lib/updater.test.js', () => {
  let updater;
  before(() => {
    updater = new Updater();
  });

  it('should check update major', function* () {
    const result = yield updater.check({
      package: {
        name: 'npm-updater',
        version: '1.0.0',
      },
    });
    assert(result.name === 'npm-updater');
    assert(result.version !== '1.0.0');
    assert(result.current === '1.0.0');
    assert(result.type === 'major');
    assert(result.pkg);
  });

  it('should not need to update', function* () {
    const result = yield updater.check({
      package: {
        name: 'npm-updater',
        version: '99.0.0',
      },
    });
    assert(result.name === 'npm-updater');
    assert(result.version !== '99.0.0');
    assert(result.current === '99.0.0');
    assert(result.type === null);
    assert(result.pkg);
  });
});
