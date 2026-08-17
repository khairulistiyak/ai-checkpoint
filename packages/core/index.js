'use strict';

const { parseProgressText } = require('./parse-progress.js');
const { verifyTargetFileCore, validateProject, findFileRecursively } = require('./validate-project.js');
const { detectProjectRunConfig, saveCustomRunConfig } = require('./run-config.js');
const { calculateHealth } = require('./health-score.js');
const { detectCircularDeps } = require('./circular-dep-detector.js');
const { scanSecurity } = require('./security-scanner.js');
const { scanWorkspace, walkFiles, countEffectiveLines, checkImports } = require('./workspace-scanner.js');
const { autoFix } = require('./auto-fixer.js');
const { generateQualityReport } = require('./quality-report.js');
const { detectDuplicates } = require('./duplicate-detector.js');
const { buildUtilityIndex, searchUtility } = require('./utility-index.js');
const { generateRefactorProposal } = require('./dry-refactor-engine.js');
const { SKIP_DIRS, CODE_EXTS, JS_EXTS, SCAN_EXTS, JUNK_FILES, JUNK_PATTERNS } = require('./scan-constants.js');
const { walkCodeFiles, walkAllFiles } = require('./file-walker.js');
const { checkBalanced, getEsbuild, checkImportTargets } = require('./syntax-utils.js');

module.exports = {
  parseProgressText,
  verifyTargetFileCore,
  validateProject,
  findFileRecursively,
  detectProjectRunConfig,
  saveCustomRunConfig,
  calculateHealth,
  detectCircularDeps,
  scanSecurity,
  scanWorkspace,
  walkFiles,
  countEffectiveLines,
  checkImports,
  autoFix,
  generateQualityReport,
  detectDuplicates,
  buildUtilityIndex,
  searchUtility,
  generateRefactorProposal,
  SKIP_DIRS,
  CODE_EXTS,
  JS_EXTS,
  SCAN_EXTS,
  JUNK_FILES,
  JUNK_PATTERNS,
  walkCodeFiles,
  walkAllFiles,
  checkBalanced,
  getEsbuild,
  checkImportTargets
};
