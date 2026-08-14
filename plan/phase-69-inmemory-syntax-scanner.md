# Phase 69: In-Memory Syntax Scanner Engine (Electron Freeze & Hang Fix)

> DMG অ্যাপে প্রজেক্টে ক্লিক করলে লোডিং হয়ে ফ্রিজ/হ্যাং হওয়ার মূল কারণ (process.execPath এর মাধ্যমে Electron নিজে বারবার স্পন হওয়া) সমাধান করতে ইন-মেমোরি V8 vm.Script সিনট্যাক্স স্ক্যানার ইঞ্জিন তৈরি করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 69: In-Memory Syntax Scanner Engine

### Step 69.1 — In-Memory JS Syntax Validation in Core Scanner (`packages/core/workspace-scanner.js`)
- **File:** `packages/core/workspace-scanner.js`
- **Action:** MODIFY
- **Depends:** None

**কী করতে হবে:**
`execFileSync(process.execPath)` এর বদলে Node.js এর নেটিভ `vm.Script` ব্যবহার করে ইন-প্রসেস মেমোরিতে সিনট্যাক্স চেক করো যাতে Electron অ্যাপে কোনো সাব-প্রসেস স্পন না হয়ে ইনস্ট্যান্ট রেসপন্স দেয়।

```javascript
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', 'release', '.agents', 'plan', '.vscode', '.github', '_archive'];
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
  let content = fs.readFileSync(filePath, 'utf8');
  content = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .replace(/\\?`[\s\S]*?\\?`/g, '""')
    .replace(/\\"[^"]*\\"/g, '""');

  const re = /^\s*(?:import\s+(?:[\w*\s{},]*\s+from\s+)?|(?:const|let|var)\s+[\w*\s{},:]+\s*=\s*require\(\s*|require\(\s*)['"]([^'"]+)['"]/gm;
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

function checkJsSyntaxInMemory(fp, content) {
  try {
    new vm.Script(content, { filename: fp });
    return null;
  } catch (e) {
    if (e.message.includes('Cannot use import statement') || e.message.includes('Unexpected token \'export\'') || e.message.includes('Unexpected identifier \'import\'')) {
      const sanitized = content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '')
        .replace(/`[\s\S]*?`/g, '""')
        .replace(/'(?:\\.|[^'\\])*'/g, '""')
        .replace(/"(?:\\.|[^"\\])*"/g, '""');
      const err = checkBalanced(sanitized, '([{', ')]}', 'bracket');
      return err ? { error: err, type: 'syntax' } : null;
    }
    return { error: e.message.split('\n')[0], type: 'syntax' };
  }
}

function scanFile(fileInfo) {
  const { path: fp, ext } = fileInfo;
  const errors = [];
  try {
    if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
      const content = fs.readFileSync(fp, 'utf8');
      const syntaxErr = checkJsSyntaxInMemory(fp, content);
      if (syntaxErr) errors.push({ file: fp, error: syntaxErr.error, type: syntaxErr.type });
      errors.push(...checkImports(fp));
    } else if (ext === '.jsx' || ext === '.tsx' || ext === '.ts') {
      let esbuild = null;
      try { esbuild = require('esbuild'); } catch {
        try { esbuild = require(path.resolve(__dirname, '..', '..', 'dashboard', 'node_modules', 'esbuild')); } catch { esbuild = null; }
      }
      if (esbuild) {
        try {
          const loader = ext.slice(1);
          esbuild.transformSync(fs.readFileSync(fp, 'utf8'), { loader });
        } catch (e) {
          errors.push({ file: fp, error: e.message.split('\n')[0], type: 'syntax' });
        }
      } else {
        const raw = fs.readFileSync(fp, 'utf8');
        const sanitized = raw
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*/g, '')
          .replace(/<[^>]*>/g, '')
          .replace(/\/(?![*+?])(?:[^\r\n\[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+\/[gimyus]*/g, '""')
          .replace(/`[\s\S]*?`/g, '""')
          .replace(/'(?:\\.|[^'\\])*'/g, '""')
          .replace(/"(?:\\.|[^"\\])*"/g, '""');
        const err = checkBalanced(sanitized, '([{', ')]}', 'bracket');
        if (err) errors.push({ file: fp, error: err, type: 'syntax' });
      }
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

module.exports = { scanWorkspace, walkFiles, countEffectiveLines, checkImports, checkJsSyntaxInMemory };
```

- **Done-check:** `test -f packages/core/workspace-scanner.js`

---

### Step 69.2 — In-Memory JS Syntax Validation in CLI (`packages/cli/syntax-checker.js`)
- **File:** `packages/cli/syntax-checker.js`
- **Action:** MODIFY
- **Depends:** Step 69.1

**কী করতে হবে:**
`packages/cli/syntax-checker.js`-এও `execFileSync(process.execPath)` এর বদলে `vm.Script` ব্যবহার করো।

```javascript
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

function checkBalanced(content, openChars, closeChars, label) {
  const stack = [];
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (openChars.includes(ch)) stack.push(ch);
    else if (closeChars.includes(ch)) {
      const open = openChars[closeChars.indexOf(ch)];
      if (stack.pop() !== open) return { ok: false, error: `Unbalanced ${label} at position ${i}` };
    }
  }
  return stack.length === 0 ? { ok: true } : { ok: false, error: `${label} has ${stack.length} unclosed pair(s)` };
}

function checkSyntax(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return checkBalanced(content, '([{', ')]}', 'bracket');
}

function checkCss(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/["'][^"']*["']/g, '""');
  return checkBalanced(content, '{', '}', 'brace');
}

function checkImportTargets(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const warnings = [];
  const re = /(?:from\s+|require\(\s*)['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const spec = m[1];
    if (!spec.startsWith('.')) continue;
    const target = path.resolve(path.dirname(filePath), spec);
    const exts = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    const exists = fs.existsSync(target) || exts.some(e => fs.existsSync(target + e)) || fs.existsSync(path.join(target, 'index.js'));
    if (!exists) warnings.push(`⚠ Possibly missing import "${spec}" in ${path.basename(filePath)}`);
  }
  return warnings;
}

const EXT_MAP = {
  '.js': 'node', '.cjs': 'node', '.mjs': 'node',
  '.jsx': 'jsx', '.ts': 'tsx', '.tsx': 'tsx',
  '.json': 'json', '.sh': 'bash', '.bash': 'bash',
  '.css': 'css'
};

function syntaxCheck(filePath) {
  if (!fs.existsSync(filePath)) return { ok: true, warnings: [], error: null };
  const stat = fs.statSync(filePath);
  if (!stat.isFile() || stat.size === 0) return { ok: true, warnings: [], error: null };

  const ext = path.extname(filePath).toLowerCase();
  const type = EXT_MAP[ext];
  if (!type) return { ok: true, warnings: [], error: null };

  const warnings = [];
  try {
    if (type === 'node') {
      const content = fs.readFileSync(filePath, 'utf8');
      try {
        new vm.Script(content, { filename: filePath });
      } catch (e) {
        if (e.message.includes('Cannot use import statement') || e.message.includes('Unexpected token \'export\'') || e.message.includes('Unexpected identifier \'import\'')) {
          const r = checkSyntax(filePath);
          if (!r.ok) return { ok: false, warnings, error: `${path.basename(filePath)}: ${r.error}` };
        } else {
          return { ok: false, warnings, error: `${path.basename(filePath)}: ${e.message.split('\n')[0]}` };
        }
      }
    } else if (type === 'json') {
      JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else if (type === 'bash') {
      execFileSync('bash', ['-n', filePath], { stdio: 'pipe' });
    } else if (type === 'jsx' || type === 'tsx') {
      const r = checkSyntax(filePath);
      if (!r.ok) return { ok: false, warnings, error: r.error };
    } else if (type === 'css') {
      const r = checkCss(filePath);
      if (!r.ok) return { ok: false, warnings, error: r.error };
    }
  } catch (e) {
    return { ok: false, warnings, error: `${path.basename(filePath)}: ${(e.stderr || e.message || '').toString().split('\n')[0]}` };
  }

  if (type === 'node' || type === 'jsx' || type === 'tsx') warnings.push(...checkImportTargets(filePath));
  return { ok: true, warnings, error: null };
}

module.exports = { syntaxCheck, checkImportTargets, checkBalanced };
```

- **Done-check:** `test -f packages/cli/syntax-checker.js`

---

### Step 69.3 — Full Verification and DMG Rebuild (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 69.1, Step 69.2

**কী করতে হবে:**
```bash
npm test
./l v
./l health
./l quality
cd dashboard && npm run build
npm run electron:build:mac
```

- **Done-check:** `test -f release/*.dmg`
