#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

let cliPath = path.resolve(__dirname, '..', 'packages', 'cli', 'index.js');
if (!fs.existsSync(cliPath)) {
  cliPath = path.resolve(__dirname, '..', '..', 'packages', 'cli', 'index.js');
}
if (!fs.existsSync(cliPath)) {
  // npm global install fallback
  cliPath = path.resolve(__dirname, '..', 'lib', 'node_modules', 'ai-checkpoint', 'packages', 'cli', 'index.js');
}
if (!fs.existsSync(cliPath)) {
  console.error('❌ Cannot find CLI. Please reinstall ai-checkpoint.');
  process.exit(1);
}
require(cliPath).run();

