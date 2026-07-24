# Phase 18 — Bug Fixes Round 2

> Second audit found 9 bugs. Each step has EXACT code to copy-paste.

---

## Step 18.1 — Fix setup.sh missing packages/core copy
- **File:** `setup.sh`
- **Action:** EDIT
- **Done-check:** `grep -q 'packages/core' setup.sh` → exit 0
- **Depends:** Phase 17 complete

**WHY:** setup.sh copies `packages/cli/` to installed projects, but CLI files `require('../core/parse-progress.js')`. Since `packages/core/` is never copied, the CLI crashes with MODULE_NOT_FOUND in any freshly installed project.

**Find this block (line 49-50):**
```bash
mkdir -p "$PROJECT_DIR/.agents/packages/cli"
cp -r "$SCRIPT_DIR/packages/cli/"* "$PROJECT_DIR/.agents/packages/cli/"
```

**Replace with:**
```bash
mkdir -p "$PROJECT_DIR/.agents/packages/cli"
mkdir -p "$PROJECT_DIR/.agents/packages/core"
cp -r "$SCRIPT_DIR/packages/cli/"* "$PROJECT_DIR/.agents/packages/cli/"
cp -r "$SCRIPT_DIR/packages/core/"* "$PROJECT_DIR/.agents/packages/core/"
```

---

## Step 18.2 — Fix dashboard install route missing packages/core
- **File:** `dashboard/src/server/projects.js`
- **Action:** EDIT
- **Done-check:** `grep -q 'packages/core' dashboard/src/server/projects.js` → exit 0
- **Depends:** 18.1

**WHY:** Same bug as 18.1 but in the dashboard's "Install" button handler. When a project is installed from the dashboard UI, `packages/core/` is not copied.

**Find this block (around line 65-71):**
```js
    fs.mkdirSync(path.join(projectDir, '.agents', 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(projectDir, 'plan', 'drafts'), { recursive: true });

    const ledgerSrc = path.join(scriptsDir, 'ledger.cjs');
    if (fs.existsSync(ledgerSrc)) {
      fs.copyFileSync(ledgerSrc, path.join(projectDir, '.agents', 'scripts', 'ledger.cjs'));
    }
```

**Replace with:**
```js
    fs.mkdirSync(path.join(projectDir, '.agents', 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(projectDir, '.agents', 'packages', 'cli'), { recursive: true });
    fs.mkdirSync(path.join(projectDir, '.agents', 'packages', 'core'), { recursive: true });
    fs.mkdirSync(path.join(projectDir, 'plan', 'drafts'), { recursive: true });

    const ledgerSrc = path.join(scriptsDir, 'ledger.cjs');
    if (fs.existsSync(ledgerSrc)) {
      fs.copyFileSync(ledgerSrc, path.join(projectDir, '.agents', 'scripts', 'ledger.cjs'));
    }

    // Copy CLI and Core packages
    const cliSrcDir = path.join(aiCheckpointRoot, 'packages', 'cli');
    const coreSrcDir = path.join(aiCheckpointRoot, 'packages', 'core');
    for (const srcDir of [cliSrcDir, coreSrcDir]) {
      if (fs.existsSync(srcDir)) {
        const destDir = path.join(projectDir, '.agents', 'packages', path.basename(srcDir));
        const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));
        for (const f of files) {
          fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
        }
      }
    }
```

---

## Step 18.3 — Fix remaining shell injection in cmd-checkpoint.js
- **File:** `packages/cli/cmd-checkpoint.js`
- **Action:** EDIT
- **Done-check:** `! grep -q 'execSync(\`' packages/cli/cmd-checkpoint.js` → exit 0
- **Depends:** 18.2

**WHY:** Step 17.5 fixed `git commit` and `git tag`, but 4 more `execSync` calls still use template literals with shell interpolation. The `tag` parameter in `checkpointBack` comes directly from user CLI args — a user could run `./l cp back "; rm -rf /"`.

**Replace the ENTIRE file with:**
```js
const { execSync, execFileSync } = require('child_process');
const { log } = require('./colors.js');
const { parseProgress } = require('./parse-progress.js');
const { validateCommand } = require('./validate.js');

function getCurrentStep() {
  const { phases } = parseProgress();
  for (const p of phases) {
    for (const s of p.steps) {
      if (s.status !== 'done') return s.number;
    }
  }
  const all = phases.flatMap(p => p.steps);
  return all.length ? all[all.length - 1].number : '0.0';
}

function checkpointSave(message) {
  if (!message) { log.error('Message required: ./l cp save "message"'); process.exit(1); }
  validateCommand();
  const step = getCurrentStep();
  const prefix = `aicp/${step}-`;
  let count = 0;
  try {
    const out = execFileSync('git', ['tag', '-l', `${prefix}*`], { stdio: 'pipe', encoding: 'utf8' }).trim();
    count = out ? out.split('\n').filter(Boolean).length : 0;
  } catch { count = 0; }
  const tag = `${prefix}${count + 1}`;
  try {
    const dirty = execFileSync('git', ['status', '--porcelain'], { stdio: 'pipe', encoding: 'utf8' }).trim();
    if (dirty) execFileSync('git', ['commit', '-am', `checkpoint: ${message}`], { stdio: 'inherit' });
  } catch (e) { log.error('Commit failed'); process.exit(1); }
  try {
    execFileSync('git', ['tag', '-a', tag, '-m', message], { stdio: 'inherit' });
  } catch (e) { log.error('Tag failed'); process.exit(1); }
  log.success(`Checkpoint saved: ${tag}`);
}

function checkpointList() {
  let tags = '';
  try {
    tags = execFileSync('git', ['tag', '-n1'], { stdio: 'pipe', encoding: 'utf8' });
  } catch { tags = ''; }
  const lines = tags.trim().split('\n').filter(line => line.startsWith('aicp/'));
  if (lines.length === 0) { console.log('No checkpoints found'); return; }
  console.log('TAG'.padEnd(20), 'MESSAGE');
  lines.forEach(line => {
    const [tag, ...msg] = line.trim().split(/\s+/);
    console.log(tag.padEnd(20), msg.join(' '));
  });
}

function checkpointBack(tag, force) {
  let stashId = null;
  try {
    const dirty = execFileSync('git', ['status', '--porcelain'], { stdio: 'pipe', encoding: 'utf8' }).trim();
    if (dirty) {
      const msg = `aicp-rollback-${Math.floor(Date.now() / 1000)}`;
      execFileSync('git', ['stash', 'push', '-u', '-m', msg], { stdio: 'inherit' });
      stashId = msg;
    }
  } catch (e) {
    log.error('Stash failed');
    process.exit(1);
  }
  if (!tag) {
    checkpointList();
    log.info('Specify tag: ./l cp back <tag>');
    if (stashId) log.info(`Stashed changes: ${stashId}`);
    process.exit(0);
  }
  // Validate tag format to prevent injection
  if (!/^aicp\/[\w.-]+$/.test(tag)) {
    log.error('Invalid tag format. Must start with aicp/');
    process.exit(1);
  }
  if (!force) {
    log.warn(`Rollback to ${tag}? Use --force to confirm.`);
    process.exit(1);
  }
  try {
    execFileSync('git', ['rev-parse', '--verify', `refs/tags/${tag}^{}`], { stdio: 'pipe' });
    execFileSync('git', ['checkout', tag, '--', '.'], { stdio: 'inherit' });
  } catch (e) {
    log.error(`Checkout failed: ${tag}`);
    process.exit(1);
  }
  log.success(`Rolled back to ${tag}`);
  if (stashId) log.info(`Stashed changes: ${stashId} (use git stash pop to restore)`);
}

module.exports = {
  getCurrentStep,
  checkpointSave,
  checkpointList,
  checkpointBack
};
```

---

## Step 18.4 — Fix cmd-new-plan.js hardcoded templates path
- **File:** `packages/cli/cmd-new-plan.js`
- **Action:** EDIT
- **Done-check:** `grep -q '__dirname' packages/cli/cmd-new-plan.js` → exit 0
- **Depends:** 18.3

**WHY:** `newPlanCommand` does `path.join(process.cwd(), 'templates', 'PLAN_TEMPLATE.md')`. When installed to another project via setup.sh, there is no `templates/` directory. The command always fails with "Missing templates/PLAN_TEMPLATE.md" in installed projects.

**Replace the ENTIRE file with:**
```js
const fs = require('fs');
const path = require('path');
const { PLAN_DIR } = require('./paths.js');
const { log } = require('./colors.js');

function newPlanCommand(name) {
  if (!name || !/^[a-zA-Z0-9-]{1,50}$/.test(name)) {
    log.error('Plan name must use 1-50 letters, numbers, or dashes');
    process.exit(1);
  }

  // Try multiple locations for the template
  const candidates = [
    path.join(process.cwd(), 'templates', 'PLAN_TEMPLATE.md'),
    path.resolve(__dirname, '..', '..', 'templates', 'PLAN_TEMPLATE.md'),
    path.resolve(__dirname, '..', '..', '..', 'templates', 'PLAN_TEMPLATE.md'),
  ];
  const templatePath = candidates.find(p => fs.existsSync(p));

  const targetPath = path.join(PLAN_DIR, `${name}.md`);

  if (!templatePath) {
    // Fallback: create a minimal template inline
    fs.mkdirSync(PLAN_DIR, { recursive: true });
    const fallback = `# ${name}\n\n> Plan description here.\n\n---\n\n## Step 1.1 — First step\n- **File:** \`path/to/file\`\n- **Action:** CREATE\n- **Done-check:** \`test -f path/to/file\` → exit 0\n- **Depends:** None\n\n**Description:** What to do in this step.\n`;
    fs.writeFileSync(targetPath, fallback, 'utf8');
    log.success(`Created plan/${name}.md (using built-in template)`);
    return;
  }
  if (fs.existsSync(targetPath)) {
    log.error(`plan/${name}.md already exists`);
    process.exit(1);
  }
  fs.mkdirSync(PLAN_DIR, { recursive: true });
  const template = fs.readFileSync(templatePath, 'utf8');
  fs.writeFileSync(targetPath, template.replace('[Your Plan Name]', name), 'utf8');
  log.success(`Created plan/${name}.md — edit it to add your steps`);
}

module.exports = {
  newPlanCommand
};
```

---

## Step 18.5 — Fix index.js split imports
- **File:** `packages/cli/index.js`
- **Action:** EDIT
- **Done-check:** `! awk '/^function showHelp/,0' packages/cli/index.js | grep -q 'require('` → exit 0
- **Depends:** 18.4

**WHY:** `watchCommand`, `blockCommand`, `projectsCommand`, `lintPlanCommand` are `require()`-ed AFTER the `showHelp` function definition (line 38-41). This breaks Node.js convention and makes the code harder to read.

**Find these 4 lines AFTER showHelp (around line 38-41):**
```js
const { watchCommand } = require('./cmd-watch.js');
const { blockCommand } = require('./cmd-block.js');
const { projectsCommand } = require('./cmd-projects.js');
const { lintPlanCommand } = require('./cmd-lint-plan.js');
```

**DELETE them from that location.**

**Then find the imports at the top (lines 1-8):**
```js
const { colors, log } = require('./colors.js');
const { statusCommand } = require('./cmd-status.js');
const { startCommand } = require('./cmd-start.js');
const { completeCommand } = require('./cmd-complete.js');
const { validateCommand } = require('./validate.js');
const { doctorCommand } = require('./doctor.js');
const { newPlanCommand } = require('./cmd-new-plan.js');
const { checkpointSave, checkpointList, checkpointBack } = require('./cmd-checkpoint.js');
```

**Replace with (add 4 new lines):**
```js
const { colors, log } = require('./colors.js');
const { statusCommand } = require('./cmd-status.js');
const { startCommand } = require('./cmd-start.js');
const { completeCommand } = require('./cmd-complete.js');
const { validateCommand } = require('./validate.js');
const { doctorCommand } = require('./doctor.js');
const { newPlanCommand } = require('./cmd-new-plan.js');
const { checkpointSave, checkpointList, checkpointBack } = require('./cmd-checkpoint.js');
const { watchCommand } = require('./cmd-watch.js');
const { blockCommand } = require('./cmd-block.js');
const { projectsCommand } = require('./cmd-projects.js');
const { lintPlanCommand } = require('./cmd-lint-plan.js');
```

---

## Step 18.6 — Fix CommandPalette stale closure and performance
- **File:** `dashboard/src/components/CommandPalette.jsx`
- **Action:** EDIT
- **Done-check:** `grep -q 'useMemo' dashboard/src/components/CommandPalette.jsx` → exit 0
- **Depends:** 18.5

**WHY:** `allItems` is recalculated on every render. The keyboard `useEffect` lists `allItems` as a dependency, so the event listener is torn down and re-attached every render. This causes missed keypresses and wasted CPU.

**Find line 1:**
```js
import React, { useState, useEffect, useRef } from 'react';
```

**Replace with:**
```js
import React, { useState, useEffect, useRef, useMemo } from 'react';
```

**Find this block (lines 11-20):**
```js
  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  
  const staticActions = [
    { id: 'settings', name: 'Preferences & Theme', icon: Settings, action: onOpenSettings },
  ].filter(a => a.name.toLowerCase().includes(query.toLowerCase()));

  const allItems = [
    ...filteredProjects.map(p => ({ ...p, type: 'project' })),
    ...staticActions.map(a => ({ ...a, type: 'action' }))
  ];
```

**Replace with:**
```js
  const allItems = useMemo(() => {
    const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    const staticActions = [
      { id: 'settings', name: 'Preferences & Theme', icon: Settings, action: onOpenSettings },
    ].filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
    return [
      ...filteredProjects.map(p => ({ ...p, type: 'project' })),
      ...staticActions.map(a => ({ ...a, type: 'action' }))
    ];
  }, [projects, query, onOpenSettings]);
```

---

## Step 18.7 — Fix install route hardcoded relative path
- **File:** `dashboard/src/server/projects.js`
- **Action:** EDIT
- **Done-check:** `grep -q 'fileURLToPath' dashboard/src/server/projects.js` → exit 0
- **Depends:** 18.6

**WHY:** The install route uses `path.resolve(process.cwd(), '..')` to find the ai-checkpoint root. This only works if the dashboard server is started from the `dashboard/` directory. If started from any other CWD, it points to the wrong location and all template copies fail silently.

**Find line 1-3:**
```js
import express from 'express';
import fs from 'fs';
import path from 'path';
```

**Replace with:**
```js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

**Find this line (around line 60):**
```js
  const aiCheckpointRoot = path.resolve(process.cwd(), '..');
```

**Replace with:**
```js
  const aiCheckpointRoot = path.resolve(__dirname, '..', '..', '..');
```

---

## Step 18.8 — Fix cmd-block.js missing phase header update
- **File:** `packages/cli/cmd-block.js`
- **Action:** EDIT
- **Done-check:** `grep -q 'headerIndex' packages/cli/cmd-block.js` → exit 0
- **Depends:** 18.7

**WHY:** When a step is blocked, `blockCommand` updates the step checkbox but doesn't update the phase header status text. The `completeCommand` properly updates the header to show `🟡 XX% IN PROGRESS` or `✅ 100% COMPLETE`, but `blockCommand` leaves the header stale.

**Find this block (lines 18-19):**
```js
  lines[targetStep.lineIndex] = lines[targetStep.lineIndex].replace(/-\s*\[([ x!/~])\]/, '- [!]');
  targetStep.status = 'blocked';
```

**Replace with:**
```js
  lines[targetStep.lineIndex] = lines[targetStep.lineIndex].replace(/-\s*\[([ x!/~])\]/, '- [!]');
  targetStep.status = 'blocked';

  // Update phase header
  const pDone = targetPhase.steps.filter(s => s.status === 'done').length;
  const pTotal = targetPhase.steps.length;
  const pPct = Math.round((pDone / pTotal) * 100);
  lines[targetPhase.headerIndex] = lines[targetPhase.headerIndex].split('—')[0] + '— ' + (pPct === 100 ? "✅ 100% COMPLETE" : `🟡 ${pPct}% IN PROGRESS`);
```

---

## Step 18.9 — Update PROGRESS.md with Phase 18
- **File:** `.agents/PROGRESS.md`
- **Action:** EDIT
- **Done-check:** `grep -q 'Phase 18' .agents/PROGRESS.md` → exit 0
- **Depends:** 18.8

**Add Phase 18 section to PROGRESS.md and update overall totals to include 9 new steps.**
