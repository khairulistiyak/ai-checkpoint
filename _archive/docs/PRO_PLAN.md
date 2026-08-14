# AI-Checkpoint — Pro-Level Plan (v1.1 Roadmap)

> লক্ষ্য: ai-checkpoint-কে একটা শখের স্ক্রিপ্ট থেকে **production-grade, publishable developer tool**-এ নেওয়া — যেটা যেকোনো AI-assisted প্রজেক্টে drop-in করা যায়, এবং **আকদম ছোট free-tier মডেলও ১০০% নির্ভুলভাবে follow করতে পারে**।

---

## RULE 0 — Micro-File Monorepo Rule (সব প্রজেক্টে বাধ্যতামূলক)

> ছোট মডেলের context ছোট। তাই কাজের একক-ও ছোট হতে হবে। বড় ফাইল = hallucination-এর কারখানা।

### ফাইলের নিয়ম
1. **এক ফাইল = এক কাজ।** একটা ফাইল একটাই জিনিস করবে (একটা component, একটা util, একটা config)।
2. **Max 150 lines per file.** পার হলে ফাইল ভাঙো — এটা suggestion না, hard limit।
3. **Max 1 ফাইল per step.** একটা step-এ AI একটা ফাইলই বানাবে/বদলাবে। দুইটা লাগলে দুইটা step।
4. **নাম দেখেই কাজ বোঝা যাবে।** `utils.js` নিষিদ্ধ → `format-date.js`, `parse-schema.js`।

### Monorepo layout (প্রতিটা প্রজেক্ট এই ছাঁচে)
```
project/
├── .agents/              ← system files (PROGRESS, RULES, AGENTS)
├── plan/                 ← atomic step plans
├── packages/
│   ├── core/             ← একেকটা module = একেকটা ছোট ফোল্ডার
│   │   ├── index.js      ← শুধু export জোড়া লাগায় (barrel)
│   │   ├── state.js      ← ≤150 lines
│   │   └── events.js     ← ≤150 lines
│   ├── ui/
│   └── utils/
└── package.json
```
- Module-এর ভেতরের ফাইল বাইরে থেকে সরাসরি import নিষিদ্ধ — শুধু `index.js` দিয়ে।
- নতুন feature = নতুন ছোট ফোল্ডার, পুরনো বড় ফাইলে ঢোকানো না।

### কেন এটা কাজ করে (ছোট মডেলের জন্য)
- ছোট ফাইল → পুরো ফাইল মডেলের context-এ ধরে → guess করতে হয় না
- ছোট diff → gate/validate fail করলে error খুঁজে পাওয়া সহজ
- barrel import → মডেলকে পুরো repo-র path মুখস্থ রাখতে হয় না

---

## RULE 1 — Atomic Step Format (plan লেখার বাধ্যতামূলক ছাঁচ)

> ১০০০% নির্ভুলতার রহস্য: মডেলকে **চিন্তা করার সুযোগই না দেওয়া**। প্রতিটা step এমন হবে যেন copy-paste-verify ছাড়া কিছু করার নেই।

প্রতিটা `plan/*.md`-এর প্রতিটা step এই format-এ লিখতেই হবে:

```markdown
### Step 2.3 — Create date formatter
- **File:** `packages/utils/format-date.js`   (exact path, একটাই ফাইল)
- **Action:** CREATE                           (CREATE | EDIT | DELETE — এই ৩টাই)
- **Content:** [সম্পূর্ণ কোড এখানেই দেওয়া, অথবা এক-লাইনের অস্পষ্টতাহীন নির্দেশ]
- **Done-check:** `node -e "require('./packages/utils/format-date.js')"` → exit 0
- **Depends:** 2.2
```

### Plan লেখার নিষিদ্ধ শব্দ (ছোট মডেল এগুলোতে হারিয়ে যায়)
❌ "appropriately", "as needed", "properly", "etc.", "and so on", "refactor nicely"
✅ exact path, exact নাম, exact কমান্ড, exact expected output

### Step-এর ৫ শর্ত
1. এক step = এক ফাইল = এক action
2. প্রতিটা step-এ **Done-check** কমান্ড থাকবেই — যা চালিয়ে মডেল নিজেই pass/fail জানবে
3. Step পড়ে ২টা ভিন্ন কাজ বোঝা গেলে step টা ভুল — ভাঙো
4. Content হয় সম্পূর্ণ কোড, নয়তো এমন নির্দেশ যার একটাই অর্থ
5. Depends chain সোজা: 1.1 → 1.2 → 1.3 (branch করা plan ছোট মডেলের জন্য না)

---

## এখন যা আছে (Baseline)

- `setup.sh` — প্রজেক্টে সিস্টেম বসায়
- `templates/` — SYSTEM_GUIDE, PROGRESS, RULES, AGENTS templates
- `scripts/` — `./l` CLI (dashboard, start, complete, validate)
- `examples/`, `README.md`, LICENSE, social preview — publish-এর প্রস্তুতি

## Gap Analysis (Pro হতে যা যা নেই)

1. **Verification নেই** — `./l c` দিলে বিশ্বাসের ওপর complete হয়; কোনো gate/check নেই
2. **Rollback নেই** — খারাপ AI output হলে আগের ভালো state-এ ফেরার ব্যবস্থা নেই
3. **Micro-file rules নেই** — RULES.md-তে ফাইল সাইজ/মনোরিপো enforcement নেই
4. **Atomic step format নেই** — plan template এখনো free-form; ছোট মডেল ambiguity-তে ভুল করে
5. **Test/CI নেই** — CLI নিজেই untested; install friction আছে

---

## Phase 1 — Core Hardening

### Step 1.1 — CLI safety header
- **File:** `scripts/l`
- **Action:** EDIT — শুরুতে `set -euo pipefail`, সব path quote করা
- **Done-check:** `shellcheck scripts/l` → 0 error

### Step 1.2 — `./l doctor`
- **File:** `scripts/l`
- **Action:** EDIT — নতুন subcommand: `.agents/` আছে? PROGRESS.md parse হয়? git repo?
- **Done-check:** ঠিক প্রজেক্টে `./l doctor` → "OK", ভাঙা প্রজেক্টে → নির্দিষ্ট error + exit 1

### Step 1.3 — Real validate
- **File:** `scripts/l`
- **Action:** EDIT — `./l v`: প্রতিটা done step-এর ঘোষিত ফাইল exist করে কিনা + plan↔PROGRESS ID sync + **১৫০-লাইন limit ভাঙা ফাইল ধরা**
- **Done-check:** ইচ্ছা করে ২০০-লাইনের ফাইল বানিয়ে `./l v` → ঐ ফাইলের নাম+লাইন সংখ্যাসহ FAIL

## Phase 2 — Checkpoint & Rollback

### Step 2.1 — `./l cp save "msg"`
- git commit + annotated tag `aicp/<step>-<n>`; **`./l v` pass না হলে save reject**
### Step 2.2 — `./l cp list` / `./l cp back [tag]`
- rollback-এর আগে auto-stash — কখনো destructive না
- **Done-check:** ফাইল ভেঙে `./l cp back` → <10s-এ কাজের state ফেরত

## Phase 3 — Templates-এ Rules ঢোকানো (RULE 0 + RULE 1 বাস্তবায়ন)

### Step 3.1 — `templates/RULES.md` upgrade
- Micro-File Monorepo Rule (উপরের RULE 0 হুবহু) + protected paths ধারণা
### Step 3.2 — `templates/PLAN_TEMPLATE.md` (নতুন ফাইল)
- Atomic Step Format-এর ready ছাঁচ — user শুধু blank পূরণ করবে
### Step 3.3 — `templates/AGENTS.md` upgrade
- কঠোর loop: read PROGRESS → read RULES → **এক step-ই করো** → Done-check চালাও → `./l v` → `./l c`
- ২ বার fail হলে step টা BLOCKED লিখে থামো (guess করা নিষিদ্ধ)
### Step 3.4 — `./l new-plan <name>`
- PLAN_TEMPLATE কপি করে `plan/<name>.md` বানায় — format কখনো হাতে লেখা লাগবে না
- **Phase exit-check:** free-tier মডেলকে শুধু templates দিয়ে toy project-এ ছাড়া → human help ছাড়া ৩ step complete

## Phase 4 — DX & Distribution

- এক-কমান্ড install (`curl ... | sh` বা `npx ai-checkpoint init`), idempotent setup.sh
- `examples/`-এ micro-file monorepo-র সম্পূর্ণ walkthrough (আসল PROGRESS history সহ)
- shellcheck + bats test suite + GitHub Actions CI (macOS + Linux)
- README: 60-second quickstart + RULE 0/RULE 1-এর সারাংশ

## Phase 5 — Release

- Semantic versioning + CHANGELOG.md → `v1.0.0`
- ERD_v0.1-এ dogfood ১ সপ্তাহ — যা খচখচ করে আগে fix
- Publish: Show HN / r/LocalLLaMA (target: free-tier model users)

---

## Success Criteria (Pro-Level Bar)

1. নতুন প্রজেক্টে setup → প্রথম step complete পর্যন্ত **<5 মিনিট**
2. Validate fail করা কোনো step কখনো complete mark হয় না — ১৫০-লাইন rule সহ
3. যেকোনো মুহূর্তে এক কমান্ডে শেষ ভালো checkpoint-এ ফেরা যায়
4. **Atomic-format plan দিয়ে সবচেয়ে ছোট free মডেলও ambiguity ছাড়া step execute করতে পারে** (Phase 3 exit-check দিয়ে প্রমাণিত)
5. CLI-এর test coverage আছে, CI সবুজ; README পড়ে অচেনা কেউ ব্যবহার শুরু করতে পারে

## Priority Order

**Phase 1 → 2 আগে** (মূল promise), **তারপর Phase 3** (RULE 0/1 templates — ছোট মডেলের নির্ভুলতা এখানেই আসে), শেষে 4–5 (polish + release)। প্রতিটা phase নিজেই এই সিস্টেম আর এই Atomic Step Format দিয়ে track করো — dogfooding-ই সেরা QA।
