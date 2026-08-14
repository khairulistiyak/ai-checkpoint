# Phase 40: Core Scanner Engine

---

### Step 40.1 — Workspace Syntax Scanner (`packages/core/workspace-scanner.js`)
- **File:** `packages/core/workspace-scanner.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '.agents', 'plan', '.vscode', '.github'];
const SCAN_EXTS = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts', '.json', '.css', '.sh'];

function walkFiles(dir, results = []) {
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return results; }
  for (const name of entries) {
    if (name.startsWith('.') || name.startsWith('._')) continue;
    if (SKIP_DIRS.includes(name)) continue;
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) { walkFiles(full, results); continue; }
    const ext = path.extname(name).toLowerCase();
    if (SCAN_EXTS.includes(ext) && stat.size > 0) {
      results.push({ path: full, ext });
    }
  }
  return results;
}

function checkBalanced(content, open, close, label) {
  const stack = [];
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (open.includes(ch)) stack.push(ch);
    else if (close.includes(ch)) {
      const expected = open[close.indexOf(ch)];
      if (stack.pop() !== expected) return `Unbalanced ${label} at position ${i}`;
    }
  }
  return stack.length > 0 ? `${label} has ${stack.length} unclosed pair(s)` : null;
}

function checkImports(filePath) {
  const warnings = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const re = /(?:from\s+|require\(\s*)['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const spec = m[1];
    if (!spec.startsWith('.')) continue;
    const target = path.resolve(path.dirname(filePath), spec);
    const exts = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '.cjs', '.mjs'];
    const found = exts.some(e => fs.existsSync(target + e)) || fs.existsSync(path.join(target, 'index.js'));
    if (!found) warnings.push({ file: filePath, error: `Missing import: "${spec}"`, type: 'broken-import' });
  }
  return warnings;
}

function scanFile(fileInfo) {
  const { path: fp, ext } = fileInfo;
  const errors = [];
  try {
    if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
      try { execFileSync(process.execPath, ['-c', fp], { stdio: 'pipe' }); }
      catch (e) { errors.push({ file: fp, error: (e.stderr || e.message).toString().split('\n')[0], type: 'syntax' }); }
      errors.push(...checkImports(fp));
    } else if (ext === '.jsx' || ext === '.tsx' || ext === '.ts') {
      const content = fs.readFileSync(fp, 'utf8');
      const err = checkBalanced(content, '([{', ')]}', 'bracket');
      if (err) errors.push({ file: fp, error: err, type: 'syntax' });
      errors.push(...checkImports(fp));
    } else if (ext === '.json') {
      try { JSON.parse(fs.readFileSync(fp, 'utf8')); }
      catch (e) { errors.push({ file: fp, error: e.message.split('\n')[0], type: 'syntax' }); }
    } else if (ext === '.css') {
      const content = fs.readFileSync(fp, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/['"][^'"]*['"]/g, '""');
      const err = checkBalanced(content, '{', '}', 'brace');
      if (err) errors.push({ file: fp, error: err, type: 'syntax' });
    } else if (ext === '.sh') {
      try { execFileSync('bash', ['-n', fp], { stdio: 'pipe' }); }
      catch (e) { errors.push({ file: fp, error: (e.stderr || e.message).toString().split('\n')[0], type: 'syntax' }); }
    }
  } catch (e) { /* skip unreadable files */ }
  return errors;
}

function countEffectiveLines(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
      .filter(l => l.trim() && !/^\s*(\/\/|#(?!!)|\/\*|\*|<!--)/.test(l)).length;
  } catch { return 0; }
}

function checkRule0(files) {
  const violations = [];
  const codeExts = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts'];
  for (const f of files) {
    if (!codeExts.includes(f.ext)) continue;
    const lines = countEffectiveLines(f.path);
    if (lines > 150) violations.push({ file: f.path, error: `${lines} effective lines (limit: 150)`, type: 'rule0' });
  }
  return violations;
}

function scanWorkspace(projectPath) {
  const files = walkFiles(projectPath);
  const issues = [];
  for (const f of files) { issues.push(...scanFile(f)); }
  issues.push(...checkRule0(files));
  return { filesScanned: files.length, issues };
}

module.exports = { scanWorkspace, walkFiles, countEffectiveLines, checkImports };
```
- **Done-check:** `node -e "const {scanWorkspace}=require('./packages/core/workspace-scanner.js'); console.log(typeof scanWorkspace)"` → `function`
- **Depends:** None

---

### Step 40.2 — Security Pattern Scanner (`packages/core/security-scanner.js`)
- **File:** `packages/core/security-scanner.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');

const PATTERNS = [
  { name: 'eval-usage', regex: /\beval\s*\(/g, severity: 'critical', msg: 'eval() is dangerous' },
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
```
- **Done-check:** `node -e "const {scanSecurity}=require('./packages/core/security-scanner.js'); console.log(typeof scanSecurity)"` → `function`
- **Depends:** 40.1

---

### Step 40.3 — Circular Dependency Detector (`packages/core/circular-dep-detector.js`)
- **File:** `packages/core/circular-dep-detector.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '.agents', 'plan'];
const CODE_EXTS = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts'];

function getImports(filePath) {
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { return []; }
  const imports = [];
  const re = /(?:from\s+|require\(\s*)['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    if (!m[1].startsWith('.')) continue;
    const resolved = path.resolve(path.dirname(filePath), m[1]);
    const exts = ['', '.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs'];
    for (const e of exts) {
      if (fs.existsSync(resolved + e)) { imports.push(resolved + e); break; }
    }
  }
  return imports;
}

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
    if (CODE_EXTS.includes(path.extname(name).toLowerCase())) results.push(full);
  }
  return results;
}

function detectCircularDeps(projectPath) {
  const files = walkCodeFiles(projectPath);
  const graph = new Map();
  for (const f of files) graph.set(f, getImports(f));

  const cycles = [];
  const visited = new Set();
  const inStack = new Set();

  function dfs(node, chain) {
    if (inStack.has(node)) {
      const start = chain.indexOf(node);
      if (start >= 0) cycles.push(chain.slice(start).map(p => path.relative(projectPath, p)));
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    inStack.add(node);
    chain.push(node);
    for (const dep of (graph.get(node) || [])) dfs(dep, [...chain]);
    inStack.delete(node);
  }

  for (const f of files) { if (!visited.has(f)) dfs(f, []); }
  return { cycles };
}

module.exports = { detectCircularDeps };
```
- **Done-check:** `node -e "const {detectCircularDeps}=require('./packages/core/circular-dep-detector.js'); console.log(typeof detectCircularDeps)"` → `function`
- **Depends:** 40.2

---

### Step 40.4 — Auto-Fix Engine (`packages/core/auto-fixer.js`)
- **File:** `packages/core/auto-fixer.js`
- **Action:** CREATE
- **Content:**
```js
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
```
- **Done-check:** `node -e "const {autoFix}=require('./packages/core/auto-fixer.js'); console.log(typeof autoFix)"` → `function`
- **Depends:** 40.3

---

### Step 40.5 — Health Score Calculator (`packages/core/health-score.js`)
- **File:** `packages/core/health-score.js`
- **Action:** CREATE
- **Content:**
```js
const { scanWorkspace } = require('./workspace-scanner.js');
const { scanSecurity } = require('./security-scanner.js');

function calculateHealth(projectPath, options = {}) {
  const workspace = scanWorkspace(projectPath);
  const security = scanSecurity(projectPath);

  const syntaxErrors = workspace.issues.filter(i => i.type === 'syntax').length;
  const brokenImports = workspace.issues.filter(i => i.type === 'broken-import').length;
  const rule0Violations = workspace.issues.filter(i => i.type === 'rule0').length;
  const criticalSecurity = security.issues.filter(i => i.severity === 'critical').length;
  const warningSecurity = security.issues.filter(i => i.severity === 'warning').length;

  let score = 100;
  score -= syntaxErrors * 10;
  score -= brokenImports * 5;
  score -= rule0Violations * 8;
  score -= criticalSecurity * 15;
  score -= warningSecurity * 2;
  if (score < 0) score = 0;

  const allIssues = [
    ...workspace.issues.map(i => ({ ...i, file: i.file })),
    ...security.issues.map(i => ({ file: i.file, line: i.line, error: i.msg, type: 'security', severity: i.severity })),
  ];

  return {
    score,
    maxScore: 100,
    passed: score === 100,
    filesScanned: workspace.filesScanned,
    breakdown: { syntaxErrors, brokenImports, rule0Violations, criticalSecurity, warningSecurity },
    issues: allIssues,
  };
}

module.exports = { calculateHealth };
```
- **Done-check:** `node -e "const {calculateHealth}=require('./packages/core/health-score.js'); console.log(typeof calculateHealth)"` → `function`
- **Depends:** 40.4
