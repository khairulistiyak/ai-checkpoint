const fs = require('fs');
const path = require('path');

const FIXABLE = [
  { name: 'console-log', regex: /^\s*console\.(log|debug|info)\s*\(.*\);?\s*$/gm, replacement: '' },
  { name: 'debugger', regex: /^\s*debugger;?\s*$/gm, replacement: '' },
  { name: 'trailing-whitespace', regex: /[ \t]+$/gm, replacement: '' },
];

function autoFix(filePath, dryRun = true) {
  if (!fs.existsSync(filePath)) return { fixed: 0, changes: [] };
  let content = fs.readFileSync(filePath, 'utf8');
  const changes = [];

  for (const fix of FIXABLE) {
    const matches = content.match(fix.regex);
    if (matches && matches.length > 0) {
      changes.push({ file: filePath, pattern: fix.name, count: matches.length });
      if (!dryRun) content = content.replace(fix.regex, fix.replacement);
    }
  }

  if (!dryRun && changes.length > 0) {
    const cleaned = content.split('\n').filter((line, i, arr) => {
      if (line.trim() === '' && i > 0 && arr[i - 1].trim() === '') return false;
      return true;
    }).join('\n');
    fs.writeFileSync(filePath, cleaned, 'utf8');
  }

  return { fixed: changes.length, changes };
}

function autoFixWorkspace(projectPath, dryRun = true) {
  const { walkFiles } = require('./workspace-scanner.js');
  const files = walkFiles(projectPath);
  const codeExts = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts'];
  const allChanges = [];
  let totalFixed = 0;

  for (const f of files) {
    if (!codeExts.includes(f.ext)) continue;
    const result = autoFix(f.path, dryRun);
    totalFixed += result.fixed;
    allChanges.push(...result.changes);
  }

  return { totalFixed, changes: allChanges, dryRun };
}

module.exports = { autoFix, autoFixWorkspace };
