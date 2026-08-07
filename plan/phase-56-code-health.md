# Phase 56: Code Health Remediation

> Zero-bug, copy-paste ready plan. Even a free 1M model can execute this.
> Rule: 1 step = 1 file. No ambiguity. Every step has EXACT code.

---

## 🔴 PART A: Security & Hygiene Fixes (Zero Risk)

---

### Step 56.1 — Delete macOS junk file
- **File:** `dashboard/src/components/._HealthCommandCenter.jsx`
- **Action:** DELETE
- **Command:** `rm -f dashboard/src/components/._HealthCommandCenter.jsx`
- **Done-check:** `test ! -f dashboard/src/components/._HealthCommandCenter.jsx`
- **Depends:** None

---

### Step 56.2 — Remove debug console.log from server.js
- **File:** `dashboard/server.js`
- **Action:** EDIT
- **What to do:**
  - Line 59: Change `console.log(...)` → keep it (this is a startup log, acceptable)
  - Line 68: Change `console.log(...)` → keep it (plan watcher info, acceptable)
  - These are actually INFO-level startup logs, NOT debug logs.
  - The scanner flagged them but they are OK to keep. Skip this step.
- **Done-check:** No action needed
- **Depends:** None

---

### Step 56.3 — Fix empty catch blocks in api.js
- **File:** `dashboard/src/utils/api.js`
- **Action:** EDIT
- **Find this exact code on line 12:**
```javascript
    } catch (e) {}
```
- **Replace with:**
```javascript
    } catch (e) { /* response not JSON */ }
```
- **Done-check:** `grep "response not JSON" dashboard/src/utils/api.js`
- **Depends:** None

---

### Step 56.4 — Fix empty catch block in ActivityLog.jsx
- **File:** `dashboard/src/components/ActivityLog.jsx`
- **Action:** EDIT
- **Find this on line 174:** `} catch (e) {}`
- **Replace with:** `} catch (e) { /* parse error ignored */ }`
- **Done-check:** `grep "parse error ignored" dashboard/src/components/ActivityLog.jsx`
- **Depends:** None

---

### Step 56.5 — Fix empty catch block in activity-logger.js
- **File:** `dashboard/src/server/activity-logger.js`
- **Action:** EDIT
- **Find on line 143:** `} catch (e) {}`  or  `} catch {}`
- **Replace with:** `} catch { /* read error ignored */ }`
- **Done-check:** `grep "read error ignored" dashboard/src/server/activity-logger.js`
- **Depends:** None

---

### Step 56.6 — Fix empty catch blocks in ai-tier.js
- **File:** `dashboard/src/server/ai-tier.js`
- **Action:** EDIT
- **Find on line 61:** `} catch (e) {}` → Replace with `} catch { /* tier file read error */ }`
- **Find on line 107:** `} catch (e) {}` → Replace with `} catch { /* tier file write error */ }`
- **Done-check:** `grep "tier file" dashboard/src/server/ai-tier.js`
- **Depends:** None

---

### Step 56.7 — Fix empty catch block in projects.js
- **File:** `dashboard/src/server/projects.js`
- **Action:** EDIT
- **Find on line 215:** `} catch (e) {}` → Replace with `} catch { /* junk cleanup error ignored */ }`
- **Done-check:** `grep "junk cleanup" dashboard/src/server/projects.js`
- **Depends:** None

---

### Step 56.8 — Fix empty catch block in cmd-new-plan.js
- **File:** `packages/cli/cmd-new-plan.js`
- **Action:** EDIT
- **Find:** `} catch (e) {}` or `} catch {}` → Replace with `} catch { /* dir already exists */ }`
- **Done-check:** `grep "dir already exists" packages/cli/cmd-new-plan.js`
- **Depends:** None

---

### Step 56.9 — Fix empty catch blocks in run-config files
- **File:** `packages/core/run-config-detect.js`
- **Action:** EDIT
- **Find on line 72:** `} catch {}` → Replace with `} catch { /* config read error */ }`
- **Done-check:** `grep "config read error" packages/core/run-config-detect.js`
- **Depends:** None

---

### Step 56.10 — Fix empty catch blocks in run-config.js
- **File:** `packages/core/run-config.js`
- **Action:** EDIT
- **Line 36:** `} catch {}` → `} catch { /* package.json not found */ }`
- **Line 70:** `} catch {}` → `} catch { /* requirements.txt not found */ }`
- **Line 89:** `} catch {}` → `} catch { /* pom.xml not found */ }`
- **Done-check:** `grep -c "not found" packages/core/run-config.js` → should show 3
- **Depends:** None

---

### Step 56.11 — Remove debugger statement from auto-fixer.js
- **File:** `packages/core/auto-fixer.js`
- **Action:** EDIT
- **What to do:** This file has NO debugger statement at line 6. The scanner detected the REGEX pattern `{ name: 'debugger', regex: ...}` as a false positive because the word "debugger" appears in a regex definition. This is a FALSE POSITIVE. Skip.
- **Done-check:** No action needed
- **Depends:** None

---

### Step 56.12 — Strip trailing whitespace from 4 files
- **File:** `dashboard/src/components/DeveloperActionDock.jsx`
- **Action:** EDIT
- **Command:** Run `sed -i '' 's/[[:space:]]*$//' dashboard/src/components/DeveloperActionDock.jsx dashboard/src/components/HealthCommandCenter.jsx dashboard/src/components/ProjectTabBar.jsx dashboard/src/components/QuickTerminalDrawer.jsx`
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** None

---

### Step 56.13 — Build verification after hygiene fixes
- **File:** `dashboard/package.json`
- **Action:** VERIFY
- **Command:** `cd dashboard && npm run build`
- **Done-check:** Exit code 0, no errors
- **Depends:** 56.1 through 56.12

---

## 🟢 PART B: Rule 0 — Split HealthCommandCenter.jsx (515 lines → 4 files)

> **Strategy:** Extract 3 sub-components. Parent file keeps logic + orchestration.
> **Import path does NOT change** — ProjectGrid.jsx still imports `./HealthCommandCenter`.

---

### Step 56.14 — Create HealthScoreGauge.jsx
- **File:** `dashboard/src/components/health/HealthScoreGauge.jsx`
- **Action:** CREATE
- **Content:** Extract the circular score gauge (lines 234-279 of HealthCommandCenter.jsx) into a standalone component.
- **Props the component receives:** `{ score, scoreColor, healthScore, qualityScore, filesScanned, passed }`
- **What to include:** The `motion.div` with the circular gauge, the Health/Quality/Files stats bar.
- **Imports needed:** `import { motion } from 'framer-motion';`
- **Export:** `export default function HealthScoreGauge({ score, scoreColor, healthScore, qualityScore, filesScanned, passed })`
- **Done-check:** `test -f dashboard/src/components/health/HealthScoreGauge.jsx`
- **Depends:** None

---

### Step 56.15 — Create HealthPillarGrid.jsx
- **File:** `dashboard/src/components/health/HealthPillarGrid.jsx`
- **Action:** CREATE
- **Content:** Extract the 6-card pillar grid (lines 281-351 of HealthCommandCenter.jsx) into a standalone component.
- **Props the component receives:** `{ breakdown }`
- **What to include:** The grid with Security, Rule 0, Syntax, Imports, Hygiene, Complexity cards.
- **Imports needed:** `import { Shield, Code2, Layers, Sparkles, Lock, Cpu } from 'lucide-react';`
- **Export:** `export default function HealthPillarGrid({ breakdown })`
- **Done-check:** `test -f dashboard/src/components/health/HealthPillarGrid.jsx`
- **Depends:** None

---

### Step 56.16 — Create HealthIssueExplorer.jsx
- **File:** `dashboard/src/components/health/HealthIssueExplorer.jsx`
- **Action:** CREATE
- **Content:** Extract the filter tabs + search bar + issue list (lines 383-502 of HealthCommandCenter.jsx) into a standalone component.
- **Props the component receives:** `{ issues, filteredIssues, categoryCounts, activeCategory, setActiveCategory, searchQuery, setSearchQuery, onOpenInIde }`
- **What to include:** Category filter pills, search input, issue list with motion animation, Open in IDE button.
- **Imports needed:** `import { motion } from 'framer-motion'; import { Search, FileCode, CheckCheck } from 'lucide-react';`
- **Export:** `export default function HealthIssueExplorer({ ... })`
- **Done-check:** `test -f dashboard/src/components/health/HealthIssueExplorer.jsx`
- **Depends:** None

---

### Step 56.17 — Create HealthCoreChecklist.jsx
- **File:** `dashboard/src/components/health/HealthCoreChecklist.jsx`
- **Action:** CREATE
- **Content:** Extract the system core integrity checklist (lines 353-381 of HealthCommandCenter.jsx) into standalone component.
- **Props the component receives:** `{ checks }`
- **What to include:** The checks grid with pass/fail badges.
- **Imports needed:** `import { CheckCircle2, XCircle, FileCheck } from 'lucide-react';`
- **Export:** `export default function HealthCoreChecklist({ checks })`
- **Done-check:** `test -f dashboard/src/components/health/HealthCoreChecklist.jsx`
- **Depends:** None

---

### Step 56.18 — Rewrite HealthCommandCenter.jsx as orchestrator
- **File:** `dashboard/src/components/HealthCommandCenter.jsx`
- **Action:** REWRITE (keep same export, same props)
- **What to do:** Replace the entire file. Keep ALL the logic (state, hooks, handlers, useMemo). Replace the JSX render section with imports of the 4 sub-components.
- **The new file MUST:**
  1. Keep `export default function HealthCommandCenter({ projectId })` — same as before
  2. Keep ALL useState, useEffect, useCallback, useMemo hooks — same as before
  3. Keep handleCopyDiagnosticReport, handleAutoFix, handleOpenInIde — same as before
  4. Import and use: `HealthScoreGauge`, `HealthPillarGrid`, `HealthCoreChecklist`, `HealthIssueExplorer`
  5. Pass props to each sub-component
- **The render section should be ~50 lines** instead of ~350 lines
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.14, 56.15, 56.16, 56.17

---

### Step 56.19 — Build verification after HealthCommandCenter split
- **File:** `dashboard/src/components/HealthCommandCenter.jsx`
- **Action:** VERIFY
- **Command:** `cd dashboard && npm run build`
- **Done-check:** Exit code 0, no errors. HealthCommandCenter renders exactly the same as before.
- **Depends:** 56.18

---

## 🟢 PART C: Rule 0 — Remaining Component Splits

> Same pattern as PART B. Each component gets split into sub-components.
> Parent file keeps ALL logic. Sub-components are pure render.

---

### Step 56.20 — Split ActivityLog.jsx (497 lines)
- **File:** `dashboard/src/components/ActivityLog.jsx`
- **Action:** SPLIT
- **Extract:** `ActivityLogEntry.jsx` (single log entry card), `ActivityLogFilters.jsx` (filter bar)
- **Keep:** ActivityLog.jsx as orchestrator with state/hooks (~140 lines)
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.19

---

### Step 56.21 — Split QuickTerminalDrawer.jsx (427 lines)
- **File:** `dashboard/src/components/QuickTerminalDrawer.jsx`
- **Action:** SPLIT
- **Extract:** `terminal/TerminalOutput.jsx` (output display), `terminal/TerminalQuickActions.jsx` (quick action buttons)
- **Keep:** QuickTerminalDrawer.jsx as orchestrator with state/hooks (~140 lines)
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.20

---

### Step 56.22 — Split DeveloperActionDock.jsx (331 lines)
- **File:** `dashboard/src/components/DeveloperActionDock.jsx`
- **Action:** SPLIT
- **Extract:** `dock/ActionDockButtons.jsx` (the button row)
- **Keep:** DeveloperActionDock.jsx as orchestrator (~140 lines)
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.21

---

### Step 56.23 — Split GitVisualizer.jsx (279 lines)
- **File:** `dashboard/src/components/GitVisualizer.jsx`
- **Action:** SPLIT
- **Extract:** `git/GitCommitCard.jsx` (single commit card)
- **Keep:** GitVisualizer.jsx as orchestrator (~130 lines)
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.22

---

### Step 56.24 — Split ProjectCard.jsx (259 lines)
- **File:** `dashboard/src/components/ProjectCard.jsx`
- **Action:** SPLIT
- **Extract:** `project/ProjectCardStats.jsx` (stats section)
- **Keep:** ProjectCard.jsx as card shell (~130 lines)
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.23

---

### Step 56.25 — Split ArchitecturalPlanViewer.jsx (794 lines)
- **File:** `dashboard/src/components/plans/ArchitecturalPlanViewer.jsx`
- **Action:** SPLIT
- **Extract:** `plans/PlanSpecHeader.jsx`, `plans/PlanSpecSection.jsx`, `plans/PlanCopyPrompt.jsx`
- **Keep:** ArchitecturalPlanViewer.jsx as orchestrator (~120 lines)
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.24

---

### Step 56.26 — Split FilePreviewDrawer.jsx (430 lines)
- **File:** `dashboard/src/components/plans/FilePreviewDrawer.jsx`
- **Action:** SPLIT
- **Extract:** `plans/FilePreviewHeader.jsx`, `plans/FilePreviewContent.jsx`
- **Keep:** FilePreviewDrawer.jsx as shell (~120 lines)
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.25

---

### Step 56.27 — Trim ProjectTabBar.jsx (204 lines)
- **File:** `dashboard/src/components/ProjectTabBar.jsx`
- **Action:** SPLIT
- **Extract:** `ui/TabBarItem.jsx` (single tab item)
- **Keep:** ProjectTabBar.jsx as container (~110 lines)
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.26

---

### Step 56.28 — Trim PlanFilesTab.jsx (196 lines)
- **File:** `dashboard/src/components/plans/PlanFilesTab.jsx`
- **Action:** SPLIT
- **Extract:** `plans/PlanFileCard.jsx` (single file card)
- **Keep:** PlanFilesTab.jsx as list (~110 lines)
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.27

---

### Step 56.29 — Trim PlanMarkdownEditor.jsx (208 lines)
- **File:** `dashboard/src/components/plans/PlanMarkdownEditor.jsx`
- **Action:** SPLIT
- **Extract:** `plans/EditorToolbar.jsx` (toolbar buttons)
- **Keep:** PlanMarkdownEditor.jsx as editor (~120 lines)
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.28

---

### Step 56.30 — Trim ProjectGrid.jsx (183 lines → ~150 lines)
- **File:** `dashboard/src/components/ProjectGrid.jsx`
- **Action:** EDIT (trim, don't split)
- **What to do:** Remove any dead imports, consolidate blank lines, remove unused variables.
- **Target:** Get under 150 effective lines without splitting.
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.29

---

## 🟡 PART D: Server-Side Rule 0 Splits (Medium Risk)

---

### Step 56.31 — Split projects.js (486 lines → 4 files)
- **File:** `dashboard/src/server/projects.js`
- **Action:** SPLIT
- **Extract:**
  - `server/project-health.js` — the `/:id/health` route handler + autofix route
  - `server/project-commands.js` — the `/:id/command` route handler
  - `server/project-config.js` — the `/:id/config`, `/:id/ai-tier`, `/:id/run-config` handlers
- **Keep:** `projects.js` as router wiring file (~100 lines) that imports sub-routers
- **CRITICAL:** Keep `export default router;` in projects.js. api.js imports it.
- **Done-check:** `cd dashboard && npm run build` → exit 0 AND `curl http://localhost:20226/api/projects` → 200
- **Depends:** 56.30

---

### Step 56.32 — Split watcher.js (448 lines → 3 files)
- **File:** `dashboard/src/server/watcher.js`
- **Action:** SPLIT
- **Extract:**
  - `server/watcher-events.js` — event handler functions
  - `server/watcher-sse.js` — SSEClientManager class
- **Keep:** `watcher.js` as main manager (~120 lines)
- **CRITICAL:** Keep `export { watcherManager, SSEClientManager, POINTER_FILES, POINTER_CONTENT };` in watcher.js. projects.js imports these.
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.31

---

### Step 56.33 — Split activity-logger.js (241 lines → 2 files)
- **File:** `dashboard/src/server/activity-logger.js`
- **Action:** SPLIT
- **Extract:** `server/activity-filters.js` — the `shouldIgnore` function + helpers
- **Keep:** `activity-logger.js` as logger class (~120 lines)
- **CRITICAL:** Keep `export { ActivityLogger, shouldIgnore };` in activity-logger.js. Both projects.js and watcher.js import these.
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 56.32

---

## ✅ PART E: Final Verification

---

### Step 56.34 — Full build verification
- **File:** `dashboard/package.json`
- **Action:** VERIFY
- **Command:** `cd dashboard && npm run build`
- **Done-check:** Exit 0, zero errors
- **Depends:** 56.33

---

### Step 56.35 — Health score re-scan
- **File:** `dashboard/src/server/health.js`
- **Action:** VERIFY
- **Command:** `curl -s http://localhost:20226/api/projects/1785648558108/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Score: {d[\"score\"]}/100')"` 
- **Done-check:** Score >= 70
- **Depends:** 56.34

---

### Step 56.36 — Update PROGRESS.md
- **File:** `.agents/PROGRESS.md`
- **Action:** EDIT
- **Content:** Add Phase 56 with all steps marked complete
- **Done-check:** `grep "Phase 56" .agents/PROGRESS.md`
- **Depends:** 56.35
