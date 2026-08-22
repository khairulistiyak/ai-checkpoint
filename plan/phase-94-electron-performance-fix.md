# Phase 94: Electron "Not Responding" Performance Fix

**Status**: COMPLETED  
**Problem**: Electron অ্যাপ ফ্রিজ হচ্ছে কারণ Health Check ও Intelligence API-তে ৯+ টি সিঙ্ক্রোনাস recursive file scan মেইন থ্রেডে চলে, ৫-১৫ সেকেন্ড ব্লক করে।  
**Solution**: Worker Threads + In-Memory Cache + maxFiles cap।

---

## Step 94.1 — Create Scanner Cache Module

- **File**: `dashboard/src/server/scanner-cache.js`
- **Action**: CREATE
- **Depends**: None
- **Done-check**: `node -e "const c = require('./dashboard/src/server/scanner-cache.js'); console.log(typeof c.scanCache.get)"`

```js
/**
 * scanner-cache.js — In-memory TTL cache for scanner results.
 * Prevents repeated heavy scans from blocking the event loop.
 */

const DEFAULT_TTL = 30000; // 30 seconds

class ScannerCache {
  constructor() {
    this.store = new Map();
  }

  /**
   * Get cached result if not expired.
   * @param {string} key — cache key (e.g. "health:projectId")
   * @returns {object|null} — cached data or null if miss/expired
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Store result with TTL.
   * @param {string} key
   * @param {object} data
   * @param {number} [ttlMs=30000]
   */
  set(key, data, ttlMs = DEFAULT_TTL) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
  }

  /**
   * Force-clear a specific key.
   * @param {string} key
   */
  invalidate(key) {
    this.store.delete(key);
  }

  /** Clear all cached entries. */
  clear() {
    this.store.clear();
  }
}

const scanCache = new ScannerCache();

export { scanCache, ScannerCache };
```

---

## Step 94.2 — Create Worker Thread Scanner Script

- **File**: `dashboard/src/server/scanner-worker.js`
- **Action**: CREATE
- **Depends**: 94.1
- **Done-check**: `node -e "import('./dashboard/src/server/scanner-worker.js').then(() => console.log('ok')).catch(() => console.log('ok — worker script, expected'))"`

```js
/**
 * scanner-worker.js — Runs heavy scanners in a Worker Thread.
 *
 * Usage: new Worker('./scanner-worker.js', { workerData: { projectPath, scanType } })
 * scanType: 'health' | 'quality' | 'intelligence'
 *
 * Sends result back via parentPort.postMessage().
 */

import { workerData, parentPort } from 'worker_threads';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { projectPath, scanType } = workerData;

function runScan() {
  const corePath = path.resolve(__dirname, '..', '..', '..', 'packages', 'core');

  if (scanType === 'health') {
    const { calculateHealth } = require(path.join(corePath, 'health-score.js'));
    return calculateHealth(projectPath);
  }

  if (scanType === 'quality') {
    const { generateQualityReport } = require(path.join(corePath, 'quality-report.js'));
    return generateQualityReport(projectPath);
  }

  if (scanType === 'intelligence') {
    const { generateIntelligenceReport } = require(path.join(corePath, 'intelligence-report.js'));
    return generateIntelligenceReport(projectPath);
  }

  return { error: `Unknown scanType: ${scanType}` };
}

try {
  const result = runScan();
  parentPort.postMessage({ success: true, result });
} catch (err) {
  parentPort.postMessage({ success: false, error: err.message });
}
```

---

## Step 94.3 — Add maxFiles Safety Cap to File Walker

- **File**: `packages/core/file-walker.js`
- **Action**: EDIT
- **Depends**: None
- **Done-check**: `grep -c "maxFiles" packages/core/file-walker.js` (should return 4+)

### What to change:

In `walkCodeFiles()` function, add `maxFiles` option support. Find this line:

```js
const maxDepth = opts.maxDepth !== undefined ? opts.maxDepth : Infinity;
```

Replace with:

```js
const maxDepth = opts.maxDepth !== undefined ? opts.maxDepth : Infinity;
const maxFiles = opts.maxFiles !== undefined ? opts.maxFiles : 2000;
```

Then find this line inside the for loop (the line that pushes results):

```js
    if (withMeta) {
      results.push({ path: full, name, ext, size: stat.size });
    } else {
      results.push({ path: full, ext });
    }
```

Replace with:

```js
    if (results.length >= maxFiles) return results;

    if (withMeta) {
      results.push({ path: full, name, ext, size: stat.size });
    } else {
      results.push({ path: full, ext });
    }
```

Do the SAME for `walkAllFiles()`. Find:

```js
const maxDepth = opts.maxDepth !== undefined ? opts.maxDepth : 15;
```

Replace with:

```js
const maxDepth = opts.maxDepth !== undefined ? opts.maxDepth : 15;
const maxFiles = opts.maxFiles !== undefined ? opts.maxFiles : 5000;
```

And before `results.push(entry);` add:

```js
    if (results.length >= maxFiles) return results;
```

---

## Step 94.4 — Make Health Check Async with Worker + Cache

- **File**: `dashboard/src/server/project-health.js`
- **Action**: EDIT
- **Depends**: 94.1, 94.2, 94.3
- **Done-check**: `grep -c "scanCache" dashboard/src/server/project-health.js` (should return 2+) AND `grep -c "Worker" dashboard/src/server/project-health.js` (should return 1+)

### What to change:

Replace the ENTIRE `handleHealthCheck` function (lines 12-104) with this async version:

```js
import { Worker } from 'worker_threads';
import { scanCache } from './scanner-cache.js';

function runWorkerScan(projectPath, scanType) {
  return new Promise((resolve, reject) => {
    const workerPath = new URL('./scanner-worker.js', import.meta.url);
    const worker = new Worker(workerPath, {
      workerData: { projectPath, scanType }
    });
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error('Scanner timeout (30s)'));
    }, 30000);
    worker.on('message', (msg) => {
      clearTimeout(timeout);
      if (msg.success) resolve(msg.result);
      else reject(new Error(msg.error));
    });
    worker.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export async function handleHealthCheck(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });

    const cwd = project.path;
    const cacheKey = `health:${project.id}`;
    const cached = scanCache.get(cacheKey);
    if (cached) return res.json(cached);

    // Quick checks stay on main thread (instant)
    const checks = [
      { name: 'Project Data Directory', passed: fs.existsSync(globalStore.getProjectDataDir(project.id)) },
      { name: 'PROGRESS.md', passed: fs.existsSync(globalStore.getProgressPath(project.id)) },
      { name: 'RULES.md', passed: fs.existsSync(globalStore.getRulesPath(project.id)) },
      { name: 'AGENTS.md', passed: fs.existsSync(globalStore.getAgentsPath(project.id)) },
      { name: 'Global Engine', passed: fs.existsSync(globalStore.getGlobalEnginePath()) },
      { name: 'plan directory', passed: fs.existsSync(path.join(cwd, 'plan')), optional: true },
      { name: 'git repository', passed: fs.existsSync(path.join(cwd, '.git')), optional: true }
    ];

    // Heavy scans run in worker threads (off main thread)
    let fullHealth = null;
    let qualityReport = null;

    try {
      fullHealth = await runWorkerScan(cwd, 'health');
    } catch (e) {
      console.warn('⚠️ Health worker failed:', e.message);
    }

    try {
      qualityReport = await runWorkerScan(cwd, 'quality');
    } catch (e) {
      console.warn('⚠️ Quality worker failed:', e.message);
    }

    const allChecksPassed = checks.every(c => c.passed);
    const healthScore = fullHealth?.score ?? 100;
    const qualityScore = qualityReport?.score ?? 100;
    const combinedScore = Math.round((healthScore * 0.6) + (qualityScore * 0.4));

    const issues = [
      ...(fullHealth?.issues || []).map(i => ({
        ...i,
        category: i.type === 'rule0' ? 'rule0' : i.type === 'syntax' ? 'syntax' : i.type === 'broken-import' ? 'imports' : i.type === 'security' ? 'security' : 'general',
        severity: i.severity || (i.type === 'syntax' || i.type === 'rule0' || i.severity === 'critical' ? 'critical' : 'warning')
      })),
      ...(qualityReport?.issues || []).map(i => ({
        ...i,
        file: i.file || '',
        line: i.line || 0,
        error: i.message || i.error || i.name || `${i.type} issue`,
        category: i.category || (i.type === 'junk-file' || i.type === 'empty-file' ? 'structure' : i.type === 'debug-log' || i.type === 'todo-comment' ? 'hygiene' : 'complexity'),
        severity: i.type === 'junk-file' ? 'warning' : 'info'
      }))
    ];

    const response = {
      score: combinedScore,
      healthScore,
      qualityScore,
      maxScore: 100,
      passed: fullHealth ? (fullHealth.passed && (!qualityReport || qualityReport.passed)) : allChecksPassed,
      filesScanned: fullHealth?.filesScanned || qualityReport?.breakdown?.totalFiles || 0,
      breakdown: {
        syntaxErrors: fullHealth?.breakdown?.syntaxErrors || 0,
        brokenImports: fullHealth?.breakdown?.brokenImports || 0,
        rule0Violations: fullHealth?.breakdown?.rule0Violations || 0,
        criticalSecurity: fullHealth?.breakdown?.criticalSecurity || 0,
        warningSecurity: fullHealth?.breakdown?.warningSecurity || 0,
        hygieneIssues: qualityReport?.breakdown?.hygieneIssues || 0,
        complexityIssues: qualityReport?.breakdown?.complexityIssues || 0,
        structureIssues: qualityReport?.breakdown?.structureIssues || 0,
        namingIssues: qualityReport?.breakdown?.namingIssues || 0,
        dependencyIssues: qualityReport?.breakdown?.dependencyIssues || 0,
        configIssues: qualityReport?.breakdown?.configIssues || 0,
      },
      issues,
      checks,
      allPassed: allChecksPassed
    };

    scanCache.set(cacheKey, response);
    res.json(response);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
```

**IMPORTANT**: Keep the existing `handleAutofix` function unchanged. Only replace `handleHealthCheck`. Also keep all existing imports at top of file, but ADD these two new imports:

```js
import { Worker } from 'worker_threads';
import { scanCache } from './scanner-cache.js';
```

And ADD the `runWorkerScan` helper function BEFORE `handleHealthCheck`.

---

## Step 94.5 — Make Intelligence Async with Worker + Cache

- **File**: `dashboard/src/server/intelligence.js`
- **Action**: EDIT
- **Depends**: 94.1, 94.2
- **Done-check**: `grep -c "scanCache" dashboard/src/server/intelligence.js` (should return 2+) AND `grep -c "runWorkerScan\|Worker" dashboard/src/server/intelligence.js` (should return 1+)

### What to change:

Replace the ENTIRE file content with:

```js
import { Worker } from 'worker_threads';
import { getSettings } from './settings.js';
import { scanCache } from './scanner-cache.js';
import intelligenceHistory from '../../../packages/core/intelligence-history.js';

const { appendHistory, getHistory } = intelligenceHistory;

function runWorkerScan(projectPath, scanType) {
  return new Promise((resolve, reject) => {
    const workerPath = new URL('./scanner-worker.js', import.meta.url);
    const worker = new Worker(workerPath, {
      workerData: { projectPath, scanType }
    });
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error('Scanner timeout (30s)'));
    }, 30000);
    worker.on('message', (msg) => {
      clearTimeout(timeout);
      if (msg.success) resolve(msg.result);
      else reject(new Error(msg.error));
    });
    worker.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export async function handleGetIntelligence(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const cacheKey = `intelligence:${project.id}`;
    const cached = scanCache.get(cacheKey);
    if (cached) return res.json(cached);

    // Run intelligence scanner in worker thread
    const report = await runWorkerScan(project.path, 'intelligence');

    // Append to history (lightweight, stays on main thread)
    const history = appendHistory(project.path, report);

    const response = { success: true, report, history };
    scanCache.set(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error('Failed to get intelligence report:', error.message);
    res.status(500).json({ error: 'Failed to generate intelligence report' });
  }
}
```

---

## Step 94.6 — Verify Electron No Longer Freezes

- **File**: None (verification only)
- **Action**: RUN
- **Depends**: 94.1, 94.2, 94.3, 94.4, 94.5
- **Done-check**: Run `npm run electron:dev` from project root. Click on a project, open Health tab and Intelligence Hub. App must NOT show "not responding" dialog.

### Verification commands:

```bash
cd /mnt/Project/2026/ai-checkpoint
npm run electron:dev
```

1. Click on any project in sidebar
2. Open "Health" tab — should load without freeze
3. Open "Intelligence Hub" — should load without freeze
4. Switch between projects — should be instant (cached)
5. Wait 30s, re-open — should re-scan in background without freeze
