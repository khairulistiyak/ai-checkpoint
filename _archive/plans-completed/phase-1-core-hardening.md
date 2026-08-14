# Phase 1 — Core Hardening

> Make the CLI bulletproof: safety, validation, and micro-file enforcement.

---

## Step 1.1 — Add safety header to CLI
- **File:** `.agents/scripts/ledger.cjs`
- **Action:** EDIT
- **Content:** Add strict mode and error handling at the top of the file (after shebang):
  ```javascript
  'use strict';
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    process.exit(1);
  });
  ```
- **Done-check:** `node .agents/scripts/ledger.cjs --help` → exit 0, no crashes
- **Depends:** None

---

## Step 1.2 — Add `doctor` command
- **File:** `.agents/scripts/ledger.cjs`
- **Action:** EDIT
- **Content:** Add new command `doctor` that checks:
  1. `.agents/` directory exists
  2. `.agents/PROGRESS.md` exists and is valid markdown
  3. `.agents/RULES.md` exists
  4. `.agents/AGENTS.md` exists
  5. `plan/` directory exists
  6. Current directory is a git repository
  
  Output format:
  - On success: Print "✅ All checks passed" and exit 0
  - On failure: Print specific error (e.g., "❌ Missing .agents/PROGRESS.md") and exit 1
- **Done-check:** `./l doctor` in valid project → exit 0; in empty dir → exit 1 with specific error
- **Depends:** 1.1

---

## Step 1.3 — Add real validation to `validate` command
- **File:** `.agents/scripts/ledger.cjs`
- **Action:** EDIT
- **Content:** Enhance existing `validate` (or `v`) command to check:
  1. Every completed step's declared file actually exists on disk
  2. Step IDs in PROGRESS.md match step IDs in plan/*.md files
  3. **150-line limit:** Scan all files mentioned in PROGRESS.md; fail if any file >150 lines (excluding blank lines and comments)
  
  Output format:
  - List all violations with file paths and line counts
  - Exit 1 if any check fails
  - Exit 0 if all pass
- **Done-check:** 
  1. Create test file with 200 lines: `seq 1 200 > test-long.txt`
  2. Add fake completed step referencing test-long.txt in PROGRESS.md
  3. Run `./l v` → should FAIL and show "test-long.txt exceeds 150 lines (200 lines)"
  4. Delete test file and revert PROGRESS.md
- **Depends:** 1.2

---

## Step 1.4 — Update RULES.md template with micro-file rules
- **File:** `templates/RULES.md`
- **Action:** EDIT
- **Content:** Replace entire file with:
  ```markdown
  # Coding Rules

  > Project-specific conventions the agent must follow.

  ---

  ## RULE 0 — Micro-File Monorepo Rule (MANDATORY)

  ### File Rules
  1. **One file = one job.** Each file does exactly one thing (one component, one util, one config).
  2. **Max 150 lines per file.** Hard limit, not a suggestion. If exceeded, split the file.
  3. **Max 1 file per step.** AI works on one file per step. Need two files? Create two steps.
  4. **Names must be self-documenting.** `utils.js` is forbidden → use `format-date.js`, `parse-schema.js`.

  ### Monorepo Layout
  ```
  project/
  ├── .agents/              ← system files (PROGRESS, RULES, AGENTS)
  ├── plan/                 ← atomic step plans
  ├── packages/
  │   ├── core/             ← each module = small folder
  │   │   ├── index.js      ← barrel exports only
  │   │   ├── state.js      ← ≤150 lines
  │   │   └── events.js     ← ≤150 lines
  │   ├── ui/
  │   └── utils/
  └── package.json
  ```

  - Import only through `index.js` (barrel), never direct internal files
  - New feature = new small folder, don't add to existing large files

  ### Protected Paths
  - `.agents/` — system files, don't modify without explicit instruction
  - `plan/drafts/` — R&D notes, never auto-execute

  ---

  ## Project Settings

  | Key | Value |
  |-----|-------|
  | Language | _TypeScript / JavaScript / Python_ |
  | Framework | _React / Next.js / Vue_ |
  | Styling | _Tailwind / CSS Modules / Vanilla_ |

  ---

  ## Import Order

  1. External packages
  2. Internal modules
  3. Styles

  ## Naming

  - Components: `PascalCase`
  - Functions: `camelCase`
  - Files: `kebab-case` or `PascalCase`

  ## Safety

  - Don't delete existing code without being told
  - Don't add new dependencies unless specified
  - Don't leave console.log in production code

  ## Verify

  | Command | Purpose |
  |---------|---------|
  | `npm run dev` | Dev server |
  | `npm run build` | Build check |
  ```
- **Done-check:** `cat templates/RULES.md | grep "RULE 0"` → shows "RULE 0 — Micro-File Monorepo Rule"
- **Depends:** None

---

## Step 1.5 — Update setup.sh with safe paths
- **File:** `setup.sh`
- **Action:** EDIT
- **Content:** Add `set -euo pipefail` after the shebang line (line 1), and quote all path variables throughout the script (e.g., `"$PROJECT_DIR"`, `"$SCRIPT_DIR"`).
- **Done-check:** `shellcheck setup.sh` → 0 errors (install shellcheck if needed: `brew install shellcheck`)
- **Depends:** None
