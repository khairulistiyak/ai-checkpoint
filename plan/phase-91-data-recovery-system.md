# Phase 91: Data Recovery System & Migration Safety
**Status**: NOT STARTED
**Description**: ৭-স্তর ডেটা রিকভারি সিস্টেম তৈরি, পুরাতন `.agents/` থেকে অটো-মাইগ্রেশন, plan/ থেকে PROGRESS.md অটো-রিকভারি, টাইম মেশিন স্ন্যাপশট এবং Export/Import ফিচার।

---

## Technical Context

**ডিপেন্ডেন্সি:** Phase 88, 89, 90 সম্পূর্ণ হতে হবে।

**৭ স্তর সুরক্ষা:**
1. `plan/` ফোল্ডার (প্রজেক্টে) — সবসময়
2. `plan-backup/` (গ্লোবাল স্টোরে) — plan/ ডিলিট হলে
3. `snapshot.json` (গ্লোবাল স্টোরে) — backup ও নেই
4. Git হিস্ট্রি — snapshot ও নেই
5. Export `.json` ফাইল — পিসি ফরম্যাট
6. টাইম মেশিন `snapshots/` (গ্লোবাল) — আগের ভার্সনে ফেরা
7. Cloud (GitHub Gist) — সব ধ্বংস (ঐচ্ছিক)

---

## Step-by-Step Implementation Plan

### Step 91.1: Implement migrateFromDotAgents Logic
**File**: `dashboard/src/server/global-store.js`
- `migrateFromDotAgents(projectId, projectPath)` ফাংশন সম্পূর্ণ করো:
  - পুরাতন `.agents/` ফোল্ডার চেক করো
  - PROGRESS.md, RULES.md, AGENTS.md, SYSTEM_GUIDE.md, ai-config.json, activity-log.jsonl, intelligence-history.json → গ্লোবাল স্টোরে কপি
  - সফল হলে `{ migrated: true, files: [...] }` রিটার্ন
- ড্যাশবোর্ডে প্রজেক্ট ওপেন/রেজিস্টার হলে এই ফাংশন কল করো (server.js বা projects.js তে)

### Step 91.2: Implement recoverProgressFromPlans Logic
**File**: `dashboard/src/server/global-store.js`
- `recoverProgressFromPlans(projectId, projectPath)` ফাংশন সম্পূর্ণ করো:
  - `plan/` ফোল্ডার স্ক্যান করো
  - `packages/cli/plan-sync-utils.js` এর `parsePlanFileSteps()` লজিক ব্যবহার করো (কপি করে ESM এ কনভার্ট)
  - প্রতিটি plan ফাইল পার্স → ফেজ, স্টেপ, টাইটেল বের করো
  - plan ফাইলে `[x]` মার্ক করা স্টেপগুলো `done` হিসেবে ধরো
  - নতুন PROGRESS.md তৈরি করো (`templates/PROGRESS.md` হেডার + পার্সড ফেজ/স্টেপ)
  - Overall Progress বার আপডেট করো
  - `{ recovered: true, phases: N, steps: M, completed: C }` রিটার্ন

### Step 91.3: Auto-Recovery Flow in Projects Route
**File**: `dashboard/src/server/projects.js`
- প্রজেক্ট রেজিস্টার/ওপেন হলে এই ফ্লো চালাও:
  1. গ্লোবাল স্টোরে PROGRESS.md আছে? → হ্যাঁ: কিছু করো না
  2. না → পুরাতন `.agents/` আছে? → হ্যাঁ: `migrateFromDotAgents()` কল
  3. না → `plan/` ফোল্ডারে .md ফাইল আছে? → হ্যাঁ: `recoverProgressFromPlans()` কল
  4. না → ফ্রেশ ইনিশিয়ালাইজ (টেমপ্লেট থেকে)

### Step 91.4: Snapshot System
**File**: `dashboard/src/server/global-store.js`
- `saveSnapshot(projectId, projectPath)` ফাংশন যোগ করো:
  - PROGRESS.md, plan ফাইল লিস্ট, কমপ্লিটেড স্টেপ কাউন্ট → `snapshot.json` এ সেভ
  - আগের snapshot → `snapshots/snapshot-<timestamp>.json` এ কপি (টাইম মেশিন)
  - `snapshots/` ফোল্ডারে ১০+ ফাইল থাকলে পুরাতনগুলো ডিলিট
- CLI step complete (`aic c X.Y`) এবং plan-sync হলে এই ফাংশন কল করো

### Step 91.5: Plan Backup Watcher
**File**: `dashboard/src/server/watcher-events.js`
- plan ফাইল পরিবর্তন হলে `globalStore.backupPlanFile()` কল (Step 89.10 এ শুরু করা)
- plan/ ফোল্ডার ডিলিট ডিটেক্ট হলে `plan-backup/` থেকে রিস্টোর:
  ```javascript
  if (eventType === 'unlinkDir' && relativePath === 'plan') {
    const backupDir = globalStore.getPlanBackupDir(projectId);
    if (fs.existsSync(backupDir)) {
      fs.mkdirSync(path.join(projectPath, 'plan'), { recursive: true });
      // backup থেকে plan/ এ সব ফাইল কপি
    }
  }
  ```

### Step 91.6: Export/Import API Routes
**File**: `dashboard/src/server/projects.js` (বা নতুন `recovery.js`)
- `GET /api/projects/:id/export` রাউট:
  - PROGRESS.md, plan ফাইল, RULES.md, AGENTS.md, ai-config.json → একটি JSON অবজেক্টে প্যাক
  - `Content-Disposition: attachment; filename="project-export.json"` হেডার দিয়ে রেসপন্স
- `POST /api/projects/:id/import` রাউট:
  - আপলোড করা JSON থেকে সব ফাইল রিস্টোর

### Step 91.7: Verify Recovery System
- টেস্ট ১: পুরাতন `.agents/` আছে এমন প্রজেক্ট ওপেন → অটো-মাইগ্রেট হচ্ছে কি না
- টেস্ট ২: গ্লোবাল ডেটা ডিলিট → প্রজেক্ট আবার অ্যাড → plan/ থেকে রিকভার হচ্ছে কি না
- টেস্ট ৩: plan/ ফোল্ডার ডিলিট → backup থেকে রিস্টোর হচ্ছে কি না
- টেস্ট ৪: Export → ডেটা ডিলিট → Import → সব ফিরে আসছে কি না
- টেস্ট ৫: স্ন্যাপশট `snapshots/` ফোল্ডারে তৈরি হচ্ছে কি না
