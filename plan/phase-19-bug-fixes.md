# Phase 19 — Bug Fixes Round 3

> Third deep audit found 8 bugs. Each step has EXACT code to copy-paste.

---

## Step 19.1 — Remove dead execSync import in cmd-checkpoint.js
- **File:** `packages/cli/cmd-checkpoint.js`
- **Action:** EDIT
- **Done-check:** `! grep -q "execSync," packages/cli/cmd-checkpoint.js` → exit 0
- **Depends:** Phase 18 complete

**WHY:** Line 1 imports `{ execSync, execFileSync }` but `execSync` is never used anywhere in the file. It was left behind when Phase 18 replaced all `execSync` calls with `execFileSync`. Dead imports waste memory and confuse readers.

**Find line 1:**
```js
const { execSync, execFileSync } = require('child_process');
```

**Replace with:**
```js
const { execFileSync } = require('child_process');
```

---

## Step 19.2 — Fix addProject missing path validation in api.js
- **File:** `dashboard/src/server/api.js`
- **Action:** EDIT
- **Done-check:** `grep -q 'existsSync' dashboard/src/server/api.js` → exit 0
- **Depends:** 19.1

**WHY:** The `POST /settings/projects` route accepts any `path` from the request body and saves it directly to settings.json. There is zero validation — the user can add a non-existent directory, a file path, or even an empty string. This leads to silent crashes in `enrichProject` when it tries to read the path.

**Find this block (lines 12-29):**
```js
router.post('/settings/projects', (req, res) => {
  const { path: dirPath, name } = req.body;
  const settings = getSettings();

  if (settings.projects.find(p => p.path === dirPath)) {
    return res.status(400).json({ error: 'Project already exists' });
  }

  const newProject = {
    id: Date.now().toString(),
    path: dirPath,
    name: name || dirPath.split(/[/\\]/).pop(),
    addedAt: new Date().toISOString()
  };

  settings.projects.push(newProject);
  saveSettings(settings);
  res.json(newProject);
});
```

**Replace with:**
```js
router.post('/settings/projects', (req, res) => {
  const { path: dirPath, name } = req.body;
  if (!dirPath || typeof dirPath !== 'string') {
    return res.status(400).json({ error: 'Path is required' });
  }
  if (!path.isAbsolute(dirPath)) {
    return res.status(400).json({ error: 'Path must be absolute' });
  }
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    return res.status(400).json({ error: 'Path must be an existing directory' });
  }
  const settings = getSettings();

  if (settings.projects.find(p => p.path === dirPath)) {
    return res.status(400).json({ error: 'Project already exists' });
  }

  const newProject = {
    id: Date.now().toString(),
    path: dirPath,
    name: name || dirPath.split(/[/\\]/).pop(),
    addedAt: new Date().toISOString()
  };

  settings.projects.push(newProject);
  saveSettings(settings);
  res.json(newProject);
});
```

**Also add `fs` and `path` imports at top of file:**

**Find line 1-2:**
```js
import express from 'express';
import { getSettings, saveSettings } from './settings.js';
```

**Replace with:**
```js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { getSettings, saveSettings } from './settings.js';
```

---

## Step 19.3 — Fix Sidebar.jsx exceeds 150 lines (159 lines)
- **File:** `dashboard/src/components/Sidebar.jsx`
- **Action:** EDIT
- **Done-check:** `wc -l < dashboard/src/components/Sidebar.jsx` → ≤ 150
- **Depends:** 19.2

**WHY:** Sidebar.jsx is 159 lines. This exceeds the project's 150-line hard limit from RULES.md. The validator currently doesn't catch this because it only checks files referenced in completed plan steps. But it's still a rule violation. Extract the SidebarItem render into its own component file.

**Create new file `dashboard/src/components/SidebarItem.jsx`:**
```jsx
import React from 'react';
import { GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function SidebarItem({ p, selectedId, onSelect, isSearching }) {
  const isSelected = selectedId === p.id;
  const progress = p.progress?.overall?.percentage || 0;

  let statusColor = "bg-slate-600";
  if (!p.isInstalled) statusColor = "bg-red-500";
  else if (progress === 100) statusColor = "bg-emerald-500";
  else if (progress > 0) statusColor = "bg-blue-500";
  else statusColor = "bg-slate-400";

  return (
    <Reorder.Item
      key={p.id} value={p} className="relative" as="li"
      variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      dragListener={!isSearching}
    >
      <div className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer ${isSelected
        ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/10 border border-primary-500/30 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]'
        : 'hover:bg-white/[0.04] text-slate-400 border border-transparent hover:border-white/[0.05] hover:translate-x-1'
        }`}
      >
        {isSelected && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-gradient-to-b from-primary-400 to-accent-400 shadow-[0_0_12px_rgba(217,70,239,0.8)] rounded-r-full" />
        )}
        <div className="flex items-center gap-3 overflow-hidden flex-1" onClick={() => onSelect(p.id)}>
          <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1 -ml-2 rounded" onPointerDown={(e) => e.stopPropagation()}>
            <GripVertical className="w-4 h-4" />
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shrink-0 shadow-[0_0_8px_currentColor] opacity-80 group-hover:opacity-100 transition-opacity`} />
          <span className={`truncate font-medium text-[13px] tracking-wide group-hover:text-white transition-colors ${isSelected ? 'font-bold' : ''}`}>
            {p.name}
          </span>
        </div>
        {p.isInstalled && (
          <span className={`text-[10px] font-mono px-2 py-1 rounded-md transition-all border ${isSelected ? 'bg-primary-500/30 border-primary-500/40 text-primary-200 shadow-inner' : 'bg-white/[0.03] border-white/5 text-slate-500 group-hover:bg-white/[0.08] group-hover:text-slate-300'}`}>
            {progress}%
          </span>
        )}
      </div>
    </Reorder.Item>
  );
}
```

**Then in Sidebar.jsx, replace lines 87-141 with:**
```jsx
            <Reorder.Group as="ul" variants={containerVariants} initial="hidden" animate="show" axis="y" values={displayedItems} onReorder={isSearching ? () => {} : handleReorder} className="space-y-2">
              {displayedItems.map(p => (
                <SidebarItem key={p.id} p={p} selectedId={selectedId} onSelect={onSelect} isSearching={isSearching} />
              ))}
            </Reorder.Group>
```

**And add import at top:**
```jsx
import SidebarItem from './SidebarItem';
```

---

## Step 19.4 — Fix block command overwrites overall progress bar
- **File:** `packages/cli/cmd-block.js`
- **Action:** EDIT
- **Done-check:** `grep -q 'Overall Progress' packages/cli/cmd-block.js` → exit 0
- **Depends:** 19.3

**WHY:** When `blockCommand` runs, it updates the phase header and writes the log entry, but it never updates the Overall Progress bar or the NEXT pointer in PROGRESS.md. The `completeCommand` does this correctly (lines 44-58), but `blockCommand` skips it entirely. After blocking a step that was running, the NEXT pointer stays stale.

**Find this block (lines 26-37):**
```js
  lines[targetPhase.headerIndex] = lines[targetPhase.headerIndex].split('—')[0] + '— ' + (pPct === 100 ? "✅ 100% COMPLETE" : `🟡 ${pPct}% IN PROGRESS`);
  
  const now = new Date();
```

**Replace with:**
```js
  lines[targetPhase.headerIndex] = lines[targetPhase.headerIndex].split('—')[0] + '— ' + (pPct === 100 ? "✅ 100% COMPLETE" : `🟡 ${pPct}% IN PROGRESS`);

  // Update NEXT pointer
  let nextStr = "None (Project Complete) ✅", foundNext = false;
  for (const p of phases) { const s = p.steps.find(st => st.status !== 'done' && st.status !== 'blocked'); if (s) { nextStr = `Step ${s.number} — ${s.title}`; foundNext = true; break; } }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## 👉 NEXT:')) lines[i] = `## 👉 NEXT: ${nextStr}`;
  }

  const now = new Date();
```

---

## Step 19.5 — Fix findStepInPlanFiles loose matching
- **File:** `packages/cli/parse-progress.js`
- **Action:** EDIT
- **Done-check:** `grep -q 'stepNum + "\\b"' packages/cli/parse-progress.js || grep -q 'new RegExp' packages/cli/parse-progress.js` → exit 0
- **Depends:** 19.4

**WHY:** `findStepInPlanFiles` checks `line.includes(stepNum)` to find a step in plan files. This is dangerously loose — searching for step `1.1` will also match step `11.1`, `1.10`, or `21.1`. For example, if you have 18 phases, calling `./l start 1.1` could match step `11.1` or `18.1` first depending on alphabetical file order.

**Find this block (lines 19-28):**
```js
function findStepInPlanFiles(stepNum) {
  const planFiles = getPlanFiles();
  for (const pf of planFiles) {
    const pfPath = path.join(PLAN_DIR, pf);
    const pfContent = fs.readFileSync(pfPath, 'utf8');
    const pfLines = pfContent.split(/\r?\n/);
    const hasStep = pfLines.some(line => /^#{2,3}\s+Step\s+/.test(line) && line.includes(stepNum));
    if (hasStep) return { planLines: pfLines, foundFile: pf };
  }
  return { planLines: [], foundFile: null };
}
```

**Replace with:**
```js
function findStepInPlanFiles(stepNum) {
  const planFiles = getPlanFiles();
  const stepPattern = new RegExp(`^#{2,3}\\s+Step\\s+${stepNum.replace('.', '\\.')}\\b`);
  for (const pf of planFiles) {
    const pfPath = path.join(PLAN_DIR, pf);
    const pfContent = fs.readFileSync(pfPath, 'utf8');
    const pfLines = pfContent.split(/\r?\n/);
    const hasStep = pfLines.some(line => stepPattern.test(line));
    if (hasStep) return { planLines: pfLines, foundFile: pf };
  }
  return { planLines: [], foundFile: null };
}
```

---

## Step 19.6 — Fix projects.js blank lines and unused parseProgress import
- **File:** `dashboard/src/server/projects.js`
- **Action:** EDIT
- **Done-check:** `! grep -q 'parseProgress' dashboard/src/server/projects.js` → exit 0
- **Depends:** 19.5

**WHY:** After Phase 18 moved `enrichProject` to `parser.js`, the import line still imports `parseProgress` alongside `enrichProject`. But `parseProgress` is never used directly in `projects.js` anymore — it's only used inside `enrichProject` which lives in `parser.js`. Also, there are unnecessary blank lines left at lines 14-15 and 117-118 from previous refactoring.

**Find line 9:**
```js
import { parseProgress, enrichProject } from './parser.js';
```

**Replace with:**
```js
import { enrichProject } from './parser.js';
```

**Also clean up the blank lines at lines 14-15 and 117-118** (remove extra blank lines to keep file tight).

---

## Step 19.7 — Fix config.js missing path validation (path traversal risk)
- **File:** `dashboard/src/server/config.js`
- **Action:** EDIT
- **Done-check:** `grep -q 'isAbsolute' dashboard/src/server/config.js` → exit 0
- **Depends:** 19.6

**WHY:** The POST `/projects/:id/config` route writes user-supplied `rules` and `agents` content to files at `project.path/.agents/RULES.md` and `AGENTS.md`. But `project.path` comes from settings.json which was populated by user input. If a malicious or corrupted settings.json has `path: "/"` or a symlinked directory, the server would happily overwrite arbitrary files. Add a basic safety check.

**Find this block (lines 22-41):**
```js
router.post('/projects/:id/config', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const { rules, agents } = req.body;
  const MAX_SIZE = 50 * 1024;
  if (rules !== undefined && rules.length > MAX_SIZE) return res.status(400).json({ error: 'Rules content too large (max 50KB)' });
  if (agents !== undefined && agents.length > MAX_SIZE) return res.status(400).json({ error: 'Agents content too large (max 50KB)' });

  const rulesPath = path.join(project.path, '.agents', 'RULES.md');
  const agentsPath = path.join(project.path, '.agents', 'AGENTS.md');

  try {
    if (rules !== undefined) fs.writeFileSync(rulesPath, rules);
    if (agents !== undefined) fs.writeFileSync(agentsPath, agents);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
```

**Replace with:**
```js
router.post('/projects/:id/config', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  if (!path.isAbsolute(project.path)) return res.status(400).json({ error: 'Invalid project path' });

  const { rules, agents } = req.body;
  const MAX_SIZE = 50 * 1024;
  if (rules !== undefined && rules.length > MAX_SIZE) return res.status(400).json({ error: 'Rules content too large (max 50KB)' });
  if (agents !== undefined && agents.length > MAX_SIZE) return res.status(400).json({ error: 'Agents content too large (max 50KB)' });

  const agentsDir = path.join(project.path, '.agents');
  if (!fs.existsSync(agentsDir)) return res.status(400).json({ error: '.agents directory does not exist' });

  const rulesPath = path.join(agentsDir, 'RULES.md');
  const agentsPath = path.join(agentsDir, 'AGENTS.md');

  try {
    if (rules !== undefined) fs.writeFileSync(rulesPath, rules);
    if (agents !== undefined) fs.writeFileSync(agentsPath, agents);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
```

---

## Step 19.8 — Update PROGRESS.md with Phase 19
- **File:** `.agents/PROGRESS.md`
- **Action:** EDIT
- **Done-check:** `grep -q 'Phase 19' .agents/PROGRESS.md` → exit 0
- **Depends:** 19.7

**Add Phase 19 section to PROGRESS.md and update overall totals to include 8 new steps.**
