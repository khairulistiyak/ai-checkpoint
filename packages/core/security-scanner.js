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

const { walkCodeFiles } = require('./file-walker.js');

function scanSecurity(projectPath) {
  const files = walkCodeFiles(projectPath).map(f => f.path);
  const issues = [];
  for (const fp of files) {
    if (path.basename(fp) === 'security-scanner.js') continue;
    let content;
    try { content = fs.readFileSync(fp, 'utf8'); } catch { continue; }
    const lines = content.split('\n');
    for (const pattern of PATTERNS) {
      if (pattern.name === 'console-log' && (fp.includes('/cli/') || fp.includes('/scripts/'))) continue;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('// keep')) continue;
        if (pattern.name === 'debugger' && /regex|new RegExp|replace|test|match|pattern/i.test(line)) continue;
        if (pattern.name === 'todo-fixme' && /regex|new RegExp|replace|test|match|pattern/i.test(line)) continue;
        if (pattern.regex.test(line)) {
          issues.push({ file: fp, line: i + 1, pattern: pattern.name, severity: pattern.severity, msg: pattern.msg });
        }
        pattern.regex.lastIndex = 0;
      }
    }
  }
  return { filesScanned: files.length, issues };
}

module.exports = { scanSecurity };
