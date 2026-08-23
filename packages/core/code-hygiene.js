const fs = require('fs');

const { walkCodeFiles } = require('./file-walker.js');

function scanHygiene(projectPath) {
  const files = walkCodeFiles(projectPath, { withMeta: true });
  const issues = [];

  for (const file of files) {
    let content;
    try { content = fs.readFileSync(file.path, 'utf8'); } catch { continue; }
    const lines = content.split('\n');

    // Check for console statements (except in CLI & script files) // keep
    if (!file.path.includes('packages/cli') && !file.path.includes('server') && !file.path.includes('scripts')) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('//')) continue;
        if (/console\.(log|debug|info)\(/.test(line) && !line.includes('// keep')) { // keep
          issues.push({ file: file.path, line: i + 1, type: 'debug-log', msg: 'Debug console.log found' });
        }
      }
    }

    // Check for unresolved comments (skip scanner files to avoid false positives) // keep
    const isScannerFile = file.name === 'code-hygiene.js' || file.name === 'security-scanner.js';
    if (!isScannerFile) {
      for (let i = 0; i < lines.length; i++) {
        if (/\b(TODO|FIXME|HACK|XXX)\b/.test(lines[i])) { // keep
          issues.push({ file: file.path, line: i + 1, type: 'todo-comment', msg: `Unresolved comment found: ${lines[i].trim().slice(0, 60)}` }); // keep
        }
      }
    }

    // Check for trailing whitespace on more than 5 lines
    let trailingCount = 0;
    for (const line of lines) { if (line !== line.trimEnd() && line.trim().length > 0) trailingCount++; }
    if (trailingCount > 5) {
      issues.push({ file: file.path, line: 0, type: 'trailing-whitespace', msg: `${trailingCount} lines with trailing whitespace` });
    }
  }

  return { filesChecked: files.length, issues };
}

module.exports = { scanHygiene };
