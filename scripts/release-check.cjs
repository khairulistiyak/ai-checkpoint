#!/usr/bin/env node
const { execSync } = require('child_process');
const chalk = require('chalk');
console.log(chalk.blue('=== ai-checkpoint release gates ==='));

const gates = [
  { cmd: 'npm test', name: 'tests' },
  { cmd: 'npm run build:engine', name: 'engine build' },
  { cmd: 'npm --prefix dashboard run build', name: 'dashboard build' },
  { cmd: 'npm audit --omit=dev', name: 'prod audit' },
  { cmd: './l health', name: 'health' },
  { cmd: './l dry', name: 'dry' },
  { cmd: './l v', name: 'validate' }
];

let passed = true;
for (const gate of gates) {
  console.log(chalk.cyan(`Running ${gate.name}...`));
  try {
    execSync(gate.cmd, { stdio: 'inherit', cwd: process.cwd() });
  } catch (e) {
    console.error(chalk.red(`❌ ${gate.name} failed`));
    passed = false;
  }
}

if (passed) {
  console.log(chalk.green.bold('✅ All release gates passed'));
  process.exit(0);
} else {
  console.error(chalk.red.bold('❌ Release gates failed'));
  process.exit(1);
}
