# Phase 17 — Bug Fixes

> Fix all bugs found in codebase audit. Each step has EXACT code to copy-paste.

---

## Step 17.1 — Fix ledger.cjs portable path
- **File:** `scripts/ledger.cjs`
- **Action:** EDIT
- **Done-check:** `node -e "require('./scripts/ledger.cjs')"` → exit 0
- **Depends:** Phase 15 complete

**Replace entire file with:**
```js
#!/usr/bin/env node
'use strict';

const path = require('path');

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

const cliPath = path.resolve(__dirname, '..', 'packages', 'cli', 'index.js');
require(cliPath).run();
```

**Then copy to .agents/scripts/ledger.cjs (same content).**

---

## Step 17.2 — Fix Express route collision
- **File:** `dashboard/server.js`
- **Action:** EDIT
- **Done-check:** `grep -c 'checkpointsRouter' dashboard/server.js` → 0
- **Depends:** 17.1

**Delete this line from server.js:**
```diff
-import checkpointsRouter from './src/server/checkpoints.js';
```

**Delete this line from server.js:**
```diff
-app.use('/api/projects', checkpointsRouter);
```

**Then open `dashboard/src/server/projects.js` and add at the TOP (after existing imports):**
```diff
+import checkpointsRouter from './checkpoints.js';
```

**And add at the BOTTOM (before `export default router;`):**
```diff
+router.use('/', checkpointsRouter);
```

---

## Step 17.3 — Pass index prop to StepItem
- **File:** `dashboard/src/components/PhaseView.jsx`
- **Action:** EDIT
- **Done-check:** `grep -q 'index={idx}' dashboard/src/components/PhaseView.jsx` → exit 0
- **Depends:** 17.2

**Find this line:**
```jsx
<StepItem 
  key={step.id || idx} 
  step={step} 
  projectId={projectId} 
  hasPlanFiles={hasPlanFiles} 
  onRefresh={onRefresh} 
/>
```

**Replace with:**
```jsx
<StepItem 
  key={step.id || idx} 
  step={step} 
  index={idx}
  projectId={projectId} 
  hasPlanFiles={hasPlanFiles} 
  onRefresh={onRefresh} 
/>
```

---

## Step 17.4 — Fix MetricsDashboard progress bars
- **File:** `dashboard/src/components/MetricsDashboard.jsx`
- **Action:** EDIT
- **Done-check:** `! grep -q 'width:.*percentage' dashboard/src/components/MetricsDashboard.jsx` → exit 0
- **Depends:** 17.3

**Find and DELETE these lines (line 41-48):**
```jsx
            {/* Progress bar instead of fake sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.03]">
              <motion.div
                className={`h-full ${m.color.replace('text-', 'bg-')}`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
```

---

## Step 17.5 — Fix command injection in checkpoint
- **File:** `packages/cli/cmd-checkpoint.js`
- **Action:** EDIT
- **Done-check:** `grep -q 'execFileSync' packages/cli/cmd-checkpoint.js` → exit 0
- **Depends:** 17.4

**Find line 1:**
```js
const { execSync } = require('child_process');
```

**Replace with:**
```js
const { execSync, execFileSync } = require('child_process');
```

**Find this line:**
```js
    if (dirty) execSync(`git commit -am "checkpoint: ${message}"`, { stdio: 'inherit' });
```

**Replace with:**
```js
    if (dirty) execFileSync('git', ['commit', '-am', `checkpoint: ${message}`], { stdio: 'inherit' });
```

**Find this line:**
```js
    execSync(`git tag -a "${tag}" -m "${message}"`, { stdio: 'inherit' });
```

**Replace with:**
```js
    execFileSync('git', ['tag', '-a', tag, '-m', message], { stdio: 'inherit' });
```

---

## Step 17.6 — Extract getProgressBar to colors.js
- **File:** `packages/cli/colors.js`
- **Action:** EDIT
- **Done-check:** `grep -q 'getProgressBar' packages/cli/colors.js` → exit 0
- **Depends:** 17.5

**Add BEFORE `module.exports` in colors.js:**
```js
function getProgressBar(pct, size = 15) {
  const filled = Math.round((pct / 100) * size);
  return `[${colors.green}${"█".repeat(filled)}${colors.reset}${"░".repeat(size - filled)}]`;
}
```

**Change `module.exports` in colors.js to:**
```js
module.exports = { colors, log, getProgressBar };
```

**Then in `packages/cli/cmd-complete.js`, DELETE the `getProgressBar` function (lines 8-11) and change the require:**
```diff
-const { log, colors } = require('./colors.js');
+const { log, colors, getProgressBar } = require('./colors.js');
```

**Then in `packages/cli/cmd-status.js`, change:**
```diff
-const { getProgressBar } = require('./cmd-complete.js');
+const { getProgressBar } = require('./colors.js');
```

**Then in `packages/cli/cmd-projects.js`, change:**
```diff
-const { getProgressBar } = require('./cmd-complete.js');
+const { getProgressBar } = require('./colors.js');
```

---

## Step 17.7 — Disable reorder during sidebar search
- **File:** `dashboard/src/components/Sidebar.jsx`
- **Action:** EDIT
- **Done-check:** `grep -q 'isSearching' dashboard/src/components/Sidebar.jsx` → exit 0
- **Depends:** 17.6

**Add after `const [searchQuery, setSearchQuery] = useState('');`:**
```js
const isSearching = searchQuery.trim().length > 0;
```

**Find this block:**
```jsx
<Reorder.Group as="ul" variants={containerVariants} initial="hidden" animate="show" axis="y" values={displayedItems} onReorder={handleReorder} className="space-y-2">
```

**Replace with:**
```jsx
{isSearching ? (
  <motion.ul variants={containerVariants} initial="hidden" animate="show" className="space-y-2">
) : (
  <Reorder.Group as="ul" variants={containerVariants} initial="hidden" animate="show" axis="y" values={displayedItems} onReorder={handleReorder} className="space-y-2">
)}
```

**ACTUALLY — simpler approach. Just replace the Reorder.Group line:**
```jsx
<Reorder.Group as="ul" variants={containerVariants} initial="hidden" animate="show" axis="y" values={displayedItems} onReorder={isSearching ? () => {} : handleReorder} className="space-y-2">
```

**And change the Reorder.Item drag behavior. Find:**
```jsx
<Reorder.Item
  key={p.id}
  value={p}
  className="relative"
  as="li"
  variants={itemVariants}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
```

**Replace with:**
```jsx
<Reorder.Item
  key={p.id}
  value={p}
  className="relative"
  as="li"
  variants={itemVariants}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  dragListener={!isSearching}
>
```

---

## Step 17.8 — Remove dead re-export in validate.js
- **File:** `packages/cli/validate.js`
- **Action:** EDIT
- **Done-check:** `! grep -q 'findFileRecursively' packages/cli/validate.js` → exit 0
- **Depends:** 17.7

**Find this line:**
```js
const { verifyTargetFileCore, validateProject, findFileRecursively } = require('../core/validate-project.js');
```

**Replace with:**
```js
const { verifyTargetFileCore, validateProject } = require('../core/validate-project.js');
```

**Find this block:**
```js
module.exports = {
  checkFiles,
  findFileRecursively,
  verifyTargetFile,
  validateCommand
};
```

**Replace with:**
```js
module.exports = {
  checkFiles,
  verifyTargetFile,
  validateCommand
};
```

---

## Step 17.9 — Update PROGRESS.md with Phase 17
- **File:** `.agents/PROGRESS.md`
- **Action:** EDIT
- **Done-check:** `grep -q 'Phase 17' .agents/PROGRESS.md` → exit 0
- **Depends:** 17.8

**Add Phase 17 section to PROGRESS.md and update overall totals to include 9 new steps.**
