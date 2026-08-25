# Phase 169: Harmonize & Modernize Diagnostic Issue Cards Design

> **Objective:** Upgrade all issue cards across Intelligence Hub and Health Command Center to the modern Zen `p-4 rounded-[1.5rem]`, `rounded-xl` category badge, `text-sm font-semibold`, `Line X` pill, and `Copy Prompt` / `Open in IDE` action button design with dynamic category color mapping.

---

## 📋 Execution Steps

### Step 169.1 — Upgrade ActionableIssueCard Design (`dashboard/src/components/intelligence/ActionableIssueCard.jsx`)
- **File**: `dashboard/src/components/intelligence/ActionableIssueCard.jsx`
- **Action**: EDIT
- **Content**: Implement `rounded-[1.5rem]`, `p-4`, `rounded-xl` badge with dynamic category colors, `text-sm` filename, `Line X` badge, and `Copy Prompt` / `Open in IDE` buttons. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 169.2 — Harmonize Health IssueCard Design (`dashboard/src/components/health/IssueCard.jsx`)
- **File**: `dashboard/src/components/health/IssueCard.jsx`
- **Action**: EDIT
- **Content**: Ensure `IssueCard.jsx` shares the exact same dynamic badge color mapping, borders, and button hover styles. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 169.1

---

### Step 169.3 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 169.2

---

### Step 169.4 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 169.3
