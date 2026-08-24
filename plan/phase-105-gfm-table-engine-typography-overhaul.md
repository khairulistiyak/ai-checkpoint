# Phase 105: GitHub-Flavored Markdown (GFM), Table Engine & Typography Overhaul

> **Objective:** Upgrade the blueprint markdown engine to GitHub-perfect fidelity with table parsing & rendering, GitHub Alerts ([!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]), clean code/bold typography, sleek horizontal dividers, and structured step blocks.

---

## 📋 Execution Steps

### Step 105.1 — Create GitHub-Flavored Table Block (`dashboard/src/components/plan/PlanTableBlock.jsx`)
- **File**: `dashboard/src/components/plan/PlanTableBlock.jsx`
- **Action**: CREATE
- **Content**: Build a reusable, accessible table renderer component with GitHub Dark styling and cell badge formatting.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 105.2 — Create GitHub Alert & Callout Block (`dashboard/src/components/plan/PlanAlertBlock.jsx`)
- **File**: `dashboard/src/components/plan/PlanAlertBlock.jsx`
- **Action**: CREATE
- **Content**: Build a callout component supporting `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, and `[!CAUTION]` with matching icons.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 105.3 — Upgrade Markdown Parser with Table, Alert & HR Support (`dashboard/src/components/plans/parse-plan-content.js`)
- **File**: `dashboard/src/components/plans/parse-plan-content.js`
- **Action**: EDIT
- **Content**: Extend plan parser to extract tables (`type: 'table'`), alerts (`type: 'alert'`), and dividers (`type: 'hr'`) while maintaining Rule 0 (<= 150 lines).
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 105.1, 105.2

### Step 105.4 — Polish Inline Typography & Badges (`dashboard/src/components/plans/plan-formatters.jsx`)
- **File**: `dashboard/src/components/plans/plan-formatters.jsx`
- **Action**: EDIT
- **Content**: Refine `formatTextWithBadges` to produce GitHub Dark inline code chips and crisp bold typography without heavy boxes.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 105.5 — Integrate Table, Alert & Divider in Plan Phase List (`dashboard/src/components/plan/PlanPhaseList.jsx`)
- **File**: `dashboard/src/components/plan/PlanPhaseList.jsx`
- **Action**: EDIT
- **Content**: Wire `PlanTableBlock`, `PlanAlertBlock`, and `<hr>` into the main block renderer.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 105.1 - 105.4

### Step 105.6 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 105.1 - 105.5

### Step 105.7 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 105 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 105.6
