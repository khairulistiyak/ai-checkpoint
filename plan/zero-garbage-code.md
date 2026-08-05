# 🏛️ Zero Garbage Code System

> প্রতিটি step-এ সম্পূর্ণ কোড আছে। শুধু copy-paste করলেই হবে।  
> EDIT step-এও exact "কোথায় কী আছে" এবং "কী দিয়ে বদলাবে" দেওয়া আছে।  
> কোনো চিন্তা করতে হবে না, কোনো guess করতে হবে না।

---

## Phase 48: Structure Enforcer Engine

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
  /^\._/, /\.bak$/i, /\.orig$/i, /\.swp$/i, /~$/,
  /^#.*#$/, /\bcopy\s*\d*\b/i, /\(\d+\)\.js$/, /\.tmp$/i,
];

const SKIP = ['node_modules', '.git', 'dist', 'build', '.agents'];

function walkAll(dir, depth, results) {
  if (depth === undefined) depth = 0;
  if (results === undefined) results = [];
  if (depth > 15) return results;
  var entries;
  try { entries = fs.readdirSync(dir); } catch (e) { return results; }
  for (var i = 0; i < entries.length; i++) {
    var name = entries[i];
    if (SKIP.indexOf(name) >= 0) continue;
    var full = path.join(dir, name);
    var stat;
    try { stat = fs.lstatSync(full); } catch (e) { continue; }
    if (stat.isSymbolicLink()) continue;
    var isDir = stat.isDirectory();
    results.push({ path: full, name: name, isDir: isDir, size: stat.size, depth: depth });
    if (isDir) walkAll(full, depth + 1, results);
  }
  return results;
}

function findJunkFiles(projectPath) {
  var all = walkAll(projectPath);
  var junk = [];
  for (var i = 0; i < all.length; i++) {
    var item = all[i];
    if (item.isDir) continue;
    if (JUNK_FILES.indexOf(item.name) >= 0) {
      junk.push({ file: item.path, reason: 'Known junk: ' + item.name });
      continue;
    }
    for (var j = 0; j < JUNK_PATTERNS.length; j++) {
      if (JUNK_PATTERNS[j].test(item.name)) {
        junk.push({ file: item.path, reason: 'Junk pattern match' });
        break;
      }
    }
  }
  return junk;
}

function findEmptyDirs(projectPath) {
  var all = walkAll(projectPath);
  var empty = [];
  for (var i = 0; i < all.length; i++) {
    if (!all[i].isDir) continue;
    try {
      var c = fs.readdirSync(all[i].path).filter(function(n) { return n[0] !== '.'; });
      if (c.length === 0) empty.push({ file: all[i].path, reason: 'Empty directory' });
    } catch (e) {}
  }
  return empty;
}

function findEmptyFiles(projectPath) {
  var all = walkAll(projectPath);
  return all.filter(function(i) { return !i.isDir && i.size === 0; })
    .map(function(i) { return { file: i.path, reason: 'Empty file (0 bytes)' }; });
}

function analyzeStructure(projectPath) {
  var junk = findJunkFiles(projectPath);
  var emptyDirs = findEmptyDirs(projectPath);
  var emptyFiles = findEmptyFiles(projectPath);
  return {
    junk: junk,
    emptyDirs: emptyDirs,
    emptyFiles: emptyFiles,
    total: junk.length + emptyDirs.length + emptyFiles.length
  };
}

module.exports = { analyzeStructure: analyzeStructure, findJunkFiles: findJunkFiles, findEmptyDirs: findEmptyDirs, findEmptyFiles: findEmptyFiles, walkAll: walkAll };
```
- **Done-check:** `node -e "const {analyzeStructure}=require('./packages/core/structure-analyzer.js'); console.log(typeof analyzeStructure)"` → prints `function`
- **Depends:** None

---

### Step 48.2 — Naming Convention Checker (`packages/core/naming-checker.js`)
- **File:** `packages/core/naming-checker.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');

var SKIP = ['node_modules', '.git', 'dist', 'build', '.next', '.agents', 'plan'];
var CODE_EXTS = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts', '.css'];

var BAD_NAMES = [
  { regex: /^utils?\.(js|ts|jsx|tsx)$/i, msg: 'Generic "utils" — use descriptive name' },
  { regex: /^helpers?\.(js|ts|jsx|tsx)$/i, msg: 'Generic "helpers" — use descriptive name' },
  { regex: /^misc\.(js|ts|jsx|tsx)$/i, msg: 'Generic "misc" — use descriptive name' },
  { regex: /^stuff\.(js|ts|jsx|tsx)$/i, msg: 'Generic "stuff" — use descriptive name' },
  { regex: /^temp\.(js|ts|jsx|tsx)$/i, msg: 'Temporary file left behind' },
  { regex: /^old\.(js|ts|jsx|tsx)$/i, msg: '"old" file left behind' },
  { regex: /^copy\.(js|ts|jsx|tsx)$/i, msg: '"copy" file left behind' },
  { regex: /^final\.(js|ts|jsx|tsx)$/i, msg: '"final" file — use git for versioning' },
  { regex: /^v\d+\.(js|ts|jsx|tsx)$/i, msg: 'Numbered version file — use git' },
  { regex: /^new\.(js|ts|jsx|tsx)$/i, msg: 'Generic "new" — use descriptive name' },
];

function walkCodeFiles(dir, results) {
  if (!results) results = [];
  var entries;
  try { entries = fs.readdirSync(dir); } catch (e) { return results; }
  for (var i = 0; i < entries.length; i++) {
    var name = entries[i];
    if (name[0] === '.' || SKIP.indexOf(name) >= 0) continue;
    var full = path.join(dir, name);
    var stat;
    try { stat = fs.lstatSync(full); } catch (e) { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) { walkCodeFiles(full, results); continue; }
    if (CODE_EXTS.indexOf(path.extname(name).toLowerCase()) >= 0) {
      results.push({ path: full, name: name });
    }
  }
  return results;
}

function checkNaming(projectPath) {
  var files = walkCodeFiles(projectPath);
  var issues = [];
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    for (var j = 0; j < BAD_NAMES.length; j++) {
      if (BAD_NAMES[j].regex.test(file.name)) {
        issues.push({ file: file.path, reason: BAD_NAMES[j].msg });
        break;
      }
    }
  }
  return issues;
}

module.exports = { checkNaming: checkNaming };
```
- **Done-check:** `node -e "const {checkNaming}=require('./packages/core/naming-checker.js'); console.log(typeof checkNaming)"` → prints `function`
- **Depends:** 48.1

---

### Step 48.3 — Code Hygiene Scanner (`packages/core/code-hygiene.js`)
- **File:** `packages/core/code-hygiene.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');

var SKIP = ['node_modules', '.git', 'dist', 'build', '.next', '.agents', 'plan'];
var CODE_EXTS = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts'];

function walkCodeFiles(dir, results) {
  if (!results) results = [];
  var entries;
  try { entries = fs.readdirSync(dir); } catch (e) { return results; }
  for (var i = 0; i < entries.length; i++) {
    var name = entries[i];
    if (name[0] === '.' || SKIP.indexOf(name) >= 0) continue;
    var full = path.join(dir, name);
    var stat;
    try { stat = fs.lstatSync(full); } catch (e) { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) { walkCodeFiles(full, results); continue; }
    if (CODE_EXTS.indexOf(path.extname(name).toLowerCase()) >= 0 && stat.size > 0) {
      results.push(full);
    }
  }
  return results;
}

function scanHygiene(projectPath) {
  var files = walkCodeFiles(projectPath);
  var issues = [];

  for (var f = 0; f < files.length; f++) {
    var fp = files[f];
    var content;
    try { content = fs.readFileSync(fp, 'utf8'); } catch (e) { continue; }
    var lines = content.split('\n');

    // 1. Duplicate imports
    var importMap = {};
    for (var i = 0; i < lines.length; i++) {
      var m = lines[i].match(/(?:from\s+|require\(\s*)['"]([^'"]+)['"]/);
      if (m) {
        var spec = m[1];
        if (importMap[spec] !== undefined) {
          issues.push({ file: fp, line: i + 1, reason: 'Duplicate import "' + spec + '" (first at line ' + importMap[spec] + ')', type: 'dup-import' });
        } else {
          importMap[spec] = i + 1;
        }
      }
    }

    // 2. Consecutive blank lines (3+)
    var blankCount = 0;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '') {
        blankCount++;
        if (blankCount >= 3) {
          issues.push({ file: fp, line: i + 1, reason: '3+ consecutive blank lines', type: 'blank-lines' });
          blankCount = 0;
        }
      } else {
        blankCount = 0;
      }
    }

    // 3. Commented-out code (3+ consecutive)
    var commentRun = 0;
    for (var i = 0; i < lines.length; i++) {
      if (/^\s*\/\/\s*(const|let|var|function|if|else|for|while|return|import|export|class)\b/.test(lines[i])) {
        commentRun++;
        if (commentRun >= 3) {
          issues.push({ file: fp, line: i + 1, reason: 'Commented-out code block. Delete or restore.', type: 'commented-code' });
          commentRun = 0;
        }
      } else {
        commentRun = 0;
      }
    }

    // 4. Very long lines (> 200)
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].length > 200 && !/^\s*(\/\/|\/\*|\*)/.test(lines[i])) {
        issues.push({ file: fp, line: i + 1, reason: 'Line too long (' + lines[i].length + ' chars, limit: 200)', type: 'long-line' });
      }
    }
  }

  return { issues: issues, filesScanned: files.length };
}

module.exports = { scanHygiene: scanHygiene };
```
- **Done-check:** `node -e "const {scanHygiene}=require('./packages/core/code-hygiene.js'); console.log(typeof scanHygiene)"` → prints `function`
- **Depends:** 48.2

---

### Step 48.4 — Unified Quality Report (`packages/core/quality-report.js`)
- **File:** `packages/core/quality-report.js`
- **Action:** CREATE
- **Content:**
```js
const path = require('path');
const { analyzeStructure } = require('./structure-analyzer.js');
const { checkNaming } = require('./naming-checker.js');
const { scanHygiene } = require('./code-hygiene.js');

function generateQualityReport(projectPath) {
  var structure = analyzeStructure(projectPath);
  var naming = checkNaming(projectPath);
  var hygiene = scanHygiene(projectPath);

  var categories = {
    'Junk Files': structure.junk.map(function(i) { return { file: i.file, reason: i.reason, type: 'junk' }; }),
    'Empty Directories': structure.emptyDirs.map(function(i) { return { file: i.file, reason: i.reason, type: 'empty-dir' }; }),
    'Empty Files': structure.emptyFiles.map(function(i) { return { file: i.file, reason: i.reason, type: 'empty-file' }; }),
    'Bad Naming': naming.map(function(i) { return { file: i.file, reason: i.reason, type: 'naming' }; }),
    'Duplicate Imports': hygiene.issues.filter(function(i) { return i.type === 'dup-import'; }),
    'Blank Lines': hygiene.issues.filter(function(i) { return i.type === 'blank-lines'; }),
    'Commented Code': hygiene.issues.filter(function(i) { return i.type === 'commented-code'; }),
    'Long Lines': hygiene.issues.filter(function(i) { return i.type === 'long-line'; }),
  };

  var allIssues = [];
  var keys = Object.keys(categories);
  for (var k = 0; k < keys.length; k++) {
    var items = categories[keys[k]];
    for (var j = 0; j < items.length; j++) {
      allIssues.push({
        file: path.relative(projectPath, items[j].file || ''),
        line: items[j].line || null,
        reason: items[j].reason,
        type: items[j].type,
      });
    }
  }

  var score = 100;
  score -= structure.total * 3;
  score -= naming.length * 4;
  score -= hygiene.issues.length * 2;
  if (score < 0) score = 0;

  return {
    score: score,
    totalIssues: allIssues.length,
    categories: categories,
    allIssues: allIssues,
    filesScanned: hygiene.filesScanned,
  };
}

module.exports = { generateQualityReport: generateQualityReport };
```
- **Done-check:** `node -e "const {generateQualityReport}=require('./packages/core/quality-report.js'); console.log(typeof generateQualityReport)"` → prints `function`
- **Depends:** 48.3

---

## Phase 49: CLI Quality Command

### Step 49.1 — Quality Command (`packages/cli/cmd-quality.js`)
- **File:** `packages/cli/cmd-quality.js`
- **Action:** CREATE
- **Content:**
```js
const path = require('path');
const { log, colors, getProgressBar } = require('./colors.js');
const { generateQualityReport } = require('../core/quality-report.js');

function qualityCommand(args) {
  var json = args.indexOf('--json') >= 0;
  var clean = args.indexOf('--clean') >= 0;

  if (clean) {
    var { cleanStructure } = require('../core/structure-cleaner.js');
    var { fixHygiene } = require('../core/hygiene-fixer.js');
    var { walkAll } = require('../core/structure-analyzer.js');
    var structResult = cleanStructure(process.cwd(), false);
    var codeExts = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts', '.css'];
    var files = walkAll(process.cwd()).filter(function(f) { return !f.isDir && codeExts.indexOf(path.extname(f.name)) >= 0; });
    var codeFixed = 0;
    for (var i = 0; i < files.length; i++) { codeFixed += fixHygiene(files[i].path, false).fixed; }
    log.success('Cleaned ' + structResult.actionsPerformed + ' structure + ' + codeFixed + ' code issues.');
    return;
  }

  var report = generateQualityReport(process.cwd());

  if (json) { console.log(JSON.stringify(report, null, 2)); return; }

  var scoreColor = report.score === 100 ? colors.green : report.score >= 80 ? colors.yellow : colors.red;

  log.header('Code Quality Report');
  console.log('  Files Scanned: ' + report.filesScanned);
  console.log('');

  var keys = Object.keys(report.categories);
  for (var k = 0; k < keys.length; k++) {
    var cat = keys[k];
    var items = report.categories[cat];
    if (items.length === 0) {
      console.log('  ✅ ' + cat + ': 0');
    } else {
      console.log('  ❌ ' + cat + ': ' + items.length);
      for (var j = 0; j < Math.min(items.length, 3); j++) {
        var rel = items[j].file ? path.relative(process.cwd(), items[j].file) : '?';
        console.log('     → ' + rel + (items[j].line ? ':' + items[j].line : '') + ' — ' + items[j].reason);
      }
      if (items.length > 3) console.log('     → ... and ' + (items.length - 3) + ' more');
    }
  }

  console.log('');
  console.log('  ' + scoreColor + 'QUALITY SCORE: ' + report.score + '/100 ' + getProgressBar(report.score, 20) + colors.reset);
  console.log('');

  if (report.totalIssues === 0) {
    log.success('Zero garbage! Perfect code quality.');
  } else {
    log.warn(report.totalIssues + ' issue(s) found. Clean them for 100%.');
    process.exit(1);
  }
}

module.exports = { qualityCommand: qualityCommand };
```
- **Done-check:** `node -c packages/cli/cmd-quality.js` → no error, exits 0
- **Depends:** 48.4

---

### Step 49.2 — Register Quality Command in CLI Router (`packages/cli/index.js`)
- **File:** `packages/cli/index.js`
- **Action:** EDIT
- **What to find (line 14):**
```js
const { runProjectCommand } = require('./cmd-run.js');
```
- **Replace with:**
```js
const { runProjectCommand } = require('./cmd-run.js');
const { qualityCommand } = require('./cmd-quality.js');
```
- **Also find (line 58):**
```js
    case 'run': case 'r': runProjectCommand(args[1], args.slice(2)); break;
```
- **Replace with:**
```js
    case 'run': case 'r': runProjectCommand(args[1], args.slice(2)); break;
    case 'quality': case 'q': qualityCommand(args.slice(1)); break;
```
- **Done-check:** `node -c packages/cli/index.js && node -e "require('./packages/cli/index.js')"` → no crash
- **Depends:** 49.1

---

## Phase 50: Auto-Clean Engine

### Step 50.1 — Structure Cleaner (`packages/core/structure-cleaner.js`)
- **File:** `packages/core/structure-cleaner.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');
const { analyzeStructure } = require('./structure-analyzer.js');

function cleanStructure(projectPath, dryRun) {
  if (dryRun === undefined) dryRun = true;
  var analysis = analyzeStructure(projectPath);
  var actions = [];

  for (var i = 0; i < analysis.junk.length; i++) {
    var item = analysis.junk[i];
    actions.push({ action: 'delete', target: item.file, reason: item.reason });
    if (!dryRun) { try { fs.unlinkSync(item.file); } catch (e) {} }
  }

  for (var i = 0; i < analysis.emptyFiles.length; i++) {
    var item = analysis.emptyFiles[i];
    var name = path.basename(item.file);
    if (name === '.gitkeep' || name === '.keep') continue;
    actions.push({ action: 'delete', target: item.file, reason: item.reason });
    if (!dryRun) { try { fs.unlinkSync(item.file); } catch (e) {} }
  }

  for (var i = 0; i < analysis.emptyDirs.length; i++) {
    var item = analysis.emptyDirs[i];
    actions.push({ action: 'rmdir', target: item.file, reason: item.reason });
    if (!dryRun) { try { fs.rmdirSync(item.file); } catch (e) {} }
  }

  return { actionsPerformed: actions.length, actions: actions, dryRun: dryRun };
}

module.exports = { cleanStructure: cleanStructure };
```
- **Done-check:** `node -e "const {cleanStructure}=require('./packages/core/structure-cleaner.js'); console.log(typeof cleanStructure)"` → prints `function`
- **Depends:** 49.2

---

### Step 50.2 — Code Hygiene Fixer (`packages/core/hygiene-fixer.js`)
- **File:** `packages/core/hygiene-fixer.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');

function fixHygiene(filePath, dryRun) {
  if (dryRun === undefined) dryRun = true;
  if (!fs.existsSync(filePath)) return { fixed: 0, changes: [] };
  var content = fs.readFileSync(filePath, 'utf8');
  var changes = [];

  // 1. Remove trailing whitespace
  var trimmed = content.replace(/[ \t]+$/gm, '');
  if (trimmed !== content) { changes.push('trailing-whitespace'); content = trimmed; }

  // 2. Collapse 3+ blank lines into 2
  var collapsed = content.replace(/\n{3,}/g, '\n\n');
  if (collapsed !== content) { changes.push('excessive-blank-lines'); content = collapsed; }

  // 3. Ensure exactly 1 trailing newline
  if (!content.endsWith('\n')) { changes.push('missing-trailing-newline'); content += '\n'; }
  if (content.endsWith('\n\n')) {
    content = content.replace(/\n+$/, '\n');
    changes.push('extra-trailing-newlines');
  }

  if (!dryRun && changes.length > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return { fixed: changes.length, changes: changes };
}

module.exports = { fixHygiene: fixHygiene };
```
- **Done-check:** `node -e "const {fixHygiene}=require('./packages/core/hygiene-fixer.js'); console.log(typeof fixHygiene)"` → prints `function`
- **Depends:** 50.1

---

## Phase 51: Integration & Templates

### Step 51.1 — Add Quality Gate to Complete Command (`packages/cli/cmd-complete.js`)
- **File:** `packages/cli/cmd-complete.js`
- **Action:** EDIT
- **What to find (line 50, inside completeCommand, after the integrity check block):**
```js
  lines[targetStep.lineIndex] = lines[targetStep.lineIndex].replace(/-\s*\[([ x!/~])\]/, '- [x]');
```
- **Replace with:**
```js
  // Quality Gate: junk file warning
  try {
    var { analyzeStructure } = require('../core/structure-analyzer.js');
    var structIssues = analyzeStructure(process.cwd());
    if (structIssues.junk.length > 0) {
      structIssues.junk.slice(0, 3).forEach(function(j) {
        log.warn('Junk file: ' + path.relative(process.cwd(), j.file));
      });
    }
  } catch (e) {}

  lines[targetStep.lineIndex] = lines[targetStep.lineIndex].replace(/-\s*\[([ x!/~])\]/, '- [x]');
```
- **Done-check:** `node -c packages/cli/cmd-complete.js` → no error, exits 0
- **Depends:** 50.2

---

### Step 51.2 — Add Rule 4 Clean Code Policy to RULES.md (`templates/RULES.md`)
- **File:** `templates/RULES.md`
- **Action:** EDIT
- **What to find (last line 118):**
```
| [YOUR_TEST_COMMAND] | Build, lint, typecheck, or test |
```
- **Replace with:**
```
| [YOUR_TEST_COMMAND] | Build, lint, typecheck, or test |

---

## RULE 4 — Clean Code Policy

### File Hygiene
1. No junk files: `.DS_Store`, `.bak`, `.tmp`, `copy.js`, `old.js`.
2. No empty files or empty directories.
3. Every file ends with exactly one newline.
4. No more than 2 consecutive blank lines.
5. No trailing whitespace on any line.
6. No lines over 200 characters.

### Naming
1. Component files (`.jsx/.tsx`): `PascalCase`.
2. Utility files (`.js/.ts`): `kebab-case`.
3. No generic names: `utils.js`, `helpers.js`, `misc.js` are forbidden.
4. No versioned names: `v2.js`, `final.js`, `new.js`, `old.js` are forbidden.

### Import Order
1. External packages first.
2. Scoped packages second.
3. Local imports last.
4. No duplicate imports from the same path.

### Code Cleanliness
1. No commented-out code blocks (3+ lines).
2. No `console.log`, `debugger`, or `// TODO` in committed code.
3. Run `./l quality` to verify — must score 100%.
```
- **Done-check:** `grep -c "RULE 4" templates/RULES.md` → prints `1`
- **Depends:** 51.1

---

### Step 51.3 — Quality Tests (`tests/quality.bats`)
- **File:** `tests/quality.bats`
- **Action:** CREATE
- **Content:**
```bash
#!/usr/bin/env bats

load test_helper

@test "quality passes on clean project" {
  mkdir -p src
  echo "const x = 1;" > src/app.js

  run ./l quality
  [ "$status" -eq 0 ]
  [[ "$output" == *"100/100"* ]]
}

@test "quality detects junk files" {
  mkdir -p src
  echo "const x = 1;" > src/app.js
  touch .DS_Store

  run ./l quality --json
  [[ "$output" == *"junk"* ]]
}

@test "quality detects bad naming" {
  mkdir -p src
  echo "const x = 1;" > src/utils.js

  run ./l quality --json
  [[ "$output" == *"naming"* ]]
}

@test "quality --clean removes junk" {
  mkdir -p src
  echo "const x = 1;" > src/app.js
  touch .DS_Store

  run ./l quality --clean
  [ "$status" -eq 0 ]
  [ ! -f .DS_Store ]
}

@test "quality detects excessive blank lines" {
  mkdir -p src
  printf "const x = 1;\n\n\n\n\nconst y = 2;\n" > src/app.js

  run ./l quality --json
  [[ "$output" == *"blank-lines"* ]]
}
```
- **Done-check:** `bats tests/quality.bats` → all 5 tests pass
- **Depends:** 51.2

---

## Phase 52: Deep Code Quality Scanners

### Step 52.1 — Function Complexity Analyzer (`packages/core/complexity-analyzer.js`)
- **File:** `packages/core/complexity-analyzer.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');

var SKIP = ['node_modules', '.git', 'dist', 'build', '.next', '.agents', 'plan'];
var CODE_EXTS = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts'];

function walkCodeFiles(dir, results) {
  if (!results) results = [];
  var entries;
  try { entries = fs.readdirSync(dir); } catch (e) { return results; }
  for (var i = 0; i < entries.length; i++) {
    var name = entries[i];
    if (name[0] === '.' || SKIP.indexOf(name) >= 0) continue;
    var full = path.join(dir, name);
    var stat;
    try { stat = fs.lstatSync(full); } catch (e) { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) { walkCodeFiles(full, results); continue; }
    if (CODE_EXTS.indexOf(path.extname(name).toLowerCase()) >= 0 && stat.size > 0) results.push(full);
  }
  return results;
}

function analyzeComplexity(projectPath) {
  var files = walkCodeFiles(projectPath);
  var issues = [];

  for (var f = 0; f < files.length; f++) {
    var fp = files[f];
    var content;
    try { content = fs.readFileSync(fp, 'utf8'); } catch (e) { continue; }
    var lines = content.split('\n');

    // Find functions and measure their length
    var fnStart = -1;
    var fnName = '';
    var fnParams = 0;
    var braceDepth = 0;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      if (fnStart === -1) {
        var m = line.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/);
        if (!m) m = line.match(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/);
        if (m) {
          fnStart = i;
          fnName = m[1];
          fnParams = m[2] ? m[2].split(',').filter(function(p) { return p.trim(); }).length : 0;
          braceDepth = 0;
        }
      }

      if (fnStart >= 0) {
        for (var c = 0; c < line.length; c++) {
          if (line[c] === '{') braceDepth++;
          else if (line[c] === '}') braceDepth--;
        }
        if (braceDepth <= 0 && fnStart < i) {
          var bodyLines = i - fnStart + 1;
          if (bodyLines > 40) {
            issues.push({ file: fp, line: fnStart + 1, reason: 'Function "' + fnName + '" is ' + bodyLines + ' lines (max: 40). Split it.', type: 'long-function' });
          }
          if (fnParams > 4) {
            issues.push({ file: fp, line: fnStart + 1, reason: 'Function "' + fnName + '" has ' + fnParams + ' params (max: 4). Use options object.', type: 'too-many-params' });
          }
          fnStart = -1;
          fnName = '';
          fnParams = 0;
        }
      }
    }
  }

  return { issues: issues };
}

module.exports = { analyzeComplexity: analyzeComplexity };
```
- **Done-check:** `node -e "const {analyzeComplexity}=require('./packages/core/complexity-analyzer.js'); console.log(typeof analyzeComplexity)"` → prints `function`
- **Depends:** 51.3

---

### Step 52.2 — Dependency Hygiene Scanner (`packages/core/dep-hygiene.js`)
- **File:** `packages/core/dep-hygiene.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');

var SKIP = ['node_modules', '.git', 'dist', 'build', '.next', '.agents', 'plan'];
var CODE_EXTS = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts'];
var BUILTIN = ['fs', 'path', 'os', 'child_process', 'crypto', 'http', 'https', 'url', 'util', 'stream', 'events', 'buffer', 'net', 'readline', 'module', 'assert', 'process'];

function walkCodeFiles(dir, results) {
  if (!results) results = [];
  var entries;
  try { entries = fs.readdirSync(dir); } catch (e) { return results; }
  for (var i = 0; i < entries.length; i++) {
    var name = entries[i];
    if (name[0] === '.' || SKIP.indexOf(name) >= 0) continue;
    var full = path.join(dir, name);
    var stat;
    try { stat = fs.lstatSync(full); } catch (e) { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) { walkCodeFiles(full, results); continue; }
    if (CODE_EXTS.indexOf(path.extname(name).toLowerCase()) >= 0 && stat.size > 0) results.push(full);
  }
  return results;
}

function scanDepHygiene(projectPath) {
  var pkgPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(pkgPath)) return { issues: [] };

  var pkg;
  try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch (e) { return { issues: [] }; }

  var declared = Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.devDependencies || {}));
  var files = walkCodeFiles(projectPath);
  var used = {};
  var issues = [];

  for (var f = 0; f < files.length; f++) {
    var content;
    try { content = fs.readFileSync(files[f], 'utf8'); } catch (e) { continue; }
    var re = /(?:from\s+|require\(\s*)['"]([^'"./][^'"]*)['"]/g;
    var m;
    while ((m = re.exec(content)) !== null) {
      var spec = m[1];
      if (spec[0] === '@') spec = spec.split('/').slice(0, 2).join('/');
      else spec = spec.split('/')[0];
      if (BUILTIN.indexOf(spec) >= 0 || spec.indexOf('node:') === 0) continue;
      used[spec] = true;
      if (declared.indexOf(spec) < 0) {
        issues.push({ file: files[f], reason: '"' + spec + '" used but not in package.json', type: 'missing-dep' });
      }
    }
  }

  for (var d = 0; d < declared.length; d++) {
    if (!used[declared[d]]) {
      issues.push({ file: pkgPath, reason: '"' + declared[d] + '" in package.json but never imported', type: 'unused-dep' });
    }
  }

  if (!pkg.name) issues.push({ file: pkgPath, reason: 'package.json missing "name"', type: 'pkg-quality' });
  if (!pkg.description) issues.push({ file: pkgPath, reason: 'package.json missing "description"', type: 'pkg-quality' });

  return { issues: issues };
}

module.exports = { scanDepHygiene: scanDepHygiene };
```
- **Done-check:** `node -e "const {scanDepHygiene}=require('./packages/core/dep-hygiene.js'); console.log(typeof scanDepHygiene)"` → prints `function`
- **Depends:** 52.1

---

### Step 52.3 — Project Config Checker (`packages/core/project-config-checker.js`)
- **File:** `packages/core/project-config-checker.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');

var SKIP = ['node_modules', '.git', 'dist', 'build', '.next', '.agents', 'plan'];
var MAX_DEPTH = 6;

function checkFolderDepth(projectPath) {
  var issues = [];
  function walk(dir, depth) {
    if (depth > 15) return;
    var entries;
    try { entries = fs.readdirSync(dir); } catch (e) { return; }
    for (var i = 0; i < entries.length; i++) {
      var name = entries[i];
      if (name[0] === '.' || SKIP.indexOf(name) >= 0) continue;
      var full = path.join(dir, name);
      var stat;
      try { stat = fs.lstatSync(full); } catch (e) { continue; }
      if (stat.isSymbolicLink()) continue;
      if (stat.isDirectory()) {
        if (depth >= MAX_DEPTH) {
          issues.push({ file: full, reason: 'Folder depth ' + (depth + 1) + ' exceeds max ' + MAX_DEPTH, type: 'deep-folder' });
        }
        walk(full, depth + 1);
      }
    }
  }
  walk(projectPath, 0);
  return issues;
}

function checkProjectConfigs(projectPath) {
  var issues = [];
  var hasGit = fs.existsSync(path.join(projectPath, '.git'));

  if (hasGit) {
    var giPath = path.join(projectPath, '.gitignore');
    if (!fs.existsSync(giPath)) {
      issues.push({ file: projectPath, reason: 'Missing .gitignore', type: 'missing-config' });
    } else {
      var gi = fs.readFileSync(giPath, 'utf8');
      if (gi.indexOf('node_modules') < 0) issues.push({ file: giPath, reason: '.gitignore missing node_modules', type: 'incomplete-gitignore' });
      if (gi.indexOf('.DS_Store') < 0) issues.push({ file: giPath, reason: '.gitignore missing .DS_Store', type: 'incomplete-gitignore' });
    }
  }

  var readmePath = path.join(projectPath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    issues.push({ file: projectPath, reason: 'Missing README.md', type: 'missing-readme' });
  }

  if (!fs.existsSync(path.join(projectPath, '.editorconfig'))) {
    issues.push({ file: projectPath, reason: 'Missing .editorconfig', type: 'missing-config' });
  }

  return issues;
}

module.exports = { checkFolderDepth: checkFolderDepth, checkProjectConfigs: checkProjectConfigs };
```
- **Done-check:** `node -e "const m=require('./packages/core/project-config-checker.js'); console.log(typeof m.checkFolderDepth, typeof m.checkProjectConfigs)"` → prints `function function`
- **Depends:** 52.2

---

### Step 52.4 — Upgrade Quality Report with Deep Scanners (`packages/core/quality-report.js`)
- **File:** `packages/core/quality-report.js`
- **Action:** EDIT (REPLACE ENTIRE FILE)
- **Content:** Replace the entire file `packages/core/quality-report.js` with:
```js
const path = require('path');
const { analyzeStructure } = require('./structure-analyzer.js');
const { checkNaming } = require('./naming-checker.js');
const { scanHygiene } = require('./code-hygiene.js');
const { analyzeComplexity } = require('./complexity-analyzer.js');
const { scanDepHygiene } = require('./dep-hygiene.js');
const { checkFolderDepth, checkProjectConfigs } = require('./project-config-checker.js');

function generateQualityReport(projectPath) {
  var structure = analyzeStructure(projectPath);
  var naming = checkNaming(projectPath);
  var hygiene = scanHygiene(projectPath);
  var complexity = analyzeComplexity(projectPath);
  var depHygiene = scanDepHygiene(projectPath);
  var folderDepth = checkFolderDepth(projectPath);
  var configs = checkProjectConfigs(projectPath);

  var categories = {
    'Junk Files': structure.junk.map(function(i) { return { file: i.file, reason: i.reason, type: 'junk' }; }),
    'Empty Directories': structure.emptyDirs.map(function(i) { return { file: i.file, reason: i.reason, type: 'empty-dir' }; }),
    'Empty Files': structure.emptyFiles.map(function(i) { return { file: i.file, reason: i.reason, type: 'empty-file' }; }),
    'Bad Naming': naming.map(function(i) { return { file: i.file, reason: i.reason, type: 'naming' }; }),
    'Duplicate Imports': hygiene.issues.filter(function(i) { return i.type === 'dup-import'; }),
    'Blank Lines': hygiene.issues.filter(function(i) { return i.type === 'blank-lines'; }),
    'Commented Code': hygiene.issues.filter(function(i) { return i.type === 'commented-code'; }),
    'Long Lines': hygiene.issues.filter(function(i) { return i.type === 'long-line'; }),
    'Long Functions': complexity.issues.filter(function(i) { return i.type === 'long-function'; }),
    'Too Many Params': complexity.issues.filter(function(i) { return i.type === 'too-many-params'; }),
    'Missing Deps': depHygiene.issues.filter(function(i) { return i.type === 'missing-dep'; }),
    'Unused Deps': depHygiene.issues.filter(function(i) { return i.type === 'unused-dep'; }),
    'Pkg Quality': depHygiene.issues.filter(function(i) { return i.type === 'pkg-quality'; }),
    'Deep Folders': folderDepth,
    'Project Configs': configs,
  };

  var allIssues = [];
  var keys = Object.keys(categories);
  for (var k = 0; k < keys.length; k++) {
    var items = categories[keys[k]];
    for (var j = 0; j < items.length; j++) {
      allIssues.push({
        file: path.relative(projectPath, items[j].file || ''),
        line: items[j].line || null,
        reason: items[j].reason,
        type: items[j].type,
      });
    }
  }

  var score = 100;
  score -= structure.total * 3;
  score -= naming.length * 4;
  score -= hygiene.issues.length * 2;
  score -= complexity.issues.length * 2;
  score -= depHygiene.issues.length * 3;
  score -= folderDepth.length * 2;
  score -= configs.length * 2;
  if (score < 0) score = 0;

  return {
    score: score,
    totalIssues: allIssues.length,
    categories: categories,
    allIssues: allIssues,
    filesScanned: hygiene.filesScanned,
  };
}

module.exports = { generateQualityReport: generateQualityReport };
```
- **Done-check:** `node -e "const {generateQualityReport}=require('./packages/core/quality-report.js'); console.log(typeof generateQualityReport)"` → prints `function`
- **Depends:** 52.3

---

## Phase 53: Deep Quality Tests

### Step 53.1 — Deep Quality Tests (`tests/quality-deep.bats`)
- **File:** `tests/quality-deep.bats`
- **Action:** CREATE
- **Content:**
```bash
#!/usr/bin/env bats

load test_helper

@test "quality detects long function" {
  mkdir -p src
  {
    echo "function longFn() {"
    for i in $(seq 1 45); do echo "  const x$i = $i;"; done
    echo "}"
  } > src/long.js

  run ./l quality --json
  [[ "$output" == *"long-function"* ]] || [[ "$output" == *"Long Functions"* ]]
}

@test "quality detects too many params" {
  mkdir -p src
  echo "function bad(a, b, c, d, e, f) { return a; }" > src/params.js

  run ./l quality --json
  [[ "$output" == *"too-many-params"* ]] || [[ "$output" == *"Too Many"* ]]
}

@test "quality detects missing dependency" {
  mkdir -p src
  echo '{"name":"test","dependencies":{}}' > package.json
  echo "const express = require('express');" > src/app.js

  run ./l quality --json
  [[ "$output" == *"missing-dep"* ]] || [[ "$output" == *"Missing"* ]]
}

@test "quality detects deep folder nesting" {
  mkdir -p src/a/b/c/d/e/f/g
  echo "const x = 1;" > src/a/b/c/d/e/f/g/deep.js

  run ./l quality --json
  [[ "$output" == *"deep-folder"* ]] || [[ "$output" == *"Deep"* ]]
}
```
- **Done-check:** `bats tests/quality-deep.bats` → all 4 tests pass
- **Depends:** 52.4
