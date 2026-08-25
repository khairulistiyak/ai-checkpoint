# Phase 165: Remove AI Smart Insights Banner from IntelligenceHub

> **Objective:** Remove the AI Smart Insights card component from `IntelligenceHub.jsx` as requested by the user, providing a cleaner, uncluttered layout focused directly on Core Balance metrics and Actionable Issues.

---

## 📋 Execution Steps

### Step 165.1 — Remove SmartInsights Component from IntelligenceHub (`dashboard/src/components/intelligence/IntelligenceHub.jsx`)
- **File**: `dashboard/src/components/intelligence/IntelligenceHub.jsx`
- **Action**: EDIT
- **Content**: Remove `SmartInsights` import and its rendered `<motion.div>` block. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 165.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 165.1

---

### Step 165.3 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 165.2
