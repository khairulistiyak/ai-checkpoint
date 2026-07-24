#!/usr/bin/env node
'use strict';

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

require('../../packages/cli/index.js').run();
