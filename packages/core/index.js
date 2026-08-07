'use strict';

const { parseProgressText } = require('./parse-progress.js');
const { verifyTargetFileCore, validateProject, findFileRecursively } = require('./validate-project.js');
const { detectProjectRunConfig } = require('./run-config.js');
const { calculateHealthScore } = require('./health-score.js');
const { detectCircularDeps } = require('./circular-dep-detector.js');
const { scanSecurity } = require('./security-scanner.js');
const { scanWorkspaces } = require('./workspace-scanner.js');
const { autoFix } = require('./auto-fixer.js');

module.exports = {
  parseProgressText,
  verifyTargetFileCore,
  validateProject,
  findFileRecursively,
  detectProjectRunConfig,
  calculateHealthScore,
  detectCircularDeps,
  scanSecurity,
  scanWorkspaces,
  autoFix
};
