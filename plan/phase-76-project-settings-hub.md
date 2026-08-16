# Phase 76: Project-Specific Settings Hub & Workspace Control Center

> প্রতিটি প্রজেক্টের জন্য বিশেষায়িত ৪-ট্যাব ডাইনামিক প্রজেক্ট সেটিংস হাব (Project Metadata, RULES.md with Presets, AGENTS.md Workflow, Quick Actions & Bridge Sync) তৈরি করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 76: Project-Specific Settings Hub & Workspace Control Center

### Step 76.1 — Add Project Metadata Update & Workspace Actions Backend (`dashboard/src/server/projects.js`)
- **File:** `dashboard/src/server/projects.js`
- **Action:** MODIFY
- **Depends:** None

**কী করতে হবে:**
1. `dashboard/src/server/projects.js`-এ `PUT /:id` যুক্ত করো যা প্রজেক্টের ডিসপ্লে নেম আপডেট করবে।
2. `POST /:id/relink-bridge` এন্ডপয়েন্ট যুক্ত করো যা প্রজেক্টের রুটে ক্লিন `AGENTS.md` ব্রিজ তৈরি/রিফ্রেশ করবে।
3. `POST /:id/sync-plans` এন্ডপয়েন্ট যুক্ত করো যা প্রজেক্টের `plan/*.md` থেকে `PROGRESS.md` সিঙ্ক করবে।
4. নিশ্চিত করো ফাইলটি ১৫০ লাইনের নিচে থাকে (Rule 0)।

- **Done-check:** `test -f dashboard/src/server/projects.js`

---

### Step 76.2 — Create Modular Project Settings Tab Components (`dashboard/src/components/config/ProjectSettingsTabs.jsx`)
- **File:** `dashboard/src/components/config/ProjectSettingsTabs.jsx`
- **Action:** CREATE
- **Depends:** Step 76.1

**কী করতে হবে:**
1. প্রজেক্ট সেটিংসের জন্য মডুলার কম্পোনেন্ট তৈরি করো:
   - **GeneralTab:** প্রজেক্ট নেম এডিটর, পাথ ও আইডিই ওপেন বাটন, সিঙ্ক প্ল্যান ও রি-লিঙ্ক ব্রিজ অ্যাকশন।
   - **RulesTab:** `RULES.md` এডিটর সহ কুইক টেমপ্লেট ইনজেক্টর (Strict Monorepo, React/Vite, Python)।
   - **AgentsTab:** `AGENTS.md` এডিটর সহ ওয়ার্কফ্লো মোড প্রিসেট।
2. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/components/config/ProjectSettingsTabs.jsx`

---

### Step 76.3 — Rebuild ConfigEditor into Studio Project Settings Modal (`dashboard/src/components/ConfigEditor.jsx`)
- **File:** `dashboard/src/components/ConfigEditor.jsx`
- **Action:** MODIFY
- **Depends:** Step 76.2

**কী করতে হবে:**
1. `ConfigEditor.jsx`-কে একটি আল্ট্রা-স্লিক Apple Studio Dark Theme প্রজেক্ট সেটিংস মডালে রূপান্তর করো।
2. ৩টি প্রধান ট্যাব (General, RULES.md, AGENTS.md) এবং আনসেভড চেঞ্জ সেফগার্ড সহ ইন্টিগ্রেট করো।
3. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/components/ConfigEditor.jsx`

---

### Step 76.4 — Add Frontend API Functions for Project Actions (`dashboard/src/utils/api.js`)
- **File:** `dashboard/src/utils/api.js`
- **Action:** MODIFY
- **Depends:** Step 76.3

**কী করতে হবে:**
1. `dashboard/src/utils/api.js`-এ `updateProject`, `relinkProjectBridge`, এবং `syncProjectPlans` ফাংশন যোগ করো।
2. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/utils/api.js`

---

### Step 76.5 — Full Verification & Build Suite (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 76.1, Step 76.2, Step 76.3, Step 76.4

**কী করতে হবে:**
```bash
find . -name "._*" -delete 2>/dev/null || true
./l v
./l health
./l quality
npm test
npm --prefix dashboard run build
```

- **Done-check:** exit code 0 for all validation commands
