# 🔄 Plan Auto-Sync — Dashboard Automatic Plan Detection

> ⚠️ এই plan-এর প্রতিটি step-এ **সম্পূর্ণ কোড** দেওয়া আছে। কোনো কিছু অনুমান করার দরকার নেই। হুবহু কপি করো।

---

## রুলস (প্রতিটি step-এ মানতে হবে)

1. **1 step = 1 file** — এক step-এ শুধু একটি ফাইল তৈরি বা মডিফাই করো
2. Step শুরু করার আগে: `./l start X.Y`
3. Step শেষে: `./l c X.Y "note"`
4. কোনো step skip করো না
5. কোড হুবহু copy-paste করো, নিজে কিছু বদলাও না

---

## Phase 38: Plan Auto-Sync System

---

### Step 38.1 — Create plan-sync engine (`packages/cli/plan-sync.js`)
- **File:** `packages/cli/plan-sync.js`
- **Action:** Create
- **Depends:** None
- **Done-check:** `node -c packages/cli/plan-sync.js`

**নিচের পুরো কোডটি হুবহু `packages/cli/plan-sync.js` ফাইলে পেস্ট করো:**

```js
const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH, PLAN_DIR } = require('./paths.js');
const { log } = require('./colors.js');
const { parseProgress, getPlanFiles } = require('./parse-progress.js');

function parsePlanFileSteps(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const steps = [];
  let phaseName = null;
  let phaseNum = null;

  for (const line of lines) {
    const phaseMatch = line.match(/^##\s+Phase\s+(\d+):\s*(.+)/);
    if (phaseMatch) {
      phaseNum = parseInt(phaseMatch[1]);
      phaseName = phaseMatch[2].replace(/\s*—.*$/, '').trim();
    }
    const stepMatch = line.match(/^###\s+Step\s+(\d+\.\d+)\s+—\s+(.+)/);
    if (stepMatch) {
      if (!phaseNum) {
        const p = stepMatch[1].split('.')[0];
        phaseNum = parseInt(p);
      }
      steps.push({ number: stepMatch[1], title: stepMatch[2].trim() });
    }
  }

  return { phaseNum, phaseName, steps };
}

function getExistingStepNumbers() {
  if (!fs.existsSync(PROGRESS_PATH)) return new Set();
  const content = fs.readFileSync(PROGRESS_PATH, 'utf8');
  const matches = content.match(/\*\*Step (\d+\.\d+)\*\*/g) || [];
  return new Set(matches.map(m => m.match(/(\d+\.\d+)/)[1]));
}

function getExistingPhaseNumbers() {
  if (!fs.existsSync(PROGRESS_PATH)) return new Set();
  const content = fs.readFileSync(PROGRESS_PATH, 'utf8');
  const matches = content.match(/Phase (\d+):/g) || [];
  return new Set(matches.map(m => m.match(/(\d+)/)[1]));
}

function appendPhaseToProgress(phaseNum, phaseName, steps) {
  const content = fs.readFileSync(PROGRESS_PATH, 'utf8');
  const lines = content.split(/\r?\n/);

  const phaseBlock = [
    '',
    '---',
    '',
    `## 🔷 Phase ${phaseNum}: ${phaseName} — 🔴 0% PENDING`,
    ''
  ];
  for (const step of steps) {
    const fileMatch = step.title.match(/\(`([^`]+)`\)/);
    const filePart = fileMatch ? ` (\`${fileMatch[1]}\`)` : '';
    const cleanTitle = step.title.replace(/\s*\(`[^`]+`\)\s*$/, '');
    phaseBlock.push(`- [ ] **Step ${step.number}** — ${cleanTitle}${filePart}`);
  }
  phaseBlock.push('');

  const newLines = [...lines, ...phaseBlock];
  fs.writeFileSync(PROGRESS_PATH, newLines.join('\n'), 'utf8');
}

function updateOverallBar() {
  const content = fs.readFileSync(PROGRESS_PATH, 'utf8');
  const lines = content.split(/\r?\n/);
  let totalS = 0, doneS = 0;

  for (const line of lines) {
    if (/^\s*-\s*\[[ x~/!]\]\s*\*\*Step/.test(line)) {
      totalS++;
      if (/^\s*-\s*\[x\]/.test(line)) doneS++;
    }
  }

  if (totalS === 0) return;
  const oPct = Math.round((doneS / totalS) * 100);
  const bar = '█'.repeat(Math.round((oPct / 100) * 20)) + '░'.repeat(20 - Math.round((oPct / 100) * 20));

  let foundOverall = false, foundBar = false;
  for (let i = 0; i < lines.length; i++) {
    if (!foundOverall && lines[i].includes('Overall Progress')) {
      lines[i] = `## 📊 Overall Progress: ${oPct}% (${doneS}/${totalS} steps complete)`;
      foundOverall = true;
    }
    if (!foundBar && /^\[([█░]+)\]/.test(lines[i])) {
      lines[i] = `[${bar}] ${oPct}% (${doneS}/${totalS} steps complete)`;
      foundBar = true;
    }
    if (foundOverall && foundBar) break;
  }

  let nextStr = 'None (Project Complete) ✅';
  for (const line of lines) {
    const m = line.match(/^\s*-\s*\[[ ~/!]\]\s*\*\*Step (\d+\.\d+)\*\*\s*—\s*(.+)$/);
    if (m) { nextStr = `Step ${m[1]} — ${m[2].replace(/\s*\(`[^`]+`\)\s*$/, '').trim()}`; break; }
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## 👉 NEXT:')) {
      lines[i] = `## 👉 NEXT: ${nextStr}`;
    }
  }

  fs.writeFileSync(PROGRESS_PATH, lines.join('\n'), 'utf8');
}

function syncPlansToProgress() {
  if (!fs.existsSync(PLAN_DIR)) return { added: [], skipped: [], errors: [] };
  if (!fs.existsSync(PROGRESS_PATH)) return { added: [], skipped: [], errors: ['PROGRESS.md not found'] };

  const planFiles = getPlanFiles();
  const existingPhases = getExistingPhaseNumbers();
  const existingSteps = getExistingStepNumbers();
  const added = [];
  const skipped = [];
  const errors = [];

  for (const pf of planFiles) {
    const pfPath = path.join(PLAN_DIR, pf);
    try {
      const { phaseNum, phaseName, steps } = parsePlanFileSteps(pfPath);
      if (!phaseNum || steps.length === 0) { skipped.push(pf); continue; }

      if (existingPhases.has(String(phaseNum))) {
        skipped.push(pf);
        continue;
      }

      const newSteps = steps.filter(s => !existingSteps.has(s.number));
      if (newSteps.length === 0) { skipped.push(pf); continue; }

      appendPhaseToProgress(phaseNum, phaseName || `Plan from ${pf}`, newSteps);
      added.push({ file: pf, phase: phaseNum, name: phaseName, stepCount: newSteps.length });

      for (const s of newSteps) existingSteps.add(s.number);
      existingPhases.add(String(phaseNum));
    } catch (e) {
      errors.push(`${pf}: ${e.message}`);
    }
  }

  if (added.length > 0) updateOverallBar();
  return { added, skipped, errors };
}

function silentSync() {
  try { syncPlansToProgress(); } catch {}
}

module.exports = { syncPlansToProgress, silentSync, parsePlanFileSteps };
```

---

### Step 38.2 — Create CLI sync command (`packages/cli/cmd-sync.js`)
- **File:** `packages/cli/cmd-sync.js`
- **Action:** Create
- **Depends:** 38.1
- **Done-check:** `node -c packages/cli/cmd-sync.js`

**নিচের পুরো কোডটি হুবহু `packages/cli/cmd-sync.js` ফাইলে পেস্ট করো:**

```js
const { log, colors } = require('./colors.js');
const { syncPlansToProgress } = require('./plan-sync.js');
const { checkFiles } = require('./validate.js');

function syncCommand() {
  checkFiles();
  log.header('Syncing Plan Files');
  log.info('Scanning plan/*.md...');

  const { added, skipped, errors } = syncPlansToProgress();

  if (added.length > 0) {
    for (const a of added) {
      console.log(`  ${colors.green}✨ NEW${colors.reset} — Phase ${a.phase}: ${a.name} (${a.stepCount} steps)`);
      console.log(`     → Appended to PROGRESS.md`);
    }
  }

  if (skipped.length > 0) {
    for (const s of skipped) {
      console.log(`  ${colors.dim}⏭️  SKIP${colors.reset} — ${s} (already exists)`);
    }
  }

  if (errors.length > 0) {
    for (const e of errors) {
      console.log(`  ${colors.red}❌ ERROR${colors.reset} — ${e}`);
    }
  }

  if (added.length === 0 && errors.length === 0) {
    log.success('Everything is already in sync.');
  } else if (added.length > 0) {
    log.success(`Synced ${added.length} new phase(s) to PROGRESS.md`);
  }
}

module.exports = { syncCommand };
```

---

### Step 38.3 — Auto-sync on start and complete (`packages/cli/cmd-start.js`)
- **File:** `packages/cli/cmd-start.js`
- **Action:** Modify
- **Depends:** 38.1
- **Done-check:** `node -c packages/cli/cmd-start.js`

**`packages/cli/cmd-start.js` ফাইলে ২টি পরিবর্তন করো:**

**পরিবর্তন ১:** ফাইলের একদম উপরে, `require('./validate.js')` লাইনের **পরে** এই লাইনটি যোগ করো:
```js
const { silentSync } = require('./plan-sync.js');
```

**পরিবর্তন ২:** `function startCommand(stepNum) {` এর ভিতরে, `checkFiles();` লাইনের **ঠিক পরে** এই লাইনটি যোগ করো:
```js
  silentSync();
```

**ফাইনাল রেজাল্ট (প্রথম কয়েক লাইন):**
```js
const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH } = require('./paths.js');
const { log } = require('./colors.js');
const { parseProgress, findStepInPlanFiles } = require('./parse-progress.js');
const { checkFiles } = require('./validate.js');
const { silentSync } = require('./plan-sync.js');

function startCommand(stepNum) {
  checkFiles();
  silentSync();
  if (!stepNum) { log.error("Step number দাও (e.g., 2.2)"); process.exit(1); }
```

---

### Step 38.4 — Auto-sync on complete (`packages/cli/cmd-complete.js`)
- **File:** `packages/cli/cmd-complete.js`
- **Action:** Modify
- **Depends:** 38.1
- **Done-check:** `node -c packages/cli/cmd-complete.js`

**`packages/cli/cmd-complete.js` ফাইলে ২টি পরিবর্তন করো:**

**পরিবর্তন ১:** ফাইলের একদম উপরে, `require('./progress-updater.js')` লাইনের **পরে** এই লাইনটি যোগ করো:
```js
const { silentSync } = require('./plan-sync.js');
```

**পরিবর্তন ২:** `function completeCommand(stepNum, comment) {` এর ভিতরে, `checkFiles();` লাইনের **ঠিক পরে** এই লাইনটি যোগ করো:
```js
  silentSync();
```

**ফাইনাল রেজাল্ট (প্রথম কয়েক লাইন):**
```js
const fs = require('fs');
const path = require('path');
const { log, colors, getProgressBar } = require('./colors.js');
const { parseProgress } = require('./parse-progress.js');
const { checkFiles, validateCommand, verifyTargetFile } = require('./validate.js');
const { updateProgressState, appendLogEntry, saveProgress } = require('./progress-updater.js');
const { silentSync } = require('./plan-sync.js');

function completeCommand(stepNum, comment) {
  checkFiles();
  silentSync();
  if (!stepNum) { log.error("Step number দাও"); process.exit(1); }
```

---

### Step 38.5 — Register sync command in CLI router (`packages/cli/index.js`)
- **File:** `packages/cli/index.js`
- **Action:** Modify
- **Depends:** 38.2
- **Done-check:** `node -c packages/cli/index.js`

**`packages/cli/index.js` ফাইলে ৩টি পরিবর্তন করো:**

**পরিবর্তন ১:** ফাইলের উপরে, `require('./cmd-lint-plan.js')` লাইনের **পরে** এই লাইনটি যোগ করো:
```js
const { syncCommand } = require('./cmd-sync.js');
```

**পরিবর্তন ২:** `showHelp()` ফাংশনের ভিতরে, `./l cp save|list|back` লাইনের **পরে** এই লাইনটি যোগ করো:
```
  ${colors.green}./l sync${colors.reset}                  Sync plan files → PROGRESS.md
```

**পরিবর্তন ৩:** `switch (cmd)` ব্লকের ভিতরে, `case 'lint-plan':` লাইনের **পরে** এই লাইনটি যোগ করো:
```js
    case 'sync': syncCommand(); break;
```

---

### Step 38.6 — Dashboard server plan watcher (`dashboard/src/server/plan-watcher.js`)
- **File:** `dashboard/src/server/plan-watcher.js`
- **Action:** Create
- **Depends:** None
- **Done-check:** `node -c dashboard/src/server/plan-watcher.js`

**নিচের পুরো কোডটি হুবহু `dashboard/src/server/plan-watcher.js` ফাইলে পেস্ট করো:**

```js
import fs from 'fs';
import path from 'path';

let activeWatcher = null;

export function watchPlanDirectory(projectPath, onChange) {
  stopWatching();
  const planDir = path.join(projectPath, 'plan');
  if (!fs.existsSync(planDir)) return;

  let debounceTimer = null;

  try {
    activeWatcher = fs.watch(planDir, (eventType, filename) => {
      if (!filename || !filename.endsWith('.md')) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try { onChange({ eventType, filename }); } catch {}
      }, 500);
    });
    activeWatcher.on('error', () => { stopWatching(); });
  } catch {}
}

export function stopWatching() {
  if (activeWatcher) {
    try { activeWatcher.close(); } catch {}
    activeWatcher = null;
  }
}
```

---

### Step 38.7 — Mount plan watcher in server.js (`dashboard/server.js`)
- **File:** `dashboard/server.js`
- **Action:** Modify
- **Depends:** 38.6
- **Done-check:** `node -c dashboard/server.js`

**`dashboard/server.js` ফাইলে ২টি পরিবর্তন করো:**

**পরিবর্তন ১:** ফাইলের উপরে, অন্য import গুলোর সাথে এই লাইনটি যোগ করো:
```js
import { watchPlanDirectory, stopWatching } from './src/server/plan-watcher.js';
```

**পরিবর্তন ২:** `app.listen(...)` এর callback-এর ভিতরে, `console.log` লাইনের **পরে** এই কোড যোগ করো:
```js
  // Watch plan directory of first project for changes
  try {
    const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.agents', 'config.json'), 'utf8'));
    const firstProject = (config.projects || [])[0];
    if (firstProject && firstProject.path) {
      watchPlanDirectory(firstProject.path, ({ filename }) => {
        console.log(`📋 Plan file changed: ${filename}`);
      });
    }
  } catch {}
```

---

### Step 38.8 — Add sync tests (`tests/plan-sync.bats`)
- **File:** `tests/plan-sync.bats`
- **Action:** Create
- **Depends:** 38.5
- **Done-check:** `npx bats tests/plan-sync.bats`

**নিচের পুরো কোডটি হুবহু `tests/plan-sync.bats` ফাইলে পেস্ট করো:**

```bash
#!/usr/bin/env bats

load test_helper

@test "sync detects new plan file" {
  setup_test_env
  # Create a plan file with Phase 99
  mkdir -p plan
  cat > plan/test-plan.md << 'EOF'
# Test Plan

## Phase 99: Test Phase

### Step 99.1 — Test step one (`test-file.js`)
- **File:** `test-file.js`
- **Action:** Create
- **Depends:** None
- **Done-check:** `node -c test-file.js`
EOF

  run node -e "const { syncPlansToProgress } = require('$CLI_DIR/plan-sync.js'); const r = syncPlansToProgress(); console.log(JSON.stringify(r));"
  [ "$status" -eq 0 ]
  [[ "$output" == *"99"* ]]

  # Verify PROGRESS.md was updated
  grep -q "Phase 99" .agents/PROGRESS.md
}

@test "sync skips existing phases" {
  setup_test_env
  # Create a plan file with Phase 1 (already exists)
  mkdir -p plan
  cat > plan/existing.md << 'EOF'
## Phase 1: Already Exists

### Step 1.1 — Already done (`test.js`)
- **File:** `test.js`
- **Action:** Create
- **Depends:** None
- **Done-check:** `node -c test.js`
EOF

  run node -e "const { syncPlansToProgress } = require('$CLI_DIR/plan-sync.js'); const r = syncPlansToProgress(); console.log(JSON.stringify(r));"
  [ "$status" -eq 0 ]
  [[ "$output" == *"skipped"* ]]
}

@test "sync command runs without error" {
  setup_test_env
  run node -e "const { syncCommand } = require('$CLI_DIR/cmd-sync.js'); syncCommand();"
  [ "$status" -eq 0 ]
}
```
