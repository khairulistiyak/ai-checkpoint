# Phase 78: World-Class Architecture RFC Specification & Live Compliance Engine

> বিশ্বমানের ফর্ম্যালাইজড RFC রুল কোড সিস্টেম (`RULE-000`, `ARCH-001`, `MOD-002`, `TEST-003`), লাইভ আর্কিটেকচার কমপ্লায়েন্স রেডার এবং ডিপেনডেন্সি ফ্লো ব্লুপ্রিন্ট তৈরি করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 78: World-Class Architecture RFC Specification & Live Compliance Engine

### Step 78.1 — Create Formal RFC Rule Specification Engine (`packages/core/rfc-rules.js`)
- **File:** `packages/core/rfc-rules.js`
- **Action:** CREATE
- **Depends:** None

**কী করতে হবে:**
1. `packages/core/rfc-rules.js` তৈরি করো যা প্রজেক্টের প্রতিটি ফাইলকে ৪টি ফর্ম্যাল RFC স্ট্যান্ডার্ড অনুযায়ী বিশ্লেষণ করবে:
   - `RULE-000`: File Granularity Guard (effective lines <= limit)
   - `ARCH-001`: Core Domain Isolation (zero UI/DB imports in domain)
   - `MOD-002`: Module Boundary Guard (no require in ESM / no import in CJS)
   - `TEST-003`: Deterministic Gate (syntax check + test verification)
2. `evaluateRfcCompliance(projectPath, options)` ফাংশন এক্সপোর্ট করো যা কমপ্লায়েন্স স্কোর ও ভায়োলেশন কোড রিটার্ন করবে।
3. CommonJS ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f packages/core/rfc-rules.js`

---

### Step 78.2 — Mount RFC Compliance API in Dashboard Backend (`dashboard/src/server/project-compliance.js`)
- **File:** `dashboard/src/server/project-compliance.js`
- **Action:** CREATE
- **Depends:** Step 78.1

**কী করতে হবে:**
1. `dashboard/src/server/project-compliance.js` তৈরি করো যা `evaluateRfcCompliance` কল করে `GET /api/projects/:id/compliance` রেসপন্স রিটার্ন করবে।
2. `projects.js`-এ এই এন্ডপয়েন্টটি মাউন্ট করো।
3. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/server/project-compliance.js`

---

### Step 78.3 — Create Live Architecture Compliance Radar & Blueprint (`dashboard/src/components/config/ArchitectureRadar.jsx`)
- **File:** `dashboard/src/components/config/ArchitectureRadar.jsx`
- **Action:** CREATE
- **Depends:** Step 78.2

**কী করতে হবে:**
1. `ArchitectureRadar.jsx` তৈরি করো যাতে থাকবে:
   - লাইভ কমপ্লায়েন্স পারসেন্টেজ মিটার (যেমন: 100% Compliance)
   - ৪টি RFC রুল কোডের স্ট্যাটাস ব্যাজ (`RULE-000`, `ARCH-001`, `MOD-002`, `TEST-003`)
   - ৩-লেয়ার ডিপেনডেন্সি ফ্লো ডায়াগ্রাম (`UI / Dashboard` ➔ `CLI / Adapters` ➔ `Core Domain`)
2. সম্পূর্ণ Apple Studio Monochrome স্টাইলে তৈরি করো (০টি ইমোজি, ক্লিন SVG আইকন)।
3. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/components/config/ArchitectureRadar.jsx`

---

### Step 78.4 — Integrate Architecture Radar into Settings Hub (`dashboard/src/components/config/ProjectSettingsTabs.jsx`)
- **File:** `dashboard/src/components/config/ProjectSettingsTabs.jsx`
- **Action:** MODIFY
- **Depends:** Step 78.3

**কী করতে হবে:**
1. `ProjectSettingsTabs.jsx`-এর General/Rules ট্যাবে `ArchitectureRadar` এম্বেড করো।
2. রিয়েল-টাইমে কমপ্লায়েন্স ডাটা ফেচ করে রেন্ডার করো।
3. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/components/config/ProjectSettingsTabs.jsx`

---

### Step 78.5 — Full Verification & Build Suite (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 78.1, Step 78.2, Step 78.3, Step 78.4

**কী করতে হবে:**
```bash
find . -name "._*" -delete 2>/dev/null || true
./l v
./l health
npm --prefix dashboard run build
```

- **Done-check:** exit code 0 for all validation commands
