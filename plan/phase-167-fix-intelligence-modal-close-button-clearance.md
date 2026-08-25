# Phase 167: Fix Intelligence Modal Close Button Clearance & Header Padding

> **Objective:** Add proper right-side clearance (`pr-14 sm:pr-16`) to the IntelligenceHub header container so that the action cluster (`Fix Prompt`, `Re-scan`, and `Score 100/100`) never collides with or renders underneath the top-right modal close button.

---

## 📋 Execution Steps

### Step 167.1 — Add Right Clearance to IntelligenceHub Header (`dashboard/src/components/intelligence/IntelligenceHub.jsx`)
- **File**: `dashboard/src/components/intelligence/IntelligenceHub.jsx`
- **Action**: EDIT
- **Content**: Add `pr-14 sm:pr-16` to the header container to ensure generous breathing room and prevent overlap with the modal close button. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 167.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 167.1

---

### Step 167.3 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 167.2
