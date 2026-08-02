# Add Date/Time Tracking to Dashboard UI

**Goal:** Plan creation date দেখাও + Step execute হওয়ার date/time UI-তে দেখাও
**Why:** এখন কোনো date নেই — কবে plan বানানো হয়েছে, কবে কোন step execute হয়েছে বোঝা যায় না
**Files:** parser.js, PlanCard.jsx, PlanModal.jsx, StepItem.jsx, PhaseView.jsx
**Risk:** Low
**Steps:** 6

## Story

1. আগে: Dashboard-এ plan আর steps দেখায়, কিন্তু কোনো date/time নেই
2. সমস্যা: কবে plan create হয়েছে জানা যায় না, কবে কোন step done হয়েছে দেখা যায় না
3. Fix: File stat থেকে plan date নেবো, PROGRESS.md log থেকে step execution time parse করবো
4. পরে: Plan card-এ "Created: Jul 28" দেখাবে, প্রতিটা done step-এ "Completed: Jul 30, 2:15 PM" দেখাবে

## Steps

### Step 26.1 — Parse plan file creation dates in server
- **File:** `dashboard/src/server/parser.js`
- **Do:** Plan files scan করার সময় file stat থেকে `birthtime`/`mtime` নিয়ে date রাখো
- **How:** `fs.statSync(planFilePath).birthtime` থেকে date নাও, `planStats.files[]` এ `{ name, createdAt, steps }` রাখো
- **Check:** `/api/projects` response-এ `planStats.files[].createdAt` আসে

### Step 26.2 — Parse step completion timestamps from PROGRESS.md log
- **File:** `packages/core/parse-progress.js`
- **Do:** UPDATE LOG section-এর entries থেকে step completion time parse করে step object-এ attach করো
- **How:** Timeline entries যেমন `[2026-07-30 14:15] Step 5.3 completed` — step number match করে `completedAt` field add করো step-এ
- **Check:** `parseProgressText()` output-এ done steps-এ `completedAt` field আসে

### Step 26.3 — Show plan creation date in PlanCard
- **File:** `dashboard/src/components/PlanCard.jsx`
- **Do:** PlanCard footer-এ plan creation date দেখাও — "Created: Jul 28"
- **How:** `project.planStats?.files[0]?.createdAt` থেকে earliest date নিয়ে format করো
- **Check:** Plan card-এ date দেখায়

### Step 26.4 — Show file dates in PlanModal header
- **File:** `dashboard/src/components/PlansCenter.jsx`
- **Do:** Plan modal-এ প্রতিটা plan file-এর name + creation date badge দেখাও
- **How:** `project.planStats?.files` map করে `<span>filename.md · Jul 28</span>` render করো header-এ
- **Check:** Plan modal open করলে file names + dates দেখায়

### Step 26.5 — Show step completion time in StepItem
- **File:** `dashboard/src/components/StepItem.jsx`
- **Do:** Done steps-এ completion timestamp দেখাও — "✅ Jul 30, 2:15 PM"
- **How:** `step.completedAt` exist করলে formatted date দেখাও step number-এর পাশে
- **Check:** Done step-এ date/time দেখায়, pending step-এ দেখায় না

### Step 26.6 — Show phase completion summary in PhaseView
- **File:** `dashboard/src/components/PhaseView.jsx`
- **Do:** Phase 100% হলে "Completed: Jul 30" দেখাও, partial হলে "Last activity: Jul 29"
- **How:** Phase-এর steps-এর `completedAt` values-এর max নাও, format করে header-এ দেখাও
- **Check:** Done phase-এ completion date দেখায়
