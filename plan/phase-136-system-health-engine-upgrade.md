# Phase 136: System Health Engine Upgrade — Real Scores, Cache TTL & Layout Fix

> **Objective:** Fix 5 bugs in the System Health system: grid layout broken on desktop, cache never expires, quality score is fake, circular-dep detector not connected, and HealthCoreChecklist is always empty. Zero regressions.

---

## 📋 Execution Steps

### Step 136.1 — Fix HealthCommandCenter Grid Layout (`dashboard/src/components/HealthCommandCenter.jsx`)
- **File**: `dashboard/src/components/HealthCommandCenter.jsx`
- **Action**: EDIT
- **Content**: Wrap `<HealthScoreGauge>` in a `<div className="lg:col-span-4">` so the 12-column grid renders correctly. The grid parent uses `lg:grid-cols-12` and `HealthPillarGrid` already has `lg:col-span-8` built in. Without wrapping the gauge in `col-span-4`, the gauge gets 1 column instead of 4 and the layout breaks on desktop.

Find this block (around line 67-76):
```jsx
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <HealthScoreGauge
              score={score}
              scoreColor={scoreColor}
              healthScore={healthScore}
              qualityScore={qualityScore}
              filesScanned={health.filesScanned}
              passed={health.passed}
            />
            <HealthPillarGrid breakdown={breakdown} />
          </div>
```

Replace with:
```jsx
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <HealthScoreGauge
                score={score}
                scoreColor={scoreColor}
                healthScore={healthScore}
                qualityScore={qualityScore}
                filesScanned={health.filesScanned}
                passed={health.passed}
              />
            </div>
            <HealthPillarGrid breakdown={breakdown} />
          </div>
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 136.2 — Add 5-Minute TTL to Scan Cache (`dashboard/src/utils/scan-cache.js`)
- **File**: `dashboard/src/utils/scan-cache.js`
- **Action**: EDIT
- **Content**: Add a `CACHE_TTL_MS` constant set to `5 * 60 * 1000` (5 minutes). In `getCachedHealth` and `getCachedIntelligence`, check if `Date.now() - entry.timestamp > CACHE_TTL_MS`. If expired, delete the entry and return `null`.

Find this code (line 1-6):
```js
const healthStore = new Map();
const intelligenceStore = new Map();
```

Replace with:
```js
const CACHE_TTL_MS = 5 * 60 * 1000;
const healthStore = new Map();
const intelligenceStore = new Map();
```

Find `getCachedHealth` function (line 9-14):
```js
export function getCachedHealth(projectId) {
  if (!projectId) return null;
  const entry = healthStore.get(String(projectId));
  if (!entry) return null;
  return entry.data;
}
```

Replace with:
```js
export function getCachedHealth(projectId) {
  if (!projectId) return null;
  const key = String(projectId);
  const entry = healthStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    healthStore.delete(key);
    return null;
  }
  return entry.data;
}
```

Find `getCachedIntelligence` function (line 30-35):
```js
export function getCachedIntelligence(projectId) {
  if (!projectId) return null;
  const entry = intelligenceStore.get(String(projectId));
  if (!entry) return null;
  return entry.data;
}
```

Replace with:
```js
export function getCachedIntelligence(projectId) {
  if (!projectId) return null;
  const key = String(projectId);
  const entry = intelligenceStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    intelligenceStore.delete(key);
    return null;
  }
  return entry.data;
}
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 136.3 — Merge Quality Report Into Health API (`dashboard/src/server/health.js`)
- **File**: `dashboard/src/server/health.js`
- **Action**: EDIT
- **Content**: After calling `calculateHealth()`, also load `quality-report.js` via `loadCoreModule('quality-report.js')` and call `generateQualityReport()`. Merge the quality score, quality breakdown, and checks array into the response. This gives the dashboard REAL quality scores instead of fake fallbacks.

Replace the entire file content with:
```js
import { Router } from 'express';
import { getSettings } from './settings.js';
import { loadHealthModule, loadCoreModule } from './module-loader.js';

const router = Router();

router.get('/projects/:id/health', (req, res) => {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const mod = loadHealthModule();
    if (!mod) return res.status(500).json({ error: 'Health module not available' });

    const healthResult = mod.calculateHealth(project.path);

    let qualityScore = healthResult.score;
    let qualityBreakdown = {};
    let checks = [];

    const qualityMod = loadCoreModule('quality-report.js');
    if (qualityMod && qualityMod.generateQualityReport) {
      const qr = qualityMod.generateQualityReport(project.path);
      qualityScore = qr.score;
      qualityBreakdown = qr.breakdown || {};
      checks = [
        { name: 'Syntax Clean', passed: healthResult.breakdown.syntaxErrors === 0 },
        { name: 'Imports Resolved', passed: healthResult.breakdown.brokenImports === 0 },
        { name: 'Rule 0 Compliant', passed: healthResult.breakdown.rule0Violations === 0 },
        { name: 'No Critical Security', passed: healthResult.breakdown.criticalSecurity === 0 },
        { name: 'No Security Warnings', passed: healthResult.breakdown.warningSecurity === 0, optional: true },
        { name: 'Structure Clean', passed: (qualityBreakdown.structureIssues || 0) === 0, optional: true },
        { name: 'Naming Conventions', passed: (qualityBreakdown.namingIssues || 0) === 0, optional: true },
        { name: 'Code Hygiene', passed: (qualityBreakdown.hygieneIssues || 0) === 0, optional: true },
      ];
    }

    res.json({
      ...healthResult,
      healthScore: healthResult.score,
      qualityScore,
      qualityBreakdown,
      checks,
      breakdown: {
        ...healthResult.breakdown,
        ...qualityBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 136.4 — Connect Circular Dependency Detector (`packages/core/health-score.js`)
- **File**: `packages/core/health-score.js`
- **Action**: EDIT
- **Content**: Add a try/catch `require` for `circular-dep-detector.js`. Call `detectCircularDeps()` inside `calculateHealth()`. Add cycle count to breakdown and penalize score by 5 points per cycle (max 20 points penalty).

Replace the entire file content with:
```js
const { scanWorkspace } = require('./workspace-scanner.js');
const { scanSecurity } = require('./security-scanner.js');

let detectCircularDeps;
try { detectCircularDeps = require('./circular-dep-detector.js').detectCircularDeps; } catch { detectCircularDeps = null; }

function calculateHealth(projectPath, options = {}) {
  const workspace = scanWorkspace(projectPath);
  const security = scanSecurity(projectPath);

  const syntaxErrors = workspace.issues.filter(i => i.type === 'syntax').length;
  const brokenImports = workspace.issues.filter(i => i.type === 'broken-import').length;
  const rule0Violations = workspace.issues.filter(i => i.type === 'rule0').length;
  const criticalSecurity = security.issues.filter(i => i.severity === 'critical').length;
  const warningSecurity = security.issues.filter(i => i.severity === 'warning').length;

  let circularDeps = 0;
  if (detectCircularDeps) {
    try {
      const result = detectCircularDeps(projectPath);
      circularDeps = result.cycles ? result.cycles.length : 0;
    } catch { circularDeps = 0; }
  }

  let score = 100;
  score -= syntaxErrors * 10;
  score -= brokenImports * 5;
  score -= rule0Violations * 8;
  score -= criticalSecurity * 15;
  score -= warningSecurity * 2;
  score -= Math.min(circularDeps * 5, 20);
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
    breakdown: { syntaxErrors, brokenImports, rule0Violations, criticalSecurity, warningSecurity, circularDeps },
    issues: allIssues,
  };
}

module.exports = { calculateHealth };
```

- **Done-check**: `node -e "const h = require('./packages/core/health-score.js'); const r = h.calculateHealth('.'); console.log('score:', r.score, 'circularDeps:', r.breakdown.circularDeps); process.exit(r.score >= 0 ? 0 : 1)"` -> exit 0
- **Depends**: None

---

### Step 136.5 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Run full rebuild of engine binary and Vite dashboard bundle. Run all tests.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 136.1, 136.2, 136.3, 136.4

---

### Step 136.6 — Final Validation & Checkpoint (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run `./l v`, `./l health`, `./l quality`, and `npm run release:check`. All must pass. Then save a checkpoint with `./l cp save "Phase 136 — System Health Engine Upgrade"`. Add Phase 136 entry to PROGRESS.md.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 136.5
