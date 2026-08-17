const { JUNK_FILES, JUNK_PATTERNS } = require('./scan-constants.js');
const { walkAllFiles } = require('./file-walker.js');

function analyzeStructure(projectPath) {
  const all = walkAllFiles(projectPath, { withDepth: true });
  const issues = [];

  for (const item of all) {
    if (!item.isDir) {
      if (JUNK_FILES.includes(item.name)) {
        issues.push({ file: item.path, type: 'junk-file', msg: `Junk file: ${item.name}` });
      }
      for (const pat of JUNK_PATTERNS) {
        if (pat.test(item.name)) {
          issues.push({ file: item.path, type: 'junk-pattern', msg: `Junk pattern match: ${item.name}` });
          break;
        }
      }
      if (item.size === 0 && /\.(js|jsx|ts|tsx|css)$/.test(item.name)) {
        issues.push({ file: item.path, type: 'empty-file', msg: `Empty file: ${item.name}` });
      }
    }
    if (item.isDir && item.name.startsWith('_') && item.depth > 0) {
      issues.push({ file: item.path, type: 'underscore-dir', msg: `Underscore dir: ${item.name}` });
    }
  }

  return { totalFiles: all.filter(a => !a.isDir).length, totalDirs: all.filter(a => a.isDir).length, issues };
}

module.exports = { analyzeStructure };
