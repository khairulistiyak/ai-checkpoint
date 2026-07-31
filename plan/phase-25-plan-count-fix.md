# Fix: Plan Files Not Counted in Dashboard Until Work Starts

**Goal:** plan/ folder-এ নতুন plan বানালে সাথে সাথে dashboard-এ steps count দেখাবে
**Why:** এখন শুধু PROGRESS.md পড়ে — plan/*.md ignore করে। Plan বানানোর পর কোনো count নেই
**Files:** parser.js, PlanCard.jsx, enrichProject logic
**Risk:** Low
**Steps:** 5

## Story

1. আগে: plan/ folder-এ `.md` file বানালে dashboard-এ কিছুই দেখায় না
2. সমস্যা: dashboard শুধু PROGRESS.md parse করে, plan/*.md এর steps count করে না
3. Fix: server-side parser-এ plan files scan করে steps count করবো, UI-তে দেখাবো
4. পরে: plan বানানো মাত্রই dashboard-এ "X steps planned" দেখাবে, কাজ শুরু হলে progress track হবে

## Steps

### Step 25.1 — Add plan file parser to server
- **File:** `dashboard/src/server/parser.js`
- **Do:** Add `parsePlanFiles()` function — plan/*.md scan করে steps count করবে
- **How:** plan dir read করো, প্রতিটা .md file-এ `## Step X.Y` বা `### X.Y` heading count করো
- **Check:** Server restart-এ plan steps count log-এ দেখায়

### Step 25.2 — Include plan stats in enrichProject
- **File:** `dashboard/src/server/parser.js`
- **Do:** `enrichProject()` এ `planStats` field add করো — `{ totalFiles, totalSteps, fileNames }`
- **How:** `parsePlanFiles()` call করে result `enrichProject` return-এ merge করো
- **Check:** `/api/projects` response-এ `planStats` field আসে

### Step 25.3 — Show plan file count in PlanCard
- **File:** `dashboard/src/components/PlanCard.jsx`
- **Do:** Plan files ও steps count show করো — "3 Plans · 28 Steps"
- **How:** `project.planStats` থেকে data নিয়ে footer-এ display করো
- **Check:** Dashboard-এ plan card-এ count দেখায়

### Step 25.4 — Add plan steps count to MetricsDashboard
- **File:** `dashboard/src/components/MetricsDashboard.jsx`
- **Do:** 5th metric card add করো — "Planned Steps" count (total plan steps minus PROGRESS steps)
- **How:** `project.planStats?.totalSteps` vs `progress.overall.total` compare করো
- **Check:** Metrics-এ "Planned" card দেখায়

### Step 25.5 — Show plan files list in PlanModal
- **File:** `dashboard/src/components/PlanModal.jsx`
- **Do:** Plan modal-এ plan file names list দেখাও (কোন file-এ কতগুলো step)
- **How:** `project.planStats?.fileNames` map করে chips/badges দেখাও header-এ
- **Check:** Plan modal open করলে file list দেখায়
