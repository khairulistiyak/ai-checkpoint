# ⚡ Phase 39: প্রজেক্ট রান লোকেশন এবং কমান্ড প্যানেল সিস্টেম (Project Run Location & Commands Panel)

> ⚠️ এই plan-এর প্রতিটি step-এ **সম্পূর্ণ ফাইল, অ্যাকশন এবং নির্দেশাবলী** দেওয়া আছে। কোনো কিছু অনুমান করার প্রয়োজন নেই।

---

## 🎯 সমস্যা কী?

AI Agent এবং ডেভেলপাররা কাজ করার সময় প্রায়ই এই ভুলগুলো করে:
1. **ভুল লোকেশনে কমান্ড রান করা** — যেমন: ড্যাশবোর্ডের কমান্ড `npm run dev` প্রজেক্টের রুট ফোল্ডারে রান করা, অথবা রুটের কমান্ড সাব-ডিরেক্টরিতে রান করা।
2. **কমান্ড মনে না থাকা বা কনফিউশন** — প্রজেক্টে `dev`, `build`, `test`, `lint` এর আসল কমান্ড কী তা খুঁজতে সময় নষ্ট হওয়া।
3. **সেন্ট্রাল প্যানেল না থাকা** — ড্যাশবোর্ডে এমন কোনো একক প্যানেল নেই যেখান থেকে ১-ক্লিকে সঠিক ডিরেক্টরি পাথ ও কম্বাইন্ড টার্মিনাল কমান্ড (`cd ... && npm run dev`) কপি করা যায়।

---

## 💡 সমাধান কী?

1. **নতুন রুল (RULE 2: Project Execution & Run Environment)** — `.agents/RULES.md` এবং `templates/RULES.md`-এ নির্দিষ্ট নিয়ম থাকবে যাতে প্রজেক্টের রান লোকেশন এবং সব কমান্ড কনফিগার করা থাকে।
2. **অটো-ডিটেকশন কোর ইঞ্জিন (`packages/core/run-config.js`)** — প্রজেক্ট রুট ও সাবডিরেক্টরি (`dashboard/`, `packages/*`, ইত্যাদি) স্ক্যান করে `package.json` স্ক্রিপ্ট ও রুলস স্বয়ংক্রিয়ভাবে ডিটেক্ট করবে।
3. **ড্যাশবোর্ড রান ও কমান্ড প্যানেল (`ProjectRunPanel.jsx`)** — 
   - প্রজেক্ট লোকেশন কার্ড (পাথ কপি এবং ১-ক্লিকে `cd <path>` কপি)।
   - ক্যাটাগরিভিত্তিক কমান্ড কার্ডস (`DEV SERVER`, `TEST`, `BUILD`, `LINT`, `CHECKPOINT`)।
   - ১-ক্লিক কমান্ড কপি এবং ১-ক্লিক টার্মিনাল কম্বাইন্ড কমান্ড কপি (`cd "/path/to/dir" && npm run dev`)।
   - কাস্টম কমান্ড অ্যাড/এডিট করার সুবিধা।
4. **ককপিট কুইক-উইজেট** — মেইন ড্যাশবোর্ড স্ক্রিনে দ্রুত কপি করার জন্য প্রাইমারি রান শর্টকাট।
5. **CLI সাপোর্ট** — `./l run` কমান্ড দিয়ে টার্মিনাল থেকেই কালারফুল টেবিলে সব কমান্ড দেখা ও চালানো যাবে।

---

## 📌 রুলস (প্রতিটি step-এ মানতে হবে)

1. **1 step = 1 file** — এক step-এ শুধু একটি নির্দিষ্ট ফাইল তৈরি বা মডিফাই করো
2. **Step শুরু করার সময়**: `./l start 39.X`
3. **Step শেষ করার সময়**: `./l c 39.X "note"`
4. **ফাইল সাইজ লিমিট**: প্রতিটি ফাইল সর্বোচ্চ ১৫০ লাইনের মধ্যে রাখতে হবে (RULE 0)
5. কোনো step skip বা পরিবর্তন করা যাবে না

---

## 🔷 Phase 39: Project Run Location & Commands Panel System

---

### Step 39.1 — Templates ও RULES.md-এ RULE 2 যোগ করা (`templates/RULES.md`)
- **File:** `templates/RULES.md`
- **Action:** EDIT
- **Content:** `templates/RULES.md` এবং `.agents/RULES.md`-এ `## RULE 2 — Project Execution & Run Environment` যোগ করো, যেখানে প্রজেক্টের রান লোকেশন, স্ট্যান্ডার্ড কমান্ড টেবিল (`dev`, `build`, `test`, `lint`, `checkpoint`) এবং ডিরেক্টরি সুইচিং নিয়ম থাকবে।
- **Done-check:** `grep -q "RULE 2" templates/RULES.md && grep -q "RULE 2" .agents/RULES.md`
- **Depends:** None

---

### Step 39.2 — রান কনফিগ অটো-ডিটেকশন কোর ইঞ্জিন তৈরি (`packages/core/run-config.js`)
- **File:** `packages/core/run-config.js`
- **Action:** CREATE
- **Content:** প্রজেক্ট রুট ও সাবডিরেক্টরি (`dashboard`, `packages/*`, ইত্যাদি) স্ক্যান করে `package.json` স্ক্রিপ্টস এবং `RULES.md` সেটিংস থেকে কমান্ডগুলো ক্যাটাগরিভিত্তিক (`dev`, `build`, `test`, `lint`, `checkpoint`, `custom`) অবজেক্ট আকারে রিটার্ন করবে।
- **Done-check:** `node -c packages/core/run-config.js`
- **Depends:** Step 39.1

---

### Step 39.3 — সার্ভার রান কনফিগ API রাউটার তৈরি (`dashboard/src/server/run-config.js`)
- **File:** `dashboard/src/server/run-config.js`
- **Action:** CREATE
- **Content:** Express রাউটার তৈরি করো যা `GET /api/projects/:id/run-config` (ডিটেক্টেড কমান্ড ও লোকেশন পাওয়ার জন্য) এবং `POST /api/projects/:id/run-config` (কাস্টম রান কমান্ড সেভ করার জন্য) হ্যান্ডেল করবে।
- **Done-check:** `node -c dashboard/src/server/run-config.js`
- **Depends:** Step 39.2

---

### Step 39.4 — সার্ভারে রান কনফিগ API মাউন্ট করা (`dashboard/server.js`)
- **File:** `dashboard/server.js`
- **Action:** EDIT
- **Content:** `dashboard/server.js`-এ `runConfigRouter` ইম্পোর্ট করো এবং `/api/projects` পাথে মাউন্ট করো।
- **Done-check:** `node -c dashboard/server.js`
- **Depends:** Step 39.3

---

### Step 39.5 — ফ্রন্টএন্ড API ক্লায়েন্টে ফাংশন যোগ করা (`dashboard/src/utils/api.js`)
- **File:** `dashboard/src/utils/api.js`
- **Action:** EDIT
- **Content:** `fetchProjectRunConfig(projectId)` এবং `saveProjectRunConfig(projectId, config)` ফাংশন যোগ করো এবং এক্সপোর্ট করো।
- **Done-check:** `node -c dashboard/src/utils/api.js`
- **Depends:** Step 39.4

---

### Step 39.6 — রান কমান্ড কার্ড UI কম্পোনেন্ট তৈরি (`dashboard/src/components/runs/RunCommandCard.jsx`)
- **File:** `dashboard/src/components/runs/RunCommandCard.jsx`
- **Action:** CREATE
- **Content:** একটি মাইক্রো-কম্পোনেন্ট (১৫০ লাইনের নিচে) যা প্রতিটি কমান্ডের ক্যাটাগরি ব্যাজ (`DEV`, `TEST`, `BUILD`, `LINT`, `CHECKPOINT`), এক্সিকিউটেবল স্ক্রিপ্ট, ওয়ার্কিং ডিরেক্টরি ট্যাগ, ১-ক্লিক কমান্ড কপি এবং ১-ক্লিক টার্মিনাল ফুল কমান্ড (`cd <dir> && <cmd>`) কপি বাটন দেখাবে।
- **Done-check:** `test -f dashboard/src/components/runs/RunCommandCard.jsx`
- **Depends:** Step 39.5

---

### Step 39.7 — মেইন রান ও কমান্ড প্যানেল কম্পোনেন্ট তৈরি (`dashboard/src/components/runs/ProjectRunPanel.jsx`)
- **File:** `dashboard/src/components/runs/ProjectRunPanel.jsx`
- **Action:** CREATE
- **Content:** সম্পূর্ণ রান প্যানেল তৈরি করো যাতে থাকবে:
  1. লোকেশন হেডার কার্ড (রুট পাথ, কারেন্ট ওয়ার্কিং ডিরেক্টরি সিলেক্টর, কপি পাথ, কপি cd বাটন)।
  2. ক্যাটাগরি ফিল্টার ট্যাব (`All`, `Dev`, `Test`, `Build`, `Ledger / Checkpoint`, `Custom`)।
  3. রান কমান্ড কার্ডসের গ্রিড।
  4. কাস্টম কমান্ড যোগ করার মডাল/ডায়লগ।
- **Done-check:** `test -f dashboard/src/components/runs/ProjectRunPanel.jsx`
- **Depends:** Step 39.6

---

### Step 39.8 — ProjectGrid-এ রান প্যানেল ও ককপিট উইজেট ইন্টিগ্রেট করা (`dashboard/src/components/ProjectGrid.jsx`)
- **File:** `dashboard/src/components/ProjectGrid.jsx`
- **Action:** EDIT
- **Content:** `ProjectGrid.jsx`-এর ট্যাব বারে "Run & Commands" (⚡) ট্যাব যোগ করো এবং ককপিট ভিউতে প্রাইমারি ডেভ ও টেস্ট কমান্ডের একটি কুইক কপি উইজেট যোগ করো।
- **Done-check:** `grep -q "ProjectRunPanel" dashboard/src/components/ProjectGrid.jsx`
- **Depends:** Step 39.7

---

### Step 39.9 — CLI রান কমান্ড তৈরি ও রাউটারে রেজিস্টার করা (`packages/cli/cmd-run.js`)
- **File:** `packages/cli/cmd-run.js`
- **Action:** CREATE
- **Content:** `./l run` কমান্ড তৈরি করো যা প্রজেক্টের লোকেশন ও কমান্ডসমূহ সুন্দর কালারফুল টার্মিনাল টেবিলে ডিসপ্লে করবে এবং `./l run <name>` দিয়ে নির্দিষ্ট কমান্ড সরাসরি সঠিক ডিরেক্টরিতে রান করবে। `packages/cli/index.js`-এ কমান্ডটি রেজিস্টার করো।
- **Done-check:** `node -c packages/cli/cmd-run.js && node -c packages/cli/index.js`
- **Depends:** Step 39.2

---

### Step 39.10 — রান কনফিগ ও CLI রানের অটোমেটেড টেস্ট লেখা (`tests/run-config.bats`)
- **File:** `tests/run-config.bats`
- **Action:** CREATE
- **Content:** BATS টেস্ট তৈরি করো যা প্রজেক্টের রান কনফিগ ডিটেকশন, লোকেশন পাথ এবং `./l run` কমান্ড সফলভাবে ভ্যালিডেট করবে।
- **Done-check:** `bats tests/run-config.bats`
- **Depends:** Step 39.9
