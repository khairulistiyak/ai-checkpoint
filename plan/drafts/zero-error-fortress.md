# 🛡️ Fortress-Grade Zero-Error Guarantee System

> প্রতিটি step-এ সম্পূর্ণ কোড দেওয়া আছে। শুধু copy-paste করলেই হবে।

---

## Phase 40: Core Scanner Engine

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
    if (name.startsWith('.') || name.startsWith('._') || SKIP_DIRS.includes(name)) continue;
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

---

## Phase 41: CLI Health Command

### Step 41.1 — Health Command (`packages/cli/cmd-health.js`)
- **File:** `packages/cli/cmd-health.js`
- **Action:** CREATE
- **Content:**
```js
const path = require('path');
const { log, colors, getProgressBar } = require('./colors.js');
const { calculateHealth } = require('../core/health-score.js');

function healthCommand(args) {
  const deep = args.includes('--deep');
  const fix = args.includes('--fix');
  const json = args.includes('--json');

  if (fix) {
    const { autoFixWorkspace } = require('../core/auto-fixer.js');
    const result = autoFixWorkspace(process.cwd(), false);
    if (json) { console.log(JSON.stringify(result)); return; }
    if (result.totalFixed === 0) { log.success('Nothing to fix. Workspace is clean!'); return; }
    log.success(`Auto-fixed ${result.totalFixed} issue(s):`);
    result.changes.forEach(c => console.log(`  🔧 ${path.relative(process.cwd(), c.file)}: ${c.pattern} (×${c.count})`));
    return;
  }

  const health = calculateHealth(process.cwd());

  if (deep) {
    try {
      const { detectCircularDeps } = require('../core/circular-dep-detector.js');
      const { cycles } = detectCircularDeps(process.cwd());
      if (cycles.length > 0) {
        health.score = Math.max(0, health.score - cycles.length * 7);
        health.breakdown.circularDeps = cycles.length;
        cycles.forEach(c => health.issues.push({ file: c.join(' → '), error: 'Circular dependency', type: 'circular' }));
      }
    } catch {}
  }

  health.passed = health.score === 100;

  if (json) { console.log(JSON.stringify(health)); return; }

  const b = health.breakdown;
  const scoreColor = health.score === 100 ? colors.green : health.score >= 80 ? colors.yellow : colors.red;

  log.header('Workspace Health Report');
  console.log(`  📄 Files Scanned:     ${health.filesScanned}`);
  console.log(`  ${b.syntaxErrors === 0 ? '✅' : '❌'} Syntax Errors:     ${b.syntaxErrors}`);
  console.log(`  ${b.brokenImports === 0 ? '✅' : '❌'} Broken Imports:    ${b.brokenImports}`);
  console.log(`  ${b.rule0Violations === 0 ? '✅' : '❌'} Rule 0 Violations: ${b.rule0Violations}`);
  console.log(`  ${b.criticalSecurity === 0 ? '✅' : '🔴'} Security Critical: ${b.criticalSecurity}`);
  console.log(`  ${b.warningSecurity === 0 ? '✅' : '⚠️'} Security Warnings: ${b.warningSecurity}`);
  if (b.circularDeps !== undefined) {
    console.log(`  ${b.circularDeps === 0 ? '✅' : '❌'} Circular Deps:    ${b.circularDeps}`);
  }
  console.log('');
  console.log(`  ${scoreColor}🏆 HEALTH SCORE: ${health.score}/100 ${getProgressBar(health.score, 20)}${colors.reset}`);

  if (health.issues.length > 0 && health.issues.length <= 10) {
    console.log('');
    health.issues.forEach(i => {
      const rel = path.relative(process.cwd(), i.file);
      console.log(`  ${i.type === 'syntax' || i.severity === 'critical' ? '❌' : '⚠️'}  ${rel}${i.line ? ':' + i.line : ''} — ${i.error}`);
    });
  } else if (health.issues.length > 10) {
    console.log(`\n  📋 ${health.issues.length} issues found. Run with --json for full list.`);
  }

  console.log('');
  if (health.passed) log.success('Workspace is clean! ✨');
  else { log.error(`Fix ${health.issues.length} issue(s) to reach 100%. Try: ./l health --fix`); process.exit(1); }
}

module.exports = { healthCommand };
```
- **Done-check:** `node -c packages/cli/cmd-health.js` → exits 0
- **Depends:** 40.5

---

### Step 41.2 — Register Health Command in CLI Router (`packages/cli/index.js`)
- **File:** `packages/cli/index.js`
- **Action:** EDIT
- **Content:** Find the switch/case block for commands. Add this case:
```js
case 'health':
case 'h':
  require('./cmd-health.js').healthCommand(args);
  break;
```
- **Done-check:** `./l health --json | head -c 20` → starts with `{"`
- **Depends:** 41.1

---

## Phase 42: Gate Enforcement

### Step 42.1 — Upgrade Complete with Workspace Gate (`packages/cli/cmd-complete.js`)
- **File:** `packages/cli/cmd-complete.js`
- **Action:** EDIT
- **Content:** After the `syntaxCheck` and `checkIntegrity` calls (around line 49), add this block:
```js
    // Gate 5: Full Workspace Scan
    const { scanWorkspace } = require('../core/workspace-scanner.js');
    const wsResult = scanWorkspace(process.cwd());
    const wsErrors = wsResult.issues.filter(i => i.type === 'syntax' || i.type === 'rule0');
    if (wsErrors.length > 0) {
      console.log(`\n${colors.red}┌${'─'.repeat(74)}┐`);
      console.log(`│ ❌ WORKSPACE HAS ${wsErrors.length} ERROR(S) — Fix before completing`.padEnd(75) + "│");
      wsErrors.slice(0, 5).forEach(e => {
        const rel = path.relative(process.cwd(), e.file);
        console.log(`│   ${rel}: ${e.error.slice(0, 60)}`.padEnd(75) + "│");
      });
      console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
      process.exit(1);
    }
```
- **Done-check:** Create temp file with syntax error → `./l c` fails with "WORKSPACE HAS" message
- **Depends:** 41.2

---

### Step 42.2 — Upgrade Checkpoint with Fortress Gates (`packages/cli/cmd-checkpoint.js`)
- **File:** `packages/cli/cmd-checkpoint.js`
- **Action:** EDIT
- **Content:** Before the `git tag` creation line, add this block:
```js
    // Fortress Gate: Health Check
    const { calculateHealth } = require('../core/health-score.js');
    const health = calculateHealth(process.cwd());
    if (!health.passed) {
      log.error(`Health Score: ${health.score}/100 — Must be 100% to checkpoint.`);
      health.issues.slice(0, 5).forEach(i => {
        log.error(`  ${path.relative(process.cwd(), i.file)}: ${i.error}`);
      });
      log.error('Run `./l health` for full report. Run `./l health --fix` to auto-fix.');
      process.exit(1);
    }
    log.success(`Health Score: ${health.score}/100 ✨`);
```
- **Done-check:** Add syntax error → `./l cp save "test"` fails with health score error
- **Depends:** 42.1

---

## Phase 43: Watch Mode & Templates

### Step 43.1 — Upgrade Watch with In-Flight Guards (`packages/cli/cmd-watch.js`)
- **File:** `packages/cli/cmd-watch.js`
- **Action:** EDIT
- **Content:** Replace entire file with:
```js
const fs = require('fs');
const path = require('path');
const { log } = require('./colors.js');
const { syntaxCheck, checkImportTargets } = require('./syntax-checker.js');

const WATCH_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs', '.json', '.css'];
const SKIP = ['node_modules', '.git', 'dist', 'build'];

function watchCommand() {
  const cwd = process.cwd();
  log.header('Watching for errors (Ctrl+C to stop)');
  log.info(`Watching: ${cwd}`);

  fs.watch(cwd, { recursive: true }, (event, filename) => {
    if (!filename || SKIP.some(s => filename.includes(s))) return;
    const ext = path.extname(filename).toLowerCase();
    if (!WATCH_EXTS.includes(ext)) return;
    const full = path.join(cwd, filename);
    if (!fs.existsSync(full)) return;

    const result = syntaxCheck(full);
    const imports = (ext !== '.json' && ext !== '.css') ? checkImportTargets(full) : [];
    const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/)
      .filter(l => l.trim() && !/^\s*(\/\/|#(?!!)|\/\*|\*|<!--)/.test(l)).length;

    const errors = [];
    if (!result.ok) errors.push(result.error);
    if (imports.length > 0) errors.push(...imports);
    if (lines > 150) errors.push(`${lines} lines (limit: 150)`);

    if (errors.length === 0) {
      console.log(`  ✅ ${filename} — clean`);
    } else {
      errors.forEach(e => console.log(`  ❌ ${filename} — ${e}`));
    }
  });

  process.on('SIGINT', () => { console.log('\n👋 Watch stopped.'); process.exit(0); });
}

module.exports = { watchCommand };
```
- **Done-check:** `node -c packages/cli/cmd-watch.js` → exits 0
- **Depends:** 42.2

---

### Step 43.2 — Add Zero-Error Protocol to AGENTS.md (`templates/AGENTS.md`)
- **File:** `templates/AGENTS.md`
- **Action:** EDIT
- **Content:** Add this section at the end of the file, before the last `---`:
```markdown
## 🛡️ Zero-Error Enforcement Protocol

Before marking ANY step complete (`./l c X.Y`), you MUST:

1. Run `./l v` — project validation must pass.
2. Run `./l health` — workspace health score must be 100%.
3. No syntax errors or broken imports may exist anywhere in the workspace.
4. No `console.log`, `debugger`, or `// TODO` in production code.
5. If tests exist (`npm test`), they must pass.

> The CLI enforces these gates automatically. You cannot bypass them.
```
- **Done-check:** `grep -c "Zero-Error" templates/AGENTS.md` → `1` or more
- **Depends:** 43.1

---

### Step 43.3 — Add Rule 3 to RULES.md (`templates/RULES.md`)
- **File:** `templates/RULES.md`
- **Action:** EDIT
- **Content:** Add this section after the existing RULE 2 section:
```markdown
## RULE 3 — Zero-Error Policy

1. No file in the workspace may have a syntax error at any time.
2. No `import` or `require` statement may reference a non-existent file.
3. No file may exceed 150 effective lines (Rule 0 always enforced).
4. No `console.log`, `debugger`, `// TODO`, or `// FIXME` in committed code.
5. No Git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) may exist.
6. No `eval()`, hardcoded secrets, or shell injection patterns allowed.
7. `./l health` must return score 100% before any checkpoint save.
8. Circular dependencies are forbidden.
```
- **Done-check:** `grep -c "RULE 3" templates/RULES.md` → `1`
- **Depends:** 43.2

---

## Phase 44: Dashboard Health Center

### Step 44.1 — Health API Route (`dashboard/src/server/health.js`)
- **File:** `dashboard/src/server/health.js`
- **Action:** CREATE
- **Content:**
```js
import express from 'express';
import path from 'path';
import { createRequire } from 'module';

const router = express.Router();
const require = createRequire(import.meta.url);

router.get('/projects/:id/health', (req, res) => {
  try {
    const configPath = path.join(process.cwd(), 'dashboard-projects.json');
    const { readFileSync } = await import('fs');
    const projects = JSON.parse(readFileSync(configPath, 'utf8'));
    const project = projects.find(p => String(p.id) === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { calculateHealth } = require('../../packages/core/health-score.js');
    const health = calculateHealth(project.path);
    health.issues = health.issues.map(i => ({
      ...i,
      file: path.relative(project.path, i.file || '')
    }));
    res.json(health);
  } catch (e) {
    res.status(500).json({ error: e.message, score: 0, passed: false });
  }
});

export default router;
```
- **Done-check:** `node -c dashboard/src/server/health.js` → exits 0 (or file exists with valid syntax)
- **Depends:** 43.3

---

### Step 44.2 — Mount Health Route (`dashboard/server.js`)
- **File:** `dashboard/server.js`
- **Action:** EDIT
- **Content:** Add these 2 lines near the other route imports and mounts:
```js
import healthRouter from './src/server/health.js';
// ... (near other app.use lines)
app.use('/api', healthRouter);
```
- **Done-check:** `grep -c "healthRouter" dashboard/server.js` → `2`
- **Depends:** 44.1

---

### Step 44.3 — Health Command Center Component (`dashboard/src/components/HealthCommandCenter.jsx`)
- **File:** `dashboard/src/components/HealthCommandCenter.jsx`
- **Action:** CREATE
- **Content:** React component with: health score circular gauge, categorized error cards (Syntax, Imports, Rule 0, Security), file-level issue list, "Scan Now" button, "Auto-Fix" button. Fetches from `/api/projects/:id/health`. Shows loading spinner during scan.
- **Done-check:** File exists and `grep -c "HealthCommandCenter" dashboard/src/components/HealthCommandCenter.jsx` → `1` or more
- **Depends:** 44.2

---

### Step 44.4 — Wire Health Tab into ProjectGrid (`dashboard/src/components/ProjectGrid.jsx`)
- **File:** `dashboard/src/components/ProjectGrid.jsx`
- **Action:** EDIT
- **Content:** Add "🏥 Health" tab button alongside existing tabs. When clicked, render `<HealthCommandCenter projectId={...} />`. Import the component at top of file.
- **Done-check:** `grep -c "HealthCommandCenter" dashboard/src/components/ProjectGrid.jsx` → `1` or more
- **Depends:** 44.3

---

## Phase 45: Tests & Final Validation

### Step 45.1 — Health System Tests (`tests/health.bats`)
- **File:** `tests/health.bats`
- **Action:** CREATE
- **Content:**
```bash
#!/usr/bin/env bats

load test_helper

@test "health command passes on clean project" {
  cat << 'EOF' > package.json
{ "name": "test-project", "scripts": { "test": "echo ok" } }
EOF
  mkdir -p src
  echo "const x = 1;" > src/clean.js

  run ./l health
  [ "$status" -eq 0 ]
  [[ "$output" == *"100/100"* ]]
}

@test "health command fails on syntax error" {
  mkdir -p src
  echo "const x = {;" > src/broken.js

  run ./l health
  [ "$status" -ne 0 ]
  [[ "$output" != *"100/100"* ]]
}

@test "health command fails on file over 150 lines" {
  mkdir -p src
  python3 -c "
for i in range(160):
    print(f'const x{i} = {i};')
" > src/big.js

  run ./l health
  [ "$status" -ne 0 ]
  [[ "$output" == *"rule0"* ]] || [[ "$output" == *"Rule 0"* ]] || [[ "$output" == *"150"* ]]
}

@test "health fix removes console.log" {
  mkdir -p src
  cat << 'EOF' > src/debug.js
const x = 1;
console.log("debug");
const y = 2;
EOF

  run ./l health --fix
  [ "$status" -eq 0 ]
  run grep "console.log" src/debug.js
  [ "$status" -ne 0 ]
}

@test "health detects git conflict markers" {
  mkdir -p src
  cat << 'EOF' > src/conflict.js
const x = 1;
<<<<<<< HEAD
const y = 2;
=======
const y = 3;
>>>>>>> branch
EOF

  run ./l health
  [ "$status" -ne 0 ]
  [[ "$output" == *"conflict"* ]] || [[ "$output" == *"security"* ]] || [[ "$output" != *"100/100"* ]]
}
```
- **Done-check:** `bats tests/health.bats` → all tests pass
- **Depends:** 44.4

---

### Step 45.2 — Full Validation Run
- **File:** `tests/health.bats`
- **Action:** EDIT
- **Content:** Run full test suite and validation: `./l v && ./l doctor && npm test`. Verify all existing tests still pass. Verify new health tests pass.
- **Done-check:** `npm test` → all tests pass including health tests
- **Depends:** 45.1
