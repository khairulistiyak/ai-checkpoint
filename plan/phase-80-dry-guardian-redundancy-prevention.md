# Phase 80: Dynamic DRY Guardian — AI Code Redundancy Prevention Engine

> AI এজেন্ট এবং ডেভেলপারদের ডুপ্লিকেট ফাংশন লেখা প্রতিরোধ করতে **Ultra-Dynamic & Interactive DRY Guardian Engine** তৈরি করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 80: Dynamic DRY Guardian — AI Code Redundancy Prevention Engine

### Step 80.1 — Create Multi-Language Function Fingerprinter & Similarity Detector (`packages/core/duplicate-detector.js`)
- **File:** `packages/core/duplicate-detector.js`
- **Action:** CREATE
- **Depends:** None

**কী করতে হবে:**
1. `packages/core/duplicate-detector.js` তৈরি করো যা সব প্রোগ্রামিং ল্যাঙ্গুয়েজের ফাংশন ডায়নামিকালি এক্সট্র্যাক্ট করে ৩-লেয়ার ফিঙ্গারপ্রিন্টিং করবে:
   - **Exact Normalized Hash**: কমেন্ট, স্পেস, সেমিকোলন এবং ভ্যারিয়েবল ডেক্ল্যারেশন কিওয়ার্ড বাদে বডি হ্যাশ।
   - **Dynamic Token N-Gram / Jaccard Similarity**: প্যারামিটার বা লোকাল ভ্যারিয়েবল রিনেম করা হলেও কোডের লজিক্যাল স্ট্রাকচার মিল ($\ge 0.70$) ডিটেক্ট করবে।
   - **Identifier Fuzzy Distance**: লেভেনস্টাইন ও টোকেন-সেট ডিসট্যান্স দিয়ে প্রায় একই নামের ফাংশন (`walkCodeFiles` ↔ `walkFiles`) ডিটেক্ট করবে।
2. `detectDuplicates(projectPath, options)` ফাংশন এক্সপোর্ট করো যা ডাইনামিক থ্রেশহোল্ড (ডিফল্ট: 0.75), ফিল্টার এবং স্কোর ক্যালকুলেশন সাপোর্ট করে।
3. CommonJS ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f packages/core/duplicate-detector.js`

---

### Step 80.2 — Create Live Utility Registry & Fuzzy Search Engine (`packages/core/utility-index.js`)
- **File:** `packages/core/utility-index.js`
- **Action:** CREATE
- **Depends:** None

**কী করতে হবে:**
1. `packages/core/utility-index.js` তৈরি করো যা প্রজেক্টের সমস্ত এক্সপোর্টেড এবং ইন্টার্নাল হেল্পার ফাংশনের একটি লাইভ সার্চেবল ইনডেক্স তৈরি করবে।
2. `buildUtilityIndex(projectPath)` এবং `searchUtility(index, query, options)` এক্সপোর্ট করো।
3. ইনডেক্স মেটাডাটাতে থাকবে:
   - `name`, `file`, `line`, `exported`, `params`
   - `signature`: e.g. `walkCodeFiles(dir, options)`
   - `docSummary`: ফাংশনের উপরের কমেন্ট/ডকস্ট্র্রিং থেকে এক লাইনের সারাংশ
4. Fuzzy matching অ্যালগরিদম দিয়ে আংশিক বা সমার্থক শব্দ দিয়েও সার্চ সাপোর্ট করবে (যেমন: `date` লিখলে `formatTimestamp` বা `parseDate` খুঁজে পাবে)।
5. CommonJS ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f packages/core/utility-index.js`

---

### Step 80.3 — Create Dynamic Auto-Refactor Diff Generator (`packages/core/dry-refactor-engine.js`)
- **File:** `packages/core/dry-refactor-engine.js`
- **Action:** CREATE
- **Depends:** Step 80.1, Step 80.2

**কী করতে হবে:**
1. `packages/core/dry-refactor-engine.js` তৈরি করো যা ডুপ্লিকেট পেয়ার পাওয়ার পর স্বয়ংক্রিয়ভাবে **রেডি-টু-ইউজ রিফ্যাক্টরিং সলিউশন ও কোড ডিফ** তৈরি করবে:
   - প্রস্তাবিত নতুন সেন্ট্রাল ফাইলের পাথ (e.g. `packages/core/file-walker.js`)
   - সেন্ট্রাল ফাইলে রাখার মতো এক্সট্র্যাক্টেড কোড স্নsnippet
   - কলিং ফাইলগুলোর জন্য `import` বা `require()` স্টেটমেন্ট
2. `generateRefactorProposal(duplicatePair)` ফাংশন এক্সপোর্ট করো।
3. CommonJS ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f packages/core/dry-refactor-engine.js`

---

### Step 80.4 — Integrate Dynamic Duplicate Score into Quality Pipeline (`packages/core/quality-report.js`)
- **File:** `packages/core/quality-report.js`
- **Action:** EDIT
- **Depends:** Step 80.1

**কী করতে হবে:**
1. `packages/core/quality-report.js`-এ `duplicate-detector.js` থেকে `detectDuplicates` ইমপোর্ট করো।
2. কোয়ালিটি স্কোরে ডাইনামিক পেনাল্টি ম্যাট্রিক্স যুক্ত করো:
   - Exact duplicate pair: -5 per pair
   - Near duplicate pair ($\ge 75\%$): -3 per pair
   - Name-similar pair: -1 per pair
3. কোয়ালিটি রিপোর্টের `breakdown`-এ `duplicateIssues`, `dryScore` এবং `issues`-এ ডুপ্লিকেট রিফ্যাক্টর সাজেশন যুক্ত করো।
4. CommonJS ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `node -e "const { generateQualityReport } = require('./packages/core/quality-report.js'); console.log(typeof generateQualityReport);"` → `function`

---

### Step 80.5 — Add DRY-004 Code Reuse RFC Rule (`packages/core/rfc-rules.js`)
- **File:** `packages/core/rfc-rules.js`
- **Action:** EDIT
- **Depends:** Step 80.1

**কী করতে হবে:**
1. `RFC_DEFINITIONS`-এ যুক্ত করো:
   - `DRY-004`: `{ title: 'Code Reuse & Redundancy Guard', desc: 'Zero duplicate function bodies across workspace modules' }`
2. `evaluateRfcCompliance` ফাংশনে `detectDuplicates(projectPath)` রান করে `DRY-004` স্পেক্স ও লাইভ ডিটেইলস রিটার্ন করো।
3. CommonJS ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `node -e "const { evaluateRfcCompliance } = require('./packages/core/rfc-rules.js'); console.log(typeof evaluateRfcCompliance);"` → `function`

---

### Step 80.6 — Export Dynamic DRY Engine from Core Barrel (`packages/core/index.js`)
- **File:** `packages/core/index.js`
- **Action:** EDIT
- **Depends:** Step 80.1, Step 80.2, Step 80.3

**কী করতে হবে:**
1. `packages/core/index.js` ব্যারেলে `detectDuplicates`, `buildUtilityIndex`, `searchUtility`, এবং `generateRefactorProposal` এক্সপোর্ট করো।
2. CommonJS ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `node -e "const core = require('./packages/core/index.js'); console.log(typeof core.detectDuplicates);"` → `function`

---

### Step 80.7 — Create Dynamic DRY & Utility CLI Command (`packages/cli/cmd-dry.js`)
- **File:** `packages/cli/cmd-dry.js`
- **Action:** CREATE
- **Depends:** Step 80.6

**কী করতে হবে:**
1. `packages/cli/cmd-dry.js` তৈরি করো যাতে থাকবে:
   - `./l dry` — ফুল প্রজেক্ট ডুপ্লিকেট স্ক্যান ও ইন্টারেক্টিভ স্কোরবোর্ড
   - `./l dry --diff` — ডুপ্লিকেট কোডগুলোর এক্সট্র্যাকশন ও রিফ্যাক্টর ডিফ প্রদর্শন
   - `./l dry --threshold 80` — কাস্টম সিমিলারিটি থ্রেশহোল্ড
   - `./l utils [query]` — লাইভ ইউটিলিটি সার্চ (প্যারামিটার ও ফাইল লোকেশন সহ)
   - `--json` ফ্ল্যাগ সাপোর্ট
2. টার্মিনালে সুন্দর অ্যাপল স্টাইল ফরম্যাট (প্রগ্রেস বার, ম্যাচিং রেট %, ক্লিয়ার ফাইল লোকেশন)।
3. CommonJS ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f packages/cli/cmd-dry.js`

---

### Step 80.8 — Register Dynamic DRY Command in CLI Router (`packages/cli/index.js`)
- **File:** `packages/cli/index.js`
- **Action:** EDIT
- **Depends:** Step 80.7

**কী করতে হবে:**
1. `packages/cli/index.js`-এ `cmd-dry.js` থেকে `dryCommand` এবং `utilsCommand` ইমপোর্ট করো।
2. CLI রাউটারে `dry`, `duplicates`, `utils` কমান্ড মাউন্ট করো এবং `showHelp()` এ যুক্ত করো।
3. CommonJS ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `node ./packages/cli/index.js --help`

---

### Step 80.9 — Create Dashboard Server Dynamic DRY & Refactor Handlers (`dashboard/src/server/dry-analysis.js`)
- **File:** `dashboard/src/server/dry-analysis.js`
- **Action:** CREATE
- **Depends:** Step 80.6

**কী করতে হবে:**
1. `dashboard/src/server/dry-analysis.js` তৈরি করো যাতে থাকবে:
   - `handleGetDryAnalysis(req, res)`: ডাইনামিক কোয়েরি প্যারাম (`threshold`, `minLines`) সহ `detectDuplicates` কল করবে।
   - `handleGetUtilityIndex(req, res)`: লাইভ সার্চ কুয়েরি সহ `searchUtility` / `buildUtilityIndex` কল করবে।
   - `handleGetRefactorProposal(req, res)`: ডুপ্লিকেট পেয়ারের জন্য অটোমেটেড রিফ্যাক্টর ডিফ জেনারেট করবে।
2. `createRequire` দিয়ে core মডিউল সেফলি কল করো।
3. ESM ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/server/dry-analysis.js`

---

### Step 80.10 — Mount DRY Analysis & Refactor Routes (`dashboard/src/server/projects.js`)
- **File:** `dashboard/src/server/projects.js`
- **Action:** EDIT
- **Depends:** Step 80.9

**কী করতে হবে:**
1. `projects.js`-এ `dry-analysis.js` থেকে হ্যান্ডলারগুলো ইমপোর্ট করো।
2. `GET /:id/dry-analysis`, `GET /:id/utility-index`, এবং `POST /:id/refactor-proposal` মাউন্ট করো।
3. ESM ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/server/projects.js`

---

### Step 80.11 — Add Dynamic DRY Client API Functions (`dashboard/src/utils/api.js`)
- **File:** `dashboard/src/utils/api.js`
- **Action:** EDIT
- **Depends:** Step 80.10

**কী করতে হবে:**
1. `dashboard/src/utils/api.js`-এ যোগ করো:
   - `fetchDryAnalysis(id, params)`
   - `fetchUtilityIndex(id, query)`
   - `fetchRefactorProposal(id, pairData)`
2. ESM ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/utils/api.js`

---

### Step 80.12 — Create Dynamic DRY Guardian Dashboard Panel (`dashboard/src/components/health/DryGuardianPanel.jsx`)
- **File:** `dashboard/src/components/health/DryGuardianPanel.jsx`
- **Action:** CREATE
- **Depends:** Step 80.11

**কী করতে হবে:**
1. `DryGuardianPanel.jsx` তৈরি করো যাতে থাকবে:
   - **Dynamic Sensitivity Slider (50% – 100%)**: লাইভ ড্র্যাগ করে সিমিলারিটি থ্রেশহোল্ড অ্যাডজাস্ট করা যাবে।
   - **Interactive Comparator Card**: ফাইল A ↔ ফাইল B এর কোড সাইড-বাই-সাইড কম্প্যার করা এবং মিলের লাইন হাইলাইট করা।
   - **One-Click Refactor Code Generator**: "Generate Shared Utility Code" বাটনে ক্লিক করলে রেডি-টু-ইউজ ফাইল স্নsnippet এবং ইমপোর্ট কোড প্রোভাইড করবে (কপি বাটন সহ)।
   - **Live Utility Explorer**: সার্চ ফিল্টার যেখানে প্রজেক্টের সমস্ত ফাংশন ইনস্ট্যান্ট সার্চ করা যাবে।
2. সম্পূর্ণ Apple Studio Dark Monochrome থিমে তৈরি করো (০টি ইমোজি, ক্লিন Lucide আইকন)।
3. ESM/React ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/components/health/DryGuardianPanel.jsx`

---

### Step 80.13 — Mount Dry Guardian Panel into Health Command Center (`dashboard/src/components/HealthCommandCenter.jsx`)
- **File:** `dashboard/src/components/HealthCommandCenter.jsx`
- **Action:** EDIT
- **Depends:** Step 80.12

**কী করতে হবে:**
1. `HealthCommandCenter.jsx`-এ `DryGuardianPanel` ইমপোর্ট করো।
2. Health & Quality Fortress ভিউতে DRY Guardian সেকশন এম্বেড করো।
3. ESM/React ব্যবহার করো এবং ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f dashboard/src/components/HealthCommandCenter.jsx`

---

### Step 80.14 — Update RULES.md Template with Dynamic DRY Policy (`templates/RULES.md` & `.agents/RULES.md`)
- **File:** `.agents/RULES.md`
- **Action:** EDIT
- **Depends:** None

**কী করতে হবে:**
1. `.agents/RULES.md` এবং `templates/RULES.md`-এ **RULE 5 — Dynamic DRY & Utility Reuse Protocol** যুক্ত করো:
   - "Before writing any new helper function, check existing utilities via `./l utils <keyword>`"
   - "Duplicate function bodies are strictly prohibited (enforced via `./l dry` and `./l health`)"
   - "Shared logic across 2+ files must be extracted to a dedicated canonical module in `packages/core/` or `utils/`"
2. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `test -f .agents/RULES.md`

---

### Step 80.15 — Full Dynamic Suite Verification (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 80.1 to Step 80.14

**কী করতে হবে:**
```bash
find . -name "._*" -delete 2>/dev/null || true
./l v
./l health
./l quality
./l dry
./l utils walk
npm --prefix dashboard run build
```

- **Done-check:** exit code 0 for all validation commands
