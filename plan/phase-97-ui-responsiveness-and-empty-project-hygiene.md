# Phase 97: UI Fluidity, Active Step Indicators & Clean Project Baseline

> Fix 3 release-critical user-reported issues: active step loading indicator, instant settings opening, and clean 100% baseline for empty new projects.

---

## Step 97.1 — Clean Empty Project Baseline Scoring
- **File:** `packages/core/quality-report.js`
- **Action:** EDIT
- **Content:**
  If a project has 0 user files or is a brand new initialized empty folder, return score 100 with zero penalties instead of deducting points for missing package.json/license/readme before code is written.
- **Done-check:** `node -e "const tmp=require('os').tmpdir()+'/t-emp-'+Date.now(); require('fs').mkdirSync(tmp); const { generateQualityReport }=require('./packages/core/quality-report.js'); const r=generateQualityReport(tmp); require('fs').rmSync(tmp,{recursive:true}); if (r.score !== 100) process.exit(1); console.log('EMPTY_QUALITY_100_OK');"` → `EMPTY_QUALITY_100_OK`
- **Depends:** None

---

## Step 97.2 — Skip Dependency Hygiene Penalty on Zero-File Projects
- **File:** `packages/core/dep-hygiene.js`
- **Action:** EDIT
- **Content:**
  If project directory contains 0 code files, do not flag missing `package.json` as an issue.
- **Done-check:** `node -e "const tmp=require('os').tmpdir()+'/t-dep-'+Date.now(); require('fs').mkdirSync(tmp); const { scanDependencyHygiene }=require('./packages/core/dep-hygiene.js'); const r=scanDependencyHygiene(tmp); require('fs').rmSync(tmp,{recursive:true}); if (r.issues.length !== 0) process.exit(1); console.log('EMPTY_DEP_OK');"` → `EMPTY_DEP_OK`
- **Depends:** 97.1

---

## Step 97.3 — Instant Project Settings Modal Opening
- **File:** `dashboard/src/components/ConfigEditor.jsx`
- **Action:** EDIT
- **Content:**
  Remove blocking `if (loading) return null;`. Mount the modal instantly with smooth transition and skeleton loader for tabs while background stack/compliance scans load asynchronously.
- **Done-check:** `npm --prefix dashboard run build` → exit 0
- **Depends:** 97.2

---

## Step 97.4 — Active Step Live Execution Banner in Plan Progress Tab
- **File:** `dashboard/src/components/plans/PlanProgressTab.jsx`
- **Action:** EDIT
- **Content:**
  Add prominent top "⚡ Active Step In Progress" glowing banner showing active step number, title, and target file when any step is running.
- **Done-check:** `grep -i "Active Step" dashboard/src/components/plans/PlanProgressTab.jsx` → exit 0
- **Depends:** 97.3

---

## Step 97.5 — Active Step Indicator Enhancement in StepItem
- **File:** `dashboard/src/components/StepItem.jsx`
- **Action:** EDIT
- **Content:**
  Add glowing animated pulse border and vibrant active spinner badge when `step.status === 'running'`.
- **Done-check:** `grep -i "animate-pulse" dashboard/src/components/StepItem.jsx` → exit 0
- **Depends:** 97.4

---

## Step 97.6 — Active Step Banner in Cockpit Overview
- **File:** `dashboard/src/components/CockpitTab.jsx`
- **Action:** EDIT
- **Content:**
  Display currently running step highlight card at the top of Cockpit when `runningStep` exists so user sees live execution immediately.
- **Done-check:** `grep -i "Active Step" dashboard/src/components/CockpitTab.jsx` → exit 0
- **Depends:** 97.5

---

## Step 97.7 — Rebuild Engine & Dashboard
- **File:** `assets/engine.bin.js`
- **Action:** EDIT
- **Content:**
  Rebuild global engine binary with updated core scanners and verify dashboard production build.
- **Done-check:** `npm run build:engine && npm --prefix dashboard run build` → exit 0
- **Depends:** 97.6

---

## Step 97.8 — Final Phase 97 Release Check Verification
- **File:** `.agents/PROGRESS.md`
- **Action:** EDIT
- **Content:**
  Run full release gates `npm run release:check` and `./l health` (100/100) and sync progress.
- **Done-check:** `npm run release:check && ./l health` → exit 0
- **Depends:** 97.7
