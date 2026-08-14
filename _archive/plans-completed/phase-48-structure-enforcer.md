# Phase 48: Structure Enforcer Engine

> প্রতিটি step-এ সম্পূর্ণ কোড দেওয়া আছে। শুধু copy-paste করলেই হবে।
> কোনো চিন্তা করতে হবে না, কোনো guess করতে হবে না।

---

### Step 48.1 — Folder Structure Analyzer (`packages/core/structure-analyzer.js`)
- **File:** `packages/core/structure-analyzer.js`
- **Action:** CREATE
- **Content:**
```js
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

const SKIP = ['node_modules', '.git', 'dist', 'build', '.agents'];

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
```
- **Done-check:** `node -e "require('./packages/core/structure-analyzer.js')"` → no error
- **Depends:** None

---

### Step 48.2 — Naming Convention Checker (`packages/core/naming-checker.js`)
- **File:** `packages/core/naming-checker.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');

const SKIP = ['node_modules', '.git', 'dist', 'build', '.agents', 'plan'];
const CODE_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs'];

function walkCodeFiles(dir, results) {
  if (!results) results = [];
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return results; }
  for (const name of entries) {
    if (name.startsWith('.') || SKIP.includes(name)) continue;
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) { walkCodeFiles(full, results); continue; }
    const ext = path.extname(name).toLowerCase();
    if (CODE_EXTS.includes(ext)) results.push({ path: full, name, ext });
  }
  return results;
}

function checkNaming(projectPath) {
  const files = walkCodeFiles(projectPath);
  const issues = [];

  for (const file of files) {
    const base = path.basename(file.name, file.ext);
    // Check for generic names
    if (['utils', 'helpers', 'misc', 'stuff', 'temp', 'test2', 'copy'].includes(base.toLowerCase())) {
      issues.push({ file: file.path, type: 'generic-name', msg: `Generic filename: ${file.name}. Use descriptive name.` });
    }
    // Check for spaces in filename
    if (file.name.includes(' ')) {
      issues.push({ file: file.path, type: 'space-in-name', msg: `Spaces in filename: ${file.name}` });
    }
    // JSX files should be PascalCase
    if ((file.ext === '.jsx' || file.ext === '.tsx') && /^[a-z]/.test(base) && !base.includes('-')) {
      // skip kebab-case (valid) — only flag camelCase starting lowercase without dashes
      if (/^[a-z][a-zA-Z]+$/.test(base) && base !== 'index' && base !== 'main') {
        issues.push({ file: file.path, type: 'jsx-naming', msg: `JSX file should be PascalCase: ${file.name}` });
      }
    }
  }

  return { filesChecked: files.length, issues };
}

module.exports = { checkNaming };
```
- **Done-check:** `node -e "require('./packages/core/naming-checker.js')"` → no error
- **Depends:** 48.1

---

### Step 48.3 — Code Hygiene Scanner (`packages/core/code-hygiene.js`)
- **File:** `packages/core/code-hygiene.js`
- **Action:** CREATE
- **Content:**
```js
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

    // Check for TODO/FIXME comments
    for (let i = 0; i < lines.length; i++) {
      if (/\b(TODO|FIXME|HACK|XXX)\b/.test(lines[i])) {
        issues.push({ file: file.path, line: i + 1, type: 'todo-comment', msg: `TODO/FIXME comment found: ${lines[i].trim().slice(0, 60)}` });
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
```
- **Done-check:** `node -e "require('./packages/core/code-hygiene.js')"` → no error
- **Depends:** 48.2

---

### Step 48.4 — Unified Quality Report (`packages/core/quality-report.js`)
- **File:** `packages/core/quality-report.js`
- **Action:** CREATE
- **Content:**
```js
const { analyzeStructure } = require('./structure-analyzer.js');
const { checkNaming } = require('./naming-checker.js');
const { scanHygiene } = require('./code-hygiene.js');

function generateQualityReport(projectPath) {
  const structure = analyzeStructure(projectPath);
  const naming = checkNaming(projectPath);
  const hygiene = scanHygiene(projectPath);

  const allIssues = [
    ...structure.issues.map(i => ({ ...i, category: 'structure' })),
    ...naming.issues.map(i => ({ ...i, category: 'naming' })),
    ...hygiene.issues.map(i => ({ ...i, category: 'hygiene' })),
  ];

  let score = 100;
  score -= structure.issues.filter(i => i.type === 'junk-file').length * 3;
  score -= structure.issues.filter(i => i.type === 'empty-file').length * 5;
  score -= naming.issues.length * 2;
  score -= hygiene.issues.filter(i => i.type === 'debug-log').length * 1;
  score -= hygiene.issues.filter(i => i.type === 'todo-comment').length * 1;
  if (score < 0) score = 0;

  return {
    score,
    maxScore: 100,
    passed: score >= 80,
    breakdown: {
      structureIssues: structure.issues.length,
      namingIssues: naming.issues.length,
      hygieneIssues: hygiene.issues.length,
      totalFiles: structure.totalFiles,
      totalDirs: structure.totalDirs,
    },
    issues: allIssues,
  };
}

module.exports = { generateQualityReport };
```
- **Done-check:** `node -e "require('./packages/core/quality-report.js')"` → no error
- **Depends:** 48.3
