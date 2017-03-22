#!/usr/bin/env node

'use strict';

const options = JSON.parse(process.argv[2]);
if (options.customFormatter) {
  options.formatter = ({ name, version, current, isAbort }) => {
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