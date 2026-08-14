# Phase 52: Deep Code Quality Scanners

> প্রতিটি step-এ সম্পূর্ণ কোড দেওয়া আছে। শুধু copy-paste করলেই হবে।
> কোনো চিন্তা করতে হবে না, কোনো guess করতে হবে না।

---

### Step 52.1 — Function Complexity Analyzer (`packages/core/complexity-analyzer.js`)
- **File:** `packages/core/complexity-analyzer.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');

const SKIP = ['node_modules', '.git', 'dist', 'build', '.agents', 'plan', 'marketing', 'tests'];
const CODE_EXTS = ['.js', '.jsx', '.cjs', '.mjs'];

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
    if (CODE_EXTS.includes(ext) && stat.size > 0) results.push(full);
  }
  return results;
}

function analyzeComplexity(projectPath) {
  const files = walkCode(projectPath);
  const issues = [];
  const stats = { totalFunctions: 0, complexFunctions: 0 };

  for (const filePath of files) {
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); } catch { continue; }
    const lines = content.split('\n');

    // Count function declarations and estimate complexity
    const funcPattern = /^\s*(function\s+\w+|const\s+\w+\s*=\s*(async\s+)?(\([^)]*\)|[\w]+)\s*=>|module\.exports\s*=\s*function|exports\.\w+\s*=\s*function)/;
    let currentFunc = null;
    let braceDepth = 0;
    let funcStart = 0;
    let ifCount = 0;
    let loopCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed.startsWith('//')) continue;

      if (funcPattern.test(line) && braceDepth <= 1) {
        if (currentFunc && (ifCount + loopCount) > 8) {
          const lineCount = i - funcStart;
          issues.push({
            file: filePath,
            line: funcStart + 1,
            type: 'high-complexity',
            msg: `Function "${currentFunc}" has complexity ${ifCount + loopCount} (${lineCount} lines)`,
          });
          stats.complexFunctions++;
        }
        const match = line.match(/function\s+(\w+)|const\s+(\w+)/);
        currentFunc = match ? (match[1] || match[2]) : 'anonymous';
        funcStart = i;
        ifCount = 0;
        loopCount = 0;
        stats.totalFunctions++;
      }

      if (/\b(if|else if|case|\?\s*:)\b/.test(trimmed)) ifCount++;
      if (/\b(for|while|do)\b/.test(trimmed)) loopCount++;
    }

    // Check last function
    if (currentFunc && (ifCount + loopCount) > 8) {
      const lineCount = lines.length - funcStart;
      issues.push({
        file: filePath,
        line: funcStart + 1,
        type: 'high-complexity',
        msg: `Function "${currentFunc}" has complexity ${ifCount + loopCount} (${lineCount} lines)`,
      });
      stats.complexFunctions++;
    }
  }

  return { filesChecked: files.length, stats, issues };
}

module.exports = { analyzeComplexity };
```
- **Done-check:** `node -e "require('./packages/core/complexity-analyzer.js')"` → no error
- **Depends:** None

---

### Step 52.2 — Dependency Hygiene Scanner (`packages/core/dep-hygiene.js`)
- **File:** `packages/core/dep-hygiene.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');

function scanDependencyHygiene(projectPath) {
  const issues = [];
  const pkgPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return { checked: false, issues: [{ type: 'no-package-json', msg: 'No package.json found' }] };
  }

  let pkg;
  try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch (e) {
    return { checked: false, issues: [{ type: 'invalid-package-json', msg: 'Invalid package.json: ' + e.message }] };
  }

  const deps = Object.keys(pkg.dependencies || {});
  const devDeps = Object.keys(pkg.devDependencies || {});

  // Check for pinned versions (no ^ or ~)
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  for (const [name, version] of Object.entries(allDeps)) {
    if (version === '*' || version === 'latest') {
      issues.push({ type: 'unpinned-dep', msg: `Unpinned dependency: ${name}@${version}` });
    }
  }

  // Check for duplicate deps in both dependencies and devDependencies
  for (const name of deps) {
    if (devDeps.includes(name)) {
      issues.push({ type: 'duplicate-dep', msg: `${name} appears in both dependencies and devDependencies` });
    }
  }

  // Check node_modules exists
  const nmPath = path.join(projectPath, 'node_modules');
  if (deps.length > 0 && !fs.existsSync(nmPath)) {
    issues.push({ type: 'missing-node-modules', msg: 'node_modules not found — run npm install' });
  }

  // Check for missing required fields
  if (!pkg.name) issues.push({ type: 'missing-field', msg: 'package.json missing "name" field' });
  if (!pkg.version) issues.push({ type: 'missing-field', msg: 'package.json missing "version" field' });

  return {
    checked: true,
    totalDeps: deps.length,
    totalDevDeps: devDeps.length,
    issues,
  };
}

module.exports = { scanDependencyHygiene };
```
- **Done-check:** `node -e "require('./packages/core/dep-hygiene.js')"` → no error
- **Depends:** 52.1

---

### Step 52.3 — Project Config Checker (`packages/core/project-config-checker.js`)
- **File:** `packages/core/project-config-checker.js`
- **Action:** CREATE
- **Content:**
```js
const fs = require('fs');
const path = require('path');

function checkProjectConfig(projectPath) {
  const issues = [];
  const checks = [];

  // Check .gitignore exists
  const gitignore = path.join(projectPath, '.gitignore');
  if (fs.existsSync(gitignore)) {
    const content = fs.readFileSync(gitignore, 'utf8');
    checks.push({ name: '.gitignore', exists: true });
    if (!content.includes('node_modules')) {
      issues.push({ type: 'gitignore-missing', msg: '.gitignore missing node_modules' });
    }
    if (!content.includes('.env')) {
      issues.push({ type: 'gitignore-missing', msg: '.gitignore missing .env files' });
    }
  } else {
    checks.push({ name: '.gitignore', exists: false });
    issues.push({ type: 'missing-gitignore', msg: 'No .gitignore file found' });
  }

  // Check README exists
  const readme = path.join(projectPath, 'README.md');
  if (fs.existsSync(readme)) {
    checks.push({ name: 'README.md', exists: true });
    const content = fs.readFileSync(readme, 'utf8');
    if (content.trim().length < 50) {
      issues.push({ type: 'empty-readme', msg: 'README.md is too short (less than 50 chars)' });
    }
  } else {
    checks.push({ name: 'README.md', exists: false });
    issues.push({ type: 'missing-readme', msg: 'No README.md file found' });
  }

  // Check LICENSE exists
  const license = path.join(projectPath, 'LICENSE');
  const licenseMd = path.join(projectPath, 'LICENSE.md');
  if (fs.existsSync(license) || fs.existsSync(licenseMd)) {
    checks.push({ name: 'LICENSE', exists: true });
  } else {
    checks.push({ name: 'LICENSE', exists: false });
    issues.push({ type: 'missing-license', msg: 'No LICENSE file found' });
  }

  // Check for .env files in repo (should be gitignored)
  const envFile = path.join(projectPath, '.env');
  if (fs.existsSync(envFile)) {
    checks.push({ name: '.env', exists: true });
    issues.push({ type: 'env-in-repo', msg: '.env file found in project root — ensure it is gitignored' });
  }

  return { checks, issues };
}

module.exports = { checkProjectConfig };
```
- **Done-check:** `node -e "require('./packages/core/project-config-checker.js')"` → no error
- **Depends:** 52.2

---

### Step 52.4 — Upgrade Quality Report with Deep Scanners (`packages/core/quality-report.js`)
- **File:** `packages/core/quality-report.js`
- **Action:** EDIT (full file replace — file is about 35 lines)
- **Content (full file):**
```js
const { analyzeStructure } = require('./structure-analyzer.js');
const { checkNaming } = require('./naming-checker.js');
const { scanHygiene } = require('./code-hygiene.js');

let analyzeComplexity, scanDependencyHygiene, checkProjectConfig;
try { analyzeComplexity = require('./complexity-analyzer.js').analyzeComplexity; } catch { analyzeComplexity = null; }
try { scanDependencyHygiene = require('./dep-hygiene.js').scanDependencyHygiene; } catch { scanDependencyHygiene = null; }
try { checkProjectConfig = require('./project-config-checker.js').checkProjectConfig; } catch { checkProjectConfig = null; }

function generateQualityReport(projectPath) {
  const structure = analyzeStructure(projectPath);
  const naming = checkNaming(projectPath);
  const hygiene = scanHygiene(projectPath);

  const allIssues = [
    ...structure.issues.map(i => ({ ...i, category: 'structure' })),
    ...naming.issues.map(i => ({ ...i, category: 'naming' })),
    ...hygiene.issues.map(i => ({ ...i, category: 'hygiene' })),
  ];

  // Deep scanners (optional — fail gracefully)
  let complexityStats = null;
  if (analyzeComplexity) {
    const c = analyzeComplexity(projectPath);
    complexityStats = c.stats;
    allIssues.push(...c.issues.map(i => ({ ...i, category: 'complexity' })));
  }

  let depStats = null;
  if (scanDependencyHygiene) {
    const d = scanDependencyHygiene(projectPath);
    depStats = { totalDeps: d.totalDeps, totalDevDeps: d.totalDevDeps };
    allIssues.push(...d.issues.map(i => ({ ...i, category: 'dependencies' })));
  }

  let configChecks = null;
  if (checkProjectConfig) {
    const p = checkProjectConfig(projectPath);
    configChecks = p.checks;
    allIssues.push(...p.issues.map(i => ({ ...i, category: 'config' })));
  }

  let score = 100;
  score -= structure.issues.filter(i => i.type === 'junk-file').length * 3;
  score -= structure.issues.filter(i => i.type === 'empty-file').length * 5;
  score -= naming.issues.length * 2;
  score -= hygiene.issues.filter(i => i.type === 'debug-log').length * 1;
  score -= hygiene.issues.filter(i => i.type === 'todo-comment').length * 1;
  if (complexityStats) score -= complexityStats.complexFunctions * 3;
  if (depStats) score -= allIssues.filter(i => i.category === 'dependencies').length * 2;
  if (configChecks) score -= allIssues.filter(i => i.category === 'config').length * 1;
  if (score < 0) score = 0;

  return {
    score,
    maxScore: 100,
    passed: score >= 80,
    breakdown: {
      structureIssues: structure.issues.length,
      namingIssues: naming.issues.length,
      hygieneIssues: hygiene.issues.length,
      complexityIssues: complexityStats ? complexityStats.complexFunctions : 0,
      dependencyIssues: allIssues.filter(i => i.category === 'dependencies').length,
      configIssues: allIssues.filter(i => i.category === 'config').length,
      totalFiles: structure.totalFiles,
      totalDirs: structure.totalDirs,
    },
    issues: allIssues,
  };
}

module.exports = { generateQualityReport };
```
- **Done-check:** `node -e "require('./packages/core/quality-report.js')"` → no error
- **Depends:** 52.3
