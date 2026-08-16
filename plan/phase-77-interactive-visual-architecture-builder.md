# Phase 77: Interactive Visual Architecture Builder & Smart Stack Detector

> প্রজেক্ট সেটিংসে অটোমেটিক স্ট্যাক ডিটেকশন (React, Node, Python, Rust), ভিজুয়াল আর্কিটেকচার রুল বিল্ডার (Clean Architecture, Rule 0 Slider, Module Guardrails), এবং লাইভ মার্কডাউন জেনারেটর যুক্ত করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 77: Interactive Visual Architecture Builder & Smart Stack Detector

### Step 77.1 — Create Smart Stack Auto-Detector Backend (`dashboard/src/server/stack-detector.js`)
- **File:** `dashboard/src/server/stack-detector.js`
- **Action:** CREATE
- **Depends:** None

**কী করতে হবে:**
1. `dashboard/src/server/stack-detector.js` তৈরি করো যা প্রজেক্ট রুট স্ক্যান করে স্ট্যাক ডিটেক্ট করবে (`package.json`, `Cargo.toml`, `requirements.txt`, `go.mod` ইত্যাদি)।
2. ডিটেক্টেড স্ট্যাক অনুযায়ী রেকমেন্ডেড আর্কিটেকচার ও রুলস রিটার্ন করবে।
3. `projects.js`-এ `GET /:id/stack` রুট যুক্ত করো।
4. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/server/stack-detector.js`

---

### Step 77.2 — Create Interactive Visual Rule Builder Component (`dashboard/src/components/config/VisualRuleBuilder.jsx`)
- **File:** `dashboard/src/components/config/VisualRuleBuilder.jsx`
- **Action:** CREATE
- **Depends:** Step 77.1

**কী করতে হবে:**
1. `VisualRuleBuilder.jsx` তৈরি করো যা ভিজুয়াল টগল ও অপশন দিয়ে রুলস কনফিগার করবে:
   - Architecture Pattern (Clean Architecture, Strict Monorepo, Clean Backend, React/UI, Python/ML)
   - Max Line Limit (100, 150, 200 lines)
   - Module Boundaries (CJS/ESM split, Strict ESM, Strict CJS)
   - Guardrails Checklist (No debug console.log, No any types, Strict imports)
2. স্টেট পরিবর্তনের সাথে সাথে স্বয়ংক্রিয়ভাবে স্ট্যান্ডার্ড মার্কডাউন জেনারেট করে প্যারেন্টকে পাঠাবে।
3. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/components/config/VisualRuleBuilder.jsx`

---

### Step 77.3 — Integrate Visual Builder & Stack Badge in Settings Tabs (`dashboard/src/components/config/ProjectSettingsTabs.jsx`)
- **File:** `dashboard/src/components/config/ProjectSettingsTabs.jsx`
- **Action:** MODIFY
- **Depends:** Step 77.2

**কী করতে হবে:**
1. `ProjectSettingsTabs.jsx`-এর `RulesTab`-এ `Visual Builder` এবং `Raw Markdown` মোড সুইচ করার টগল যোগ করো।
2. অটো-ডিটেক্টেড স্ট্যাকের ব্যাজ ও রেকমেন্ডেশন শো করো।
3. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/components/config/ProjectSettingsTabs.jsx`

---

### Step 77.4 — Connect Stack Detection API & Live Sync in Frontend (`dashboard/src/utils/api.js`)
- **File:** `dashboard/src/utils/api.js`
- **Action:** MODIFY
- **Depends:** Step 77.3

**কী করতে হবে:**
1. `dashboard/src/utils/api.js`-এ `fetchProjectStack` ফাংশন যোগ করো।
2. `ConfigEditor.jsx`-এ প্রজেক্ট ওপেনের সাথে সাথে স্ট্যাক লোড করে ভিজুয়াল বিল্ডারে পাস করো।
3. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/utils/api.js`

---

### Step 77.5 — Full Verification & Build Suite (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 77.1, Step 77.2, Step 77.3, Step 77.4

**কী করতে হবে:**
```bash
find . -name "._*" -delete 2>/dev/null || true
./l v
./l health
npm --prefix dashboard run build
```

- **Done-check:** exit code 0 for all validation commands
