# Phase 89: Dashboard Backend — Global Store Migration
**Status**: NOT STARTED
**Description**: ড্যাশবোর্ড ব্যাকএন্ডের সব ফাইল থেকে `.agents/` হার্ডকোডেড পাথ সরিয়ে `global-store.js` মডিউল ব্যবহার করা। প্রজেক্ট ইনিশিয়ালাইজেশন লজিক আপডেট করা — packages কপি বাদ দেওয়া।

---

## Technical Context

**ডিপেন্ডেন্সি:** Phase 88 এর `global-store.js` সম্পূর্ণ হতে হবে।

**মূলনীতি:** প্রতিটি ফাইলে:
1. `import * as globalStore from './global-store.js';` যোগ করো
2. `.agents/` হার্ডকোডেড পাথ → `globalStore.getXxxPath(project.id)` দিয়ে রিপ্লেস
3. ফাংশনে `projectId` প্যারামিটার লাগলে যোগ করো ও কলার আপডেট করো

---

## Step-by-Step Implementation Plan

### Step 89.1: Update projects.js — Install Route
**File**: `dashboard/src/server/projects.js`
- `import * as globalStore from './global-store.js';` যোগ করো
- `/install` রাউটে packages কপি করার সব কোড সরাও:
  - `.agents/scripts/` ফোল্ডার তৈরি — ডিলিট
  - `.agents/packages/cli/` ফোল্ডার তৈরি — ডিলিট
  - `.agents/packages/core/` ফোল্ডার তৈরি — ডিলিট
  - `ledger.cjs` কপি — ডিলিট
  - packages for loop কপি — ডিলিট
  - `fs.writeFileSync(path.join(projectDir, 'l'), ...)` — ডিলিট
- নতুন লজিক যোগ করো:
  - `globalStore.ensureProjectDataDir(project.id)` কল
  - টেমপ্লেট ফাইল (PROGRESS.md, RULES.md, AGENTS.md, SYSTEM_GUIDE.md) গ্লোবাল স্টোরে কপি
  - প্রজেক্টে `.agents/` তে শুধু RULES.md, SYSTEM_GUIDE.md কপি (কনফিগ ফাইল)
  - রুট `AGENTS.md` কপি
  - `plan/` ফোল্ডার তৈরি

### Step 89.2: Update parser.js
**File**: `dashboard/src/server/parser.js`
- `import * as globalStore from './global-store.js';` যোগ করো
- `path.join(projectPath, '.agents', 'PROGRESS.md')` → `globalStore.getProgressPath(projectId)` (সব জায়গায়)
- `path.join(projectPath, '.agents', 'intelligence-history.json')` → `globalStore.getIntelligenceHistoryPath(projectId)`
- `path.join(p.path, '.agents', 'PROGRESS.md')` → `globalStore.getProgressPath(p.id)` (enrichProject ফাংশনে)
- ⚠️ ফাংশন সিগনেচারে `projectId` প্যারামিটার যোগ করো
- ⚠️ যেখানে এই ফাংশন কল হচ্ছে সেখানেও `projectId` পাস করো

### Step 89.3: Update config.js
**File**: `dashboard/src/server/config.js`
- `import * as globalStore from './global-store.js';` যোগ করো
- `path.join(project.path, '.agents', 'RULES.md')` → `globalStore.getRulesPath(project.id)`
- `path.join(project.path, '.agents', 'AGENTS.md')` → `globalStore.getAgentsPath(project.id)`
- `path.join(project.path, '.agents')` → `globalStore.getProjectDataDir(project.id)`

### Step 89.4: Update ai-tier.js
**File**: `dashboard/src/server/ai-tier.js`
- `import * as globalStore from './global-store.js';` যোগ করো
- `path.join(project.path, '.agents', 'ai-config.json')` → `globalStore.getAiConfigPath(project.id)` (সব জায়গায়)
- `path.join(project.path, '.agents')` → `globalStore.getProjectDataDir(project.id)` (mkdirSync কলে)

### Step 89.5: Update activity-logger.js
**File**: `dashboard/src/server/activity-logger.js`
- `import * as globalStore from './global-store.js';` যোগ করো
- constructor এ `projectId` প্যারামিটার যোগ করো
- `path.join(projectPath, '.agents', 'activity-log.jsonl')` → `globalStore.getActivityLogPath(projectId)`
- ⚠️ যেখানে `new ActivityLogger(projectPath)` কল হচ্ছে সেখানে `new ActivityLogger(projectPath, projectId)` করো

### Step 89.6: Update project-health.js
**File**: `dashboard/src/server/project-health.js`
- `import * as globalStore from './global-store.js';` যোগ করো
- সব হেলথ চেক পয়েন্ট আপডেট:
  - `.agents directory` চেক → `globalStore.getProjectDataDir(project.id)` চেক
  - `.agents/PROGRESS.md` → `globalStore.getProgressPath(project.id)`
  - `.agents/RULES.md` → `globalStore.getRulesPath(project.id)`
  - `.agents/scripts/ledger.cjs` → `globalStore.getGlobalEnginePath()` (Global Engine চেক)

### Step 89.7: Update project-actions.js
**File**: `dashboard/src/server/project-actions.js`
- `import * as globalStore from './global-store.js';` যোগ করো
- `path.join(project.path, '.agents', 'scripts', 'ledger.cjs')` → `globalStore.getGlobalEnginePath()`
- ⚠️ sync/doctor/status কমান্ড: `node ledgerScript args` → `node globalEnginePath args`

### Step 89.8: Update plan-sync-server.js
**File**: `dashboard/src/server/plan-sync-server.js`
- `import * as globalStore from './global-store.js';` যোগ করো
- `path.join(projectPath, '.agents', 'PROGRESS.md')` → `globalStore.getProgressPath(projectId)`
- `syncPlanToProgress` ফাংশনে: `packages/cli/plan-sync.js` রেফারেন্স → গ্লোবাল ইঞ্জিন ব্যবহার
- ⚠️ `projectId` প্যারামিটার যোগ করো

### Step 89.9: Update Remaining Files
**Files**: `intelligence.js`, `health.js`, `dry-analysis.js`
- প্রতিটিতে `import * as globalStore from './global-store.js';` যোগ করো
- `.agents/` পাথ → `globalStore` ফাংশন দিয়ে রিপ্লেস

### Step 89.10: Update watcher-events.js — Plan Backup
**File**: `dashboard/src/server/watcher-events.js`
- `import * as globalStore from './global-store.js';` যোগ করো
- plan ফাইল চেঞ্জ হলে `globalStore.backupPlanFile()` কল যোগ করো:
  ```
  if (relativePath.startsWith('plan/') && relativePath.endsWith('.md')) {
    globalStore.backupPlanFile(this.projectId, this.projectPath, path.basename(relativePath));
  }
  ```

### Step 89.11: Update server.js — Engine Deploy
**File**: `dashboard/server.js`
- `import * as globalStore from './src/server/global-store.js';` যোগ করো
- সার্ভার স্টার্ট হওয়ার সময়:
  - `globalStore.deployGlobalEngine(engineSourcePath)` কল করো
  - `engineSourcePath = path.resolve(__dirname, '..', 'assets', 'engine.bin.js')`

### Step 89.12: Verify Dashboard Backend
- `cd dashboard && npm run dev` চালাও
- কোনো import error নেই তা চেক করো
- একটি টেস্ট প্রজেক্ট ইনিশিয়ালাইজ করো
- চেক করো: `.agents/packages/` তৈরি হয়নি, `.agents/` তে শুধু RULES.md ও SYSTEM_GUIDE.md আছে
- চেক করো: `~/.ai-checkpoint/projects/<id>/PROGRESS.md` তৈরি হয়েছে
