const fs = require('fs');
const path = require('path');

const PATTERNS = [
  { name: 'eval-usage', regex: new RegExp('\\b' + 'eval\\s*\\(', 'g'), severity: 'critical', msg: 'eval() is dangerous' },
  { name: 'git-conflict', regex: /^[<>=]{7}/gm, severity: 'critical', msg: 'Git conflict marker' },
  { name: 'hardcoded-secret', regex: /(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/gi, severity: 'critical', msg: 'Possible hardcoded secret' },
  { name: 'debugger', regex: /\bdebugger\b/g, severity: 'warning', msg: 'debugger statement' },
  { name: 'console-log', regex: /\bconsole\.(log|debug|info)\s*\(/g, severity: 'warning', msg: 'Debug console statement' },
  { name: 'todo-fixme', regex: /\b(TODO|FIXME|HACK|XXX|TEMP)\b/g, severity: 'warning', msg: 'Unresolved comment marker' },
  { name: 'empty-catch', regex: /catch\s*\([^)]*\)\s*\{\s*\}/g, severity: 'warning', msg: 'Empty catch block' },
];

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '.agents', 'plan'];
const CODE_EXTS = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts'];

function walkCodeFiles(dir, results = []) {
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return results; }
  for (const name of entries) {
    if (name.startsWith('.') || name.startsWith('._')) continue;
    if (SKIP_DIRS.includes(name)) continue;
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) { walkCodeFiles(full, results); continue; }
    if (CODE_EXTS.includes(path.extname(name).toLowerCase()) && stat.size > 0) {
      results.push(full);
    }
  }
  return results;
}

function scanSecurity(projectPath) {
  const files = walkCodeFiles(projectPath);
  const issues = [];
  for (const fp of files) {
    if (path.basename(fp) === 'security-scanner.js') continue;
    let content;
    try { content = fs.readFileSync(fp, 'utf8'); } catch { continue; }
    const lines = content.split('\n');
    for (const pattern of PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        if (pattern.regex.test(lines[i])) {
          issues.push({ file: fp, line: i + 1, pattern: pattern.name, severity: pattern.severity, msg: pattern.msg });
        }
        pattern.regex.lastIndex = 0;
      }
    }
  }
  return { filesScanned: files.length, issues };
}

module.exports = { scanSecurity };
