# Phase 88: Global Engine Architecture — Build System & Core Module
**Status**: NOT STARTED
**Description**: সোর্স কোড প্রটেকশনের জন্য গ্লোবাল ইঞ্জিন বিল্ড সিস্টেম তৈরি এবং গ্লোবাল ডেটা স্টোর মডিউল তৈরি। esbuild + javascript-obfuscator দিয়ে ৬০টি সোর্স ফাইলকে ১টি এনক্রিপ্টেড ফাইলে বান্ডিল করা। `.agents/` থেকে packages/ ও scripts/ সরানো।

---

## Technical Context

**সমস্যা:** বর্তমানে প্রজেক্ট ইনিশিয়ালাইজ করলে `packages/cli/` (২৫ ফাইল) + `packages/core/` (৩৫ ফাইল) = ৬০টি সোর্স কোড `.agents/` এ কপি হয়। `.exe` তেও `asar: false` থাকায় কোড পড়া যায়।

**সমাধান:** সব কোড এনক্রিপ্ট করে `~/.ai-checkpoint/engine.bin.js` এ রাখা। ইউজারের প্রজেক্টে শুধু `plan/` + কনফিগ ফাইল (AGENTS.md, RULES.md) থাকবে।

**গ্লোবাল স্টোর পাথ:** `~/.ai-checkpoint/`
**প্রজেক্ট ডেটা পাথ:** `~/.ai-checkpoint/projects/<project-id>/`

---

## Step-by-Step Implementation Plan

### Step 88.1: Install Build Dependencies
**File**: `package.json`
- `npm install --save-dev esbuild javascript-obfuscator` চালাও
- `scripts` সেকশনে `"build:engine": "node scripts/build-engine.js"` যোগ করো

### Step 88.2: Create Build Engine Script
**File**: `scripts/build-engine.js`
- নতুন ফাইল তৈরি করো (CommonJS — `require`/`module.exports`)
- ধাপ ১: `assets/` ফোল্ডার না থাকলে তৈরি করো (`fs.mkdirSync`)
- ধাপ ২: esbuild দিয়ে `packages/cli/index.js` → `dist/engine.raw.js` বান্ডিল করো
  - `platform: 'node'`, `format: 'cjs'`, `bundle: true`, `minify: true`
  - `external: ['chokidar']` (নেটিভ মডিউল exclude)
- ধাপ ৩: javascript-obfuscator দিয়ে `dist/engine.raw.js` → `assets/engine.bin.js`
  - অপশন: `compact: true`, `controlFlowFlattening: true`, `stringArray: true`, `stringArrayEncoding: ['rc4']`, `deadCodeInjection: true`
- ধাপ ৪: `dist/engine.raw.js` ডিলিট করো (শুধু এনক্রিপ্টেড ভার্সন রাখো)
- কনসোলে সাকসেস মেসেজ দেখাও

### Step 88.3: Create Global Store Module
**File**: `dashboard/src/server/global-store.js`
- নতুন ফাইল তৈরি করো (ESM — `import`/`export`)
- `os`, `path`, `fs` ইম্পোর্ট করো
- বেস পাথ: `GLOBAL_DIR = path.join(os.homedir(), '.ai-checkpoint')`
- নিচের ফাংশনগুলো export করো:
  - `getProjectDataDir(projectId)` → `~/.ai-checkpoint/projects/<id>/`
  - `getProgressPath(projectId)` → `.../PROGRESS.md`
  - `getRulesPath(projectId)` → `.../RULES.md`
  - `getAgentsPath(projectId)` → `.../AGENTS.md`
  - `getSystemGuidePath(projectId)` → `.../SYSTEM_GUIDE.md`
  - `getAiConfigPath(projectId)` → `.../ai-config.json`
  - `getActivityLogPath(projectId)` → `.../activity-log.jsonl`
  - `getIntelligenceHistoryPath(projectId)` → `.../intelligence-history.json`
  - `getSnapshotPath(projectId)` → `.../snapshot.json`
  - `getPlanBackupDir(projectId)` → `.../plan-backup/`
  - `getSnapshotsDir(projectId)` → `.../snapshots/`
  - `getGlobalEnginePath()` → `~/.ai-checkpoint/engine.bin.js`
  - `ensureProjectDataDir(projectId)` → ডিরেক্টরি তৈরি করে পাথ রিটার্ন
  - `migrateFromDotAgents(projectId, projectPath)` → পুরাতন `.agents/` থেকে ডেটা কপি
  - `recoverProgressFromPlans(projectId, projectPath)` → `plan/` থেকে PROGRESS.md রিবিল্ড
  - `backupPlanFile(projectId, projectPath, filename)` → plan ফাইল ব্যাকআপ
  - `deployGlobalEngine(appEnginePath)` → `assets/engine.bin.js` → `~/.ai-checkpoint/engine.bin.js` কপি

### Step 88.4: Verify Build Engine
- `npm run build:engine` চালাও
- `ls -la assets/engine.bin.js` দিয়ে ফাইল তৈরি হয়েছে কি না চেক করো
- `node assets/engine.bin.js --help` দিয়ে কাজ করছে কি না চেক করো
