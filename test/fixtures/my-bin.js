#!/usr/bin/env node

'use strict';

const options = JSON.parse(process.argv[2]);
if (options.customFormatter) {
  options.formatter = args => {
    const name = args.name;
    const version = args.version;
    const current = args.current;
    const isAbort = args.isAbort;
    return `
      name: ${name},
      version: ${version},
      current: ${current},
      isAbort: ${isAbort}
    `;
  }
}
require('../../')(options).catch(err => {
  console.error(err);
});