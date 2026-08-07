const fs = require('fs');
const path = require('path');

const SKIP = ['node_modules', '.git', 'dist', 'build', '.agents', 'plan', 'marketing'];
const CODE_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs'];

function walkCode(dir, results) {
  if (!results) results = [];
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return results; }
  for (const name of entries) {
    if (name.startsWith('.') || name.startsWith('._') || SKIP.includes(name)) continue;
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) { walkCode(full, results); continue; }
    const ext = path.extname(name).toLowerCase();
    if (CODE_EXTS.includes(ext) && stat.size > 0) results.push({ path: full, name, ext, size: stat.size });
  }
  return results;
}

function scanHygiene(projectPath) {
  const files = walkCode(projectPath);
  const issues = [];

  for (const file of files) {
    let content;
    try { content = fs.readFileSync(file.path, 'utf8'); } catch { continue; }
    const lines = content.split('\n');

    // Check for console.log (except in CLI files)
    if (!file.path.includes('packages/cli') && !file.path.includes('server')) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('//')) continue;
        if (/console\.(log|debug|info)\(/.test(line) && !line.includes('// keep')) {
          issues.push({ file: file.path, line: i + 1, type: 'debug-log', msg: 'Debug console.log found' });
        }
      }
    }

    // Check for TODO/FIXME comments (skip scanner files to avoid false positives)
    const isScannerFile = file.name === 'code-hygiene.js' || file.name === 'security-scanner.js';
    if (!isScannerFile) {
      for (let i = 0; i < lines.length; i++) {
        if (/\b(TODO|FIXME|HACK|XXX)\b/.test(lines[i])) {
          issues.push({ file: file.path, line: i + 1, type: 'todo-comment', msg: `TODO/FIXME comment found: ${lines[i].trim().slice(0, 60)}` });
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
