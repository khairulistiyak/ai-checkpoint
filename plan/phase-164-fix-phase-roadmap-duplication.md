# Phase 164: Fix Phase Roadmap Duplication and Harmonize Historical Phase States

> **Objective:** Deduplicate plan file phases in `parser.js` and mark historical Phases 130 & 131 as 100% complete in `PROGRESS.md` so the Roadmap view displays cleanly without duplicate or stale 0% cards.

---

## 📋 Execution Steps

### Step 164.1 — Deduplicate parsedPhases in parser.js (`dashboard/src/server/parser.js`)
- **File**: `dashboard/src/server/parser.js`
- **Action**: EDIT
- **Content**: Ensure `parsedPhases` in `parsePlanFiles` avoids duplicate phase numbers when multiple plan files exist. Keep file <= 150 lines.
- **Done-check**: `node -e "import('./dashboard/src/server/parser.js')"` -> exit 0
- **Depends**: None

---

### Step 164.2 — Harmonize Phase 130 and 131 Completion in PROGRESS.md (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Mark Phase 130 and Phase 131 as 100% complete and register Phase 164.
- **Done-check**: `./l v` -> exit 0
- **Depends**: 164.1

---

### Step 164.3 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 164.2

---

### Step 164.4 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 164.3
