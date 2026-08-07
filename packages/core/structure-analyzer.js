const fs = require('fs');
const path = require('path');

const JUNK_FILES = [
  '.DS_Store', 'Thumbs.db', 'desktop.ini', '._.DS_Store',
  'npm-debug.log', 'yarn-error.log', 'yarn-debug.log',
  'temp.js', 'test.js', 'untitled.js', 'copy.js',
  'old.js', 'backup.js',
];

const JUNK_PATTERNS = [
  /^\.\_/, /\.bak$/i, /\.orig$/i, /\.swp$/i, /~$/,
  /\.tmp$/i,
];

const SKIP = ['node_modules', '.git', 'dist', 'build', '.agents', '_archive'];

function walkAll(dir, depth, results) {
  if (depth === undefined) depth = 0;
  if (results === undefined) results = [];
  if (depth > 15) return results;
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return results; }
  for (let i = 0; i < entries.length; i++) {
    const name = entries[i];
    if (SKIP.indexOf(name) >= 0) continue;
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) continue;
    const isDir = stat.isDirectory();
    results.push({ path: full, name: name, isDir: isDir, size: stat.size, depth: depth });
    if (isDir) walkAll(full, depth + 1, results);
  }
  return results;
}

function analyzeStructure(projectPath) {
  const all = walkAll(projectPath);
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
