# Plan: Dashboard 3-Bug Fix

> তিনটি বাগ ফিক্স: (1) Plan→Roadmap sync না হওয়া, (2) Pending projects না দেখানো, (3) 100% ভুল দেখানো
> (AI Tier: Small — Max 5 steps/phase, কোনো ছোটো model-ও করতে পারবে)

---

## Phase 59: Plan-to-Roadmap Auto-Sync Fix

### Step 59.1 — Fix plan template phase numbering (`dashboard/src/server/plan-templates.js`)
- **File:** `dashboard/src/server/plan-templates.js`
- **Action:** MODIFY
- **Depends:** None

**সমস্যা:** `generatePlanTemplate()` সবসময় `Step 1.1` দিয়ে plan বানায়। কিন্তু PROGRESS.md-তে Phase 1 আগে থেকে থাকলে sync skip করে।

**কী করতে হবে:**
1. `generatePlanTemplate` function-এর signature পরিবর্তন করো:
   - আগে: `function generatePlanTemplate(name, tier, description = '')`
   - পরে: `function generatePlanTemplate(name, tier, description = '', phaseNum = 1)`
2. সব tier template-এ hardcoded `1.1` বদলে `${phaseNum}.1` ব্যবহার করো
3. সব tier template-এ `## Phase ${phaseNum}: ${name}` heading যোগ করো (Phase heading ছাড়া sync কাজ করে না)

**পুরো ফাইলের নতুন কোড:**

```javascript
const TIER_CONFIG = {
  small: {
    label: 'Small',
    emoji: '🟢',
    maxStepsPerPhase: 5,
    codeRequired: true,
    dependsAllowed: false,
    doneCheckType: 'simple',
    description: 'Simple structured plans for lightweight models',
    models: 'GPT-3.5, Gemini Flash, Claude Haiku',
    agentsRules: `## 🤖 AI Model Tier: Small
- Maximum 5 steps per phase
- Each step MUST have complete code block
- No chain dependencies between steps
- Done-check: file existence only (test -f)
- One file = one step = one action (STRICT)`
  },
  medium: {
    label: 'Medium',
    emoji: '🟡',
    maxStepsPerPhase: 10,
    codeRequired: false,
    dependsAllowed: true,
    doneCheckType: 'command',
    description: 'Standard plans for capable models',
    models: 'GPT-4o, Gemini Pro, Claude Sonnet',
    agentsRules: `## 🤖 AI Model Tier: Medium
- Maximum 10 steps per phase
- Each step needs code OR clear unambiguous instruction
- Linear dependencies allowed
- Done-check: any verifiable command
- One file = one step (recommended)`
  },
  high: {
    label: 'High',
    emoji: '🔴',
    maxStepsPerPhase: Infinity,
    codeRequired: false,
    dependsAllowed: true,
    doneCheckType: 'any',
    description: 'Unrestricted plans for advanced models',
    models: 'GPT-4, o1, Gemini Ultra, Claude Opus',
    agentsRules: `## 🤖 AI Model Tier: High
- No step limit per phase
- Full creative freedom in step format
- Any dependency structure allowed
- Any verification method accepted
- Agent decides optimal approach`
  }
};

function generatePlanTemplate(name, tier, description = '', phaseNum = 1) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.medium;
  const descStr = description || `Plan description for ${name}.`;
  const p = phaseNum;

  if (tier === 'small') {
    return `# Plan: ${name}

> ${descStr}
> (AI Tier: Small — Max 5 steps/phase)

---

## Phase ${p}: ${name}

### Step ${p}.1 — Create initial module
- **File:** \`src/index.js\`
- **Action:** CREATE
- **Content:**
  \`\`\`javascript
  module.exports = { name: 'small-model-template' };
  \`\`\`
- **Done-check:** \`test -f src/index.js\`
- **Depends:** None

**Description:** Initialize the index file with a basic export.
`;
  }

  if (tier === 'high') {
    return `# Plan: ${name}

> ${descStr}
> (AI Tier: High — No constraints)

---

## Phase ${p}: ${name}

### Step ${p}.1 — Create file
- **File:** \`src/index.js\`
- **Action:** CREATE
- **Done-check:** \`test -f src/index.js\`
- **Depends:** None

Write the complete code block or description here.
`;
  }

  // Medium (Default)
  return `# Plan: ${name}

> ${descStr}
> (AI Tier: Medium — Standard format)

---

## Phase ${p}: ${name}

### Step ${p}.1 — [Step Title]
- **File:** \`src/index.js\`
- **Action:** CREATE
- **Content:**
  // Put working code here
- **Done-check:** \`node -e "require('./src/index.js')"\`
- **Depends:** None

**Description:** Detailed instruction of what to do.
`;
}

function getAgentsTierBlock(tier) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.medium;
  return `<!-- AI-TIER-START -->
${config.agentsRules}
<!-- AI-TIER-END -->`;
}

export {
  TIER_CONFIG,
  generatePlanTemplate,
  getAgentsTierBlock
};
```

- **Done-check:** `node -e "const m = require('./dashboard/src/server/plan-templates.js'); console.log(typeof m.generatePlanTemplate)"` → `function`
  (ESM ফাইল, তাই build চেক: `cd dashboard && npm run build`)

---

### Step 59.2 — Create plan-sync-server.js ESM wrapper (`dashboard/src/server/plan-sync-server.js`)
- **File:** `dashboard/src/server/plan-sync-server.js`
- **Action:** CREATE
- **Depends:** None

**সমস্যা:** `ai-tier.js` থেকে `runCommand('./l', ['sync'])` কল করা unreliable। target project-এ `l` script নাও থাকতে পারে।

**কী করতে হবে:**
এই নতুন ফাইল তৈরি করো। ESM ফাইল হবে (`dashboard/` = ESM)। এটা `createRequire` দিয়ে CommonJS sync function import করবে।

**পুরো নতুন ফাইলের কোড:**

```javascript
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);

export function getNextPhaseNum(projectPath) {
  const progressPath = path.join(projectPath, '.agents', 'PROGRESS.md');
  if (!fs.existsSync(progressPath)) return 1;
  const content = fs.readFileSync(progressPath, 'utf8');
  const matches = content.match(/Phase (\d+)/g) || [];
  let max = 0;
  for (const m of matches) {
    const n = parseInt(m.replace('Phase ', ''));
    if (n > max) max = n;
  }
  return max + 1;
}

export function syncPlanToProgress(projectPath) {
  try {
    const cliDir = path.resolve(projectPath, '.agents', 'packages', 'cli');
    if (!fs.existsSync(path.join(cliDir, 'plan-sync.js'))) {
      const srcDir = path.resolve(
        path.dirname(new URL(import.meta.url).pathname),
        '..', '..', '..', 'packages', 'cli'
      );
      if (!fs.existsSync(path.join(srcDir, 'plan-sync.js'))) return null;
      const { syncPlansToProgress } = require(path.join(srcDir, 'plan-sync.js'));
      const origCwd = process.cwd();
      process.chdir(projectPath);
      try { return syncPlansToProgress(); } finally { process.chdir(origCwd); }
    }
    const { syncPlansToProgress } = require(path.join(cliDir, 'plan-sync.js'));
    const origCwd = process.cwd();
    process.chdir(projectPath);
    try { return syncPlansToProgress(); } finally { process.chdir(origCwd); }
  } catch (e) {
    console.error('Plan sync error:', e.message);
    return null;
  }
}
```

- **Done-check:** `test -f dashboard/src/server/plan-sync-server.js`

---

### Step 59.3 — Update ai-tier.js to use smart sync (`dashboard/src/server/ai-tier.js`)
- **File:** `dashboard/src/server/ai-tier.js`
- **Action:** MODIFY
- **Depends:** Step 59.1, Step 59.2

**কী করতে হবে:**
1. import পরিবর্তন:
   - **মুছে দাও:** `import { runCommand } from './run-command.js';`
   - **যোগ করো:** `import { getNextPhaseNum, syncPlanToProgress } from './plan-sync-server.js';`

2. `generate-plan` route-এ plan তৈরির আগে next phase number বের করো:
   - line 99 এর আগে যোগ করো: `const nextPhase = getNextPhaseNum(project.path);`
   - line 99 পরিবর্তন করো:
     - আগে: `const templateContent = generatePlanTemplate(name, tier, description);`
     - পরে: `const templateContent = generatePlanTemplate(name, tier, description, nextPhase);`

3. sync call পরিবর্তন:
   - আগে: `try { runCommand('./l', ['sync'], project.path); } catch {}`
   - পরে: `try { syncPlanToProgress(project.path); } catch {}`

**সম্পূর্ণ পরিবর্তিত generate-plan route block:**

```javascript
    // 2. Generate and write template
    const nextPhase = getNextPhaseNum(project.path);
    const templateContent = generatePlanTemplate(name, tier, description, nextPhase);
    fs.writeFileSync(targetPath, templateContent, 'utf8');
```

এবং sync call:

```javascript
    // 5. Automatically sync newly created plan to PROGRESS.md
    try { syncPlanToProgress(project.path); } catch {}
```

- **Done-check:** `cd dashboard && npm run build` — zero errors

---

## Phase 60: Pending Project & Empty Name Fix

### Step 60.1 — Fix empty name in api.js add-project (`dashboard/src/server/api.js`)
- **File:** `dashboard/src/server/api.js`
- **Action:** MODIFY
- **Depends:** None

**সমস্যা:** `dirPath = "/Volumes/SSD/2026/imran_agro_02/"` (trailing `/` আছে)। `dirPath.split(/[/\\]/).pop()` → `""` (empty string)।

**কী করতে হবে:**
Line 57 পরিবর্তন করো:
- আগে: `name: name || dirPath.split(/[/\\]/).pop(),`
- পরে: `name: name || path.basename(dirPath.replace(/\/+$/, '')) || 'Untitled',`

**ঠিক line 54-59 এই হবে:**

```javascript
  const newProject = {
    id: Date.now().toString(),
    path: dirPath,
    name: name || path.basename(dirPath.replace(/\/+$/, '')) || 'Untitled',
    addedAt: new Date().toISOString()
  };
```

- **Done-check:** `cd dashboard && npm run build`

---

### Step 60.2 — Fix empty name fallback in parser.js (`dashboard/src/server/parser.js`)
- **File:** `dashboard/src/server/parser.js`
- **Action:** MODIFY
- **Depends:** None

**সমস্যা:** আগে থেকে saved project-এর নাম ফাঁকা থাকলে enrichProject সেটা ঠিক করে না।

**কী করতে হবে:**
`enrichProject` function-এ (line 56-80), line 75 এর আগে নাম ঠিক করো:

আগে line 75:
```javascript
    return { ...p, isInstalled, progress, hasPlanFiles, planStats };
```

পরে:
```javascript
    const safeName = p.name || path.basename((p.path || '').replace(/\/+$/, '')) || 'Untitled';
    return { ...p, name: safeName, isInstalled, progress, hasPlanFiles, planStats };
```

- **Done-check:** `cd dashboard && npm run build`

---

### Step 60.3 — Add "In Progress" filter to HomePage (`dashboard/src/pages/HomePage.jsx`)
- **File:** `dashboard/src/pages/HomePage.jsx`
- **Action:** MODIFY
- **Depends:** Step 60.2

**সমস্যা:** "Pending Setup" ফিল্টার শুধু `!p.isInstalled` চেক করে। ইউজার আসলে "incomplete projects" দেখতে চায়।

**কী করতে হবে:**

1. Line 10 এ `filterType` state-এর default ঠিক আছে: `useState('all')`

2. Line 13-22 এর `filteredProjects` filter logic পরিবর্তন:

আগে:
```javascript
      if (filterType === 'verified') return p.isInstalled;
      if (filterType === 'pending') return !p.isInstalled;
```

পরে:
```javascript
      if (filterType === 'verified') return p.isInstalled && p.progress?.overall?.percentage === 100;
      if (filterType === 'in_progress') return p.isInstalled && (p.progress?.overall?.percentage || 0) < 100;
      if (filterType === 'pending') return !p.isInstalled;
```

3. Line 38-39 এ count calculations পরিবর্তন:

আগে:
```javascript
  const verifiedCount = (projects || []).filter((p) => p.isInstalled).length;
  const pendingCount = (projects || []).length - verifiedCount;
```

পরে:
```javascript
  const completedCount = (projects || []).filter((p) => p.isInstalled && p.progress?.overall?.percentage === 100).length;
  const inProgressCount = (projects || []).filter((p) => p.isInstalled && (p.progress?.overall?.percentage || 0) < 100).length;
  const pendingCount = (projects || []).filter((p) => !p.isInstalled).length;
```

4. Filter buttons (line 60-90): 4 button বানাও — All, Complete, In Progress, Not Setup

আগে (3 buttons: All, Verified, Pending Setup):
```jsx
<button onClick={() => setFilterType('all')} ...>
  All Workspaces ({projects.length})
</button>
<button onClick={() => setFilterType('verified')} ...>
  Verified ({verifiedCount})
</button>
<button onClick={() => setFilterType('pending')} ...>
  Pending Setup ({pendingCount})
</button>
```

পরে (4 buttons):
```jsx
<button onClick={() => setFilterType('all')} ...>
  All ({projects.length})
</button>
<button onClick={() => setFilterType('verified')} ...>
  Complete ({completedCount})
</button>
<button onClick={() => setFilterType('in_progress')} ...>
  In Progress ({inProgressCount})
</button>
<button onClick={() => setFilterType('pending')} ...>
  Not Setup ({pendingCount})
</button>
```

**প্রতিটি button-এর className logic একই থাকবে** — শুধু `filterType` value আর label/count পরিবর্তন।

- **Done-check:** `cd dashboard && npm run build`

---

## Phase 61: Progress Accuracy Fix

### Step 61.1 — Add unsyncedSteps to enrichProject (`dashboard/src/server/parser.js`)
- **File:** `dashboard/src/server/parser.js`
- **Action:** MODIFY
- **Depends:** Step 60.2

**সমস্যা:** Plan ফাইলে step আছে কিন্তু PROGRESS.md-তে নেই — এটা dashboard দেখায় না।

**কী করতে হবে:**
`enrichProject()` function-এ return-এর আগে unsynced count যোগ করো:

```javascript
    const progressTotal = progress?.overall?.total || 0;
    const planTotal = planStats?.totalSteps || 0;
    const unsyncedSteps = Math.max(0, planTotal - progressTotal);
    const safeName = p.name || path.basename((p.path || '').replace(/\/+$/, '')) || 'Untitled';
    return { ...p, name: safeName, isInstalled, progress, hasPlanFiles, planStats, unsyncedSteps };
```

**দ্রষ্টব্য:** Step 60.2 এর `safeName` যোগ করাটাও এখানে থাকবে। দুইটা merge করো।

- **Done-check:** `cd dashboard && npm run build`

---

### Step 61.2 — Show unsynced badge on HomeProjectCard (`dashboard/src/components/home/HomeProjectCard.jsx`)
- **File:** `dashboard/src/components/home/HomeProjectCard.jsx`
- **Action:** MODIFY
- **Depends:** Step 61.1

**সমস্যা:** Project card-এ plan file-এ pending step থাকলেও সেটা দেখায় না।

**কী করতে হবে:**
Line 98 এর `{project.isInstalled ? (` block-এর ভিতরে, progress bar-এর নিচে (line 121 এর পরে) unsynced badge যোগ করো:

```jsx
            {project.unsyncedSteps > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] font-mono text-amber-400/80">
                  ⚠ {project.unsyncedSteps} unsynced plan steps
                </span>
              </div>
            )}
```

এটা line 121 (`</div>`) এর পরে এবং line 122 (`</div>`) এর আগে বসাও।

- **Done-check:** `cd dashboard && npm run build`

---

### Step 61.3 — Show unsynced indicator in CockpitTab (`dashboard/src/components/CockpitTab.jsx`)
- **File:** `dashboard/src/components/CockpitTab.jsx`
- **Action:** MODIFY
- **Depends:** Step 61.1

**সমস্যা:** Cockpit tab-এ কোনো warning নেই যে plan file আর PROGRESS.md out of sync।

**কী করতে হবে:**

1. Props-এ `unsyncedSteps` যোগ করো:
   - আগে: `export default function CockpitTab({ selectedProject, overall, ...`
   - Function body-তে: `const unsyncedSteps = selectedProject?.unsyncedSteps || 0;`

2. Cockpit-এর 4টা card-এর নিচে (line 82 এর `</div>` এর পরে) sync warning যোগ করো:

```jsx
      {unsyncedSteps > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
          <span className="text-amber-400 text-sm">⚠</span>
          <div>
            <span className="text-xs font-bold text-amber-300">
              {unsyncedSteps} plan steps not synced to Roadmap
            </span>
            <p className="text-[11px] text-amber-400/60 font-mono mt-0.5">
              Run <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300">./l sync</code> to update
            </p>
          </div>
        </div>
      )}
```

- **Done-check:** `cd dashboard && npm run build`

---

## Phase 62: Final Verification

### Step 62.1 — Run full verification suite (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 59.3, Step 60.3, Step 61.3

**কী করতে হবে:**
```bash
cd /Volumes/SSD/0.1/ai-checkpoint
./l v          # Validation pass
./l health     # Score = 100/100
./l quality    # Score = 85+
cd dashboard && npm run build   # Zero errors
```

সব pass হলে ✅ Done!

- **Done-check:** exit code 0 for all 4 commands
