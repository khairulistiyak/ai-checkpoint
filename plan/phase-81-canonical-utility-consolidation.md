# Phase 81: Canonical Architecture & Total Codebase Consolidation

> কোডবেসের সমস্ত ডুপ্লিকেট ফাংশন, কনস্ট্যান্ট এবং ইউটিলিটি একটি সেন্ট্রাল ক্যানোনিকাল লেয়ারে কনসোলিডেট করা।

---

## Evidence: Duplicate Audit Report

আমাদের `packages/core/` ডিরেক্টরিতে এই মুহূর্তে নিম্নলিখিত ডুপ্লিকেশন বিদ্যমান:

### ৮টি ডুপ্লিকেট File Walker ফাংশন:
| ফাংশন | ফাইল | লাইন |
|---|---|---|
| `walkCode()` | `code-hygiene.js` | 7 |
| `walkCode()` | `complexity-analyzer.js` | 7 |
| `walkCode()` | `hygiene-fixer.js` | 7 |
| `walkCodeFiles()` | `naming-checker.js` | 7 |
| `walkCodeFiles()` | `circular-dep-detector.js` | 24 |
| `walkCodeFiles()` | `security-scanner.js` | 17 |
| `walkAll()` | `structure-analyzer.js` | 18 |
| `walkFiles()` | `workspace-scanner.js` | 10 |

### ৮টি ডুপ্লিকেট SKIP/SKIP_DIRS অ্যারে:
| ফাইল | ভ্যালু |
|---|---|
| `code-hygiene.js` | `SKIP = [... 'marketing', ...]` |
| `complexity-analyzer.js` | `SKIP = [... 'marketing', 'tests', ...]` |
| `hygiene-fixer.js` | `SKIP = [... 'marketing', ...]` |
| `naming-checker.js` | `SKIP = [... 'tests', ...]` |
| `structure-analyzer.js` | `SKIP = [... 'tests', ...]` |
| `circular-dep-detector.js` | `SKIP_DIRS = [... 'tests', ...]` |
| `security-scanner.js` | `SKIP_DIRS = [... ...]` |
| `workspace-scanner.js` | `SKIP_DIRS = [... '.vscode', 'vendor', ...]` |

> সবগুলো প্রায় একই — কিন্তু সামান্য ভিন্ন! এটিই বাগ ড্রিফটের মূল কারণ।

### ৭টি ডুপ্লিকেট CODE_EXTS অ্যারে:
- `code-hygiene.js`, `complexity-analyzer.js`, `hygiene-fixer.js`, `naming-checker.js`, `circular-dep-detector.js`, `security-scanner.js`, `workspace-scanner.js`

### ২টি ডুপ্লিকেট Syntax Utilities (workspace-scanner ↔ syntax-checker):
- `checkBalanced()` — ২টি কপি
- `getEsbuild()` — ২টি কপি
- `checkImports()` / `checkImportTargets()` — ২টি কপি

---

## Architecture: Consolidation Strategy

```
BEFORE (Fragmented):                     AFTER (Canonical):
                                         
code-hygiene.js    → walkCode + SKIP     ┌─────────────────────────────┐
complexity.js      → walkCode + SKIP     │  scan-constants.js          │
hygiene-fixer.js   → walkCode + SKIP     │  (SKIP_DIRS, CODE_EXTS,     │
naming-checker.js  → walkCodeFiles+SKIP  │   SCAN_EXTS, JUNK_FILES)    │
circular-dep.js    → walkCodeFiles+SKIP  └──────────┬──────────────────┘
security-scanner   → walkCodeFiles+SKIP             │
structure-analyzer → walkAll + SKIP      ┌──────────▼──────────────────┐
workspace-scanner  → walkFiles + SKIP    │  file-walker.js             │
                                         │  (walkCodeFiles, walkAll)   │
syntax-checker.js ──┐                    └──────────┬──────────────────┘
workspace-scanner ──┤ checkBalanced                 │
                    ├ getEsbuild         ┌──────────▼──────────────────┐
                    └ checkImports       │  syntax-utils.js            │
                                         │  (checkBalanced, getEsbuild,│
                                         │   checkImportTargets)       │
                                         └────────────────────────────┘
```

---

## Phase 81: Canonical Architecture & Total Codebase Consolidation

---

### Step 81.1 — Create Canonical Scan Constants (`packages/core/scan-constants.js`)
- **File:** `packages/core/scan-constants.js`
- **Action:** CREATE
- **Depends:** None

**কী করতে হবে:**
1. `packages/core/scan-constants.js` তৈরি করো যা **একটিমাত্র সত্যের উৎস (Single Source of Truth)** হিসেবে কোডবেসের সমস্ত স্ক্যানিং কনস্ট্যান্ট এক্সপোর্ট করবে:
   - `SKIP_DIRS`: `['node_modules', '.git', 'dist', 'build', 'release', '.agents', 'plan', '.vscode', '.github', '_archive', 'vendor', 'marketing', 'tests']`
   - `CODE_EXTS`: সব ভাষা সাপোর্ট সহ `['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts', '.php', '.py', '.rs', '.go', '.dart', '.java', '.c', '.cpp', '.h', '.rb', '.swift', '.kt', '.cs', '.vue', '.svelte']`
   - `JS_EXTS`: শুধু JS/TS → `['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts']`
   - `SCAN_EXTS`: `[...CODE_EXTS, '.json', '.css', '.sh', '.yaml', '.yml', '.toml', '.sql']`
   - `JUNK_FILES`: `.DS_Store`, `Thumbs.db`, `npm-debug.log` ইত্যাদি
   - `JUNK_PATTERNS`: `/^\._/`, `/\.bak$/i`, `/\.swp$/i` ইত্যাদি
2. CommonJS (`require` / `module.exports`) ব্যবহার করো।
3. ১৫০ লাইনের নিচে রাখো (Rule 0)।

- **Done-check:** `node -e "const c = require('./packages/core/scan-constants.js'); console.log(c.SKIP_DIRS.length > 5 && c.CODE_EXTS.length > 10);"` → `true`

---

### Step 81.2 — Create Canonical File Walker (`packages/core/file-walker.js`)
- **File:** `packages/core/file-walker.js`
- **Action:** CREATE
- **Depends:** Step 81.1

**কী করতে হবে:**
1. `packages/core/file-walker.js` তৈরি করো যা **৮টি ডুপ্লিকেট ওয়াকারের** সবকটি ব্যবহারের ক্ষেত্র কভার করবে:
   - `walkCodeFiles(dir, options)` → কোড ফাইল স্ক্যান (ডিফল্ট `JS_EXTS`, অপশনাল `CODE_EXTS`)
     - `options.extensions`: কাস্টম এক্সটেনশন অ্যারে (ডিফল্ট: `JS_EXTS`)
     - `options.skipDirs`: কাস্টম স্কিপ (ডিফল্ট: `SKIP_DIRS`)
     - `options.withMeta`: `true` হলে `{ path, name, ext, size }` রিটার্ন, `false` হলে শুধু পাথ
     - `options.maxDepth`: ডিরেক্টরি গভীরতা সীমা (ডিফল্ট: Infinity)
   - `walkAllFiles(dir, options)` → সব ধরনের ফাইল স্ক্যান (structure-analyzer এর `walkAll` এর বিকল্প)
     - `options.withDepth`: `true` হলে depth ট্র্যাক করে
2. `scan-constants.js` থেকে ডিফল্ট ইমপোর্ট করো।
3. CommonJS ব্যবহার করো। ১৫০ লাইনের নিচে।

- **Done-check:** `node -e "const { walkCodeFiles } = require('./packages/core/file-walker.js'); console.log(typeof walkCodeFiles);"` → `function`

---

### Step 81.3 — Create Canonical Syntax Utilities (`packages/core/syntax-utils.js`)
- **File:** `packages/core/syntax-utils.js`
- **Action:** CREATE
- **Depends:** None

**কী করতে হবে:**
1. `packages/core/syntax-utils.js` তৈরি করো যা `workspace-scanner.js` ও `syntax-checker.js` উভয়ের **৩টি ডুপ্লিকেট ইউটিলিটি** একীভূত করবে:
   - `checkBalanced(content, openChars, closeChars, label)` — ব্র্যাকেট ব্যালান্স চেকার
   - `getEsbuild()` — ক্যাশড esbuild লোডার
   - `checkImportTargets(filePath)` — রিলেটিভ ইমপোর্ট ভ্যালিডেটর
2. CommonJS ব্যবহার করো। ১৫০ লাইনের নিচে।

- **Done-check:** `node -e "const s = require('./packages/core/syntax-utils.js'); console.log(typeof s.checkBalanced, typeof s.getEsbuild, typeof s.checkImportTargets);"` → `function function function`

---

### Step 81.4 — Refactor `workspace-scanner.js` to Use Canonical Modules
- **File:** `packages/core/workspace-scanner.js`
- **Action:** EDIT
- **Depends:** Step 81.1, Step 81.2, Step 81.3

**কী করতে হবে:**
1. `workspace-scanner.js` থেকে নিজস্ব `walkFiles`, `SKIP_DIRS`, `CODE_EXTS`, `SCAN_EXTS`, `checkBalanced`, `getEsbuild`, `checkImports` সব মুছে দাও।
2. এর বদলে ইমপোর্ট করো:
   - `scan-constants.js` থেকে `SKIP_DIRS`, `CODE_EXTS`, `SCAN_EXTS`
   - `file-walker.js` থেকে `walkCodeFiles`
   - `syntax-utils.js` থেকে `checkBalanced`, `getEsbuild`, `checkImportTargets`
3. পাবলিক API (`scanWorkspace`, `walkFiles`, `countEffectiveLines`, `checkImports`) অক্ষুণ্ণ রাখো (backward compatible)।
4. CommonJS ব্যবহার করো। ১৫০ লাইনের নিচে।

- **Done-check:** `node -e "const { scanWorkspace } = require('./packages/core/workspace-scanner.js'); console.log(typeof scanWorkspace);"` → `function`

---

### Step 81.5 — Refactor `code-hygiene.js`, `complexity-analyzer.js`, `hygiene-fixer.js`
- **File:** `packages/core/code-hygiene.js`
- **Action:** EDIT
- **Depends:** Step 81.1, Step 81.2

**কী করতে হবে:**
1. তিনটি ফাইল থেকে লোকাল `walkCode()`, `SKIP`, `CODE_EXTS` মুছে দাও।
2. এর বদলে `file-walker.js` থেকে `walkCodeFiles` ইমপোর্ট করো এবং প্রয়োজনে `{ withMeta: true }` অপশন পাস করো।
3. প্রতিটি ফাইলের পাবলিক API (`scanHygiene`, `analyzeComplexity`, `fixHygiene`) অক্ষুণ্ণ রাখো।
4. CommonJS ব্যবহার করো। প্রতিটি ফাইল ১৫০ লাইনের নিচে।

- **Done-check:** `node -e "const { scanHygiene } = require('./packages/core/code-hygiene.js'); const { analyzeComplexity } = require('./packages/core/complexity-analyzer.js'); const { fixHygiene } = require('./packages/core/hygiene-fixer.js'); console.log('ok');"` → `ok`

---

### Step 81.6 — Refactor `naming-checker.js`, `security-scanner.js`, `circular-dep-detector.js`
- **File:** `packages/core/naming-checker.js`
- **Action:** EDIT
- **Depends:** Step 81.1, Step 81.2

**কী করতে হবে:**
1. তিনটি ফাইল থেকে লোকাল `walkCodeFiles()`, `SKIP`/`SKIP_DIRS`, `CODE_EXTS` মুছে দাও।
2. `file-walker.js` এবং `scan-constants.js` থেকে ইমপোর্ট করো।
3. পাবলিক API (`checkNaming`, `scanSecurity`, `detectCircularDeps`) অক্ষুণ্ণ রাখো।
4. CommonJS ব্যবহার করো। প্রতিটি ফাইল ১৫০ লাইনের নিচে।

- **Done-check:** `node -e "const { checkNaming } = require('./packages/core/naming-checker.js'); const { scanSecurity } = require('./packages/core/security-scanner.js'); const { detectCircularDeps } = require('./packages/core/circular-dep-detector.js'); console.log('ok');"` → `ok`

---

### Step 81.7 — Refactor `structure-analyzer.js` to Use Canonical Walker
- **File:** `packages/core/structure-analyzer.js`
- **Action:** EDIT
- **Depends:** Step 81.1, Step 81.2

**কী করতে হবে:**
1. `structure-analyzer.js` থেকে লোকাল `walkAll()`, `SKIP`, `JUNK_FILES`, `JUNK_PATTERNS` মুছে দাও।
2. `file-walker.js` থেকে `walkAllFiles({ withDepth: true })` এবং `scan-constants.js` থেকে `JUNK_FILES`, `JUNK_PATTERNS` ইমপোর্ট করো।
3. পাবলিক API (`analyzeStructure`) অক্ষুণ্ণ রাখো।
4. CommonJS ব্যবহার করো। ১৫০ লাইনের নিচে।

- **Done-check:** `node -e "const { analyzeStructure } = require('./packages/core/structure-analyzer.js'); console.log(typeof analyzeStructure);"` → `function`

---

### Step 81.8 — Refactor `syntax-checker.js` (CLI) to Use Canonical Syntax Utils
- **File:** `packages/cli/syntax-checker.js`
- **Action:** EDIT
- **Depends:** Step 81.3

**কী করতে হবে:**
1. `syntax-checker.js` থেকে লোকাল `checkBalanced()`, `getEsbuild()`, `checkImportTargets()` মুছে দাও।
2. `packages/core/syntax-utils.js` থেকে ইমপোর্ট করো।
3. পাবলিক API (`syntaxCheck`, `checkImportTargets`, `checkBalanced`) backward-compatible re-export রাখো।
4. CommonJS ব্যবহার করো। ১৫০ লাইনের নিচে।

- **Done-check:** `node -e "const { syntaxCheck } = require('./packages/cli/syntax-checker.js'); console.log(typeof syntaxCheck);"` → `function`

---

### Step 81.9 — Update Core Barrel & SYSTEM_GUIDE.md
- **File:** `packages/core/index.js`
- **Action:** EDIT
- **Depends:** Step 81.1, Step 81.2, Step 81.3

**কী করতে হবে:**
1. `packages/core/index.js` ব্যারেলে নতুন ক্যানোনিকাল মডিউল এক্সপোর্ট যুক্ত করো:
   - `walkCodeFiles`, `walkAllFiles` from `file-walker.js`
   - `SKIP_DIRS`, `CODE_EXTS`, `JS_EXTS`, `SCAN_EXTS` from `scan-constants.js`
   - `checkBalanced`, `getEsbuild`, `checkImportTargets` from `syntax-utils.js`
2. `.agents/SYSTEM_GUIDE.md`-এ নতুন ক্যানোনিকাল মডিউলগুলো ডকুমেন্ট করো।
3. CommonJS ব্যবহার করো। ১৫০ লাইনের নিচে।

- **Done-check:** `node -e "const core = require('./packages/core/index.js'); console.log(typeof core.walkCodeFiles);"` → `function`

---

### Step 81.10 — Full Consolidation Verification & DRY Audit
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 81.1 to Step 81.9

**কী করতে হবে:**
```bash
find . -name "._*" -delete 2>/dev/null || true
./l v
./l health
./l quality
./l dry
npm --prefix dashboard run build
```

**যা প্রমাণ হতে হবে:**
- `./l health`: Score 100/100
- `./l dry`: পূর্বের ৮+ ডুপ্লিকেট ওয়াকার এবং ৮+ ডুপ্লিকেট কনস্ট্যান্ট শূন্যে নেমে আসবে
- `npm run build`: ত্রুটিহীন

- **Done-check:** exit code 0 for all validation commands
