# Phase 3 — Templates Upgrade (RULE 0 & RULE 1)

> Enforce atomic steps and micro-file architecture through templates — make it impossible for small models to fail.

---

## Step 3.1 — Create PLAN_TEMPLATE.md
- **File:** `templates/PLAN_TEMPLATE.md`
- **Action:** CREATE
- **Content:**
  ```markdown
  # Plan: [Your Plan Name]

  > Brief description of what this plan accomplishes.

  ---

  ## Step X.1 — [Step Title]
  - **File:** `path/to/file.js`
  - **Action:** CREATE | EDIT | DELETE
  - **Content:** 
    [Complete code here, OR single unambiguous instruction]
    
  - **Done-check:** `command to verify` → expected output
  - **Depends:** X.0 (or None)

  ---

  ## Step X.2 — [Next Step Title]
  - **File:** `path/to/another-file.js`
  - **Action:** CREATE
  - **Content:**
    ```javascript
    // Complete working code
    module.exports = function example() {
      return 'hello';
    };
    ```
    
  - **Done-check:** `node -e "require('./path/to/another-file.js')()"` → prints "hello"
  - **Depends:** X.1

  ---

  ## Atomic Step Rules (RULE 1)

  ✅ **DO:**
  - One step = one file = one action
  - Include complete code or 100% clear instruction
  - Specify exact file path
  - Provide runnable Done-check command
  - List dependency step ID

  ❌ **DON'T:**
  - Use vague words: "appropriately", "as needed", "etc.", "properly"
  - Create steps without Done-check
  - Touch multiple files in one step
  - Write ambiguous instructions

  ### Done-check Examples

  - File exists: `test -f path/to/file.js && echo OK`
  - Syntax valid: `node -c path/to/file.js`
  - Import works: `node -e "require('./path/file.js')"`
  - Test passes: `npm test -- path/to/test.js`
  - Build works: `npm run build`
  - Grep match: `grep -q "expected text" file.txt && echo OK`
  ```
- **Done-check:** `test -f templates/PLAN_TEMPLATE.md && grep -q "RULE 1" templates/PLAN_TEMPLATE.md && echo OK`
- **Depends:** None

---

## Step 3.2 — Add `new-plan` command to CLI
- **File:** `.agents/scripts/ledger.cjs`
- **Action:** EDIT
- **Content:** Add command `new-plan <name>` (alias: `np`) that:
  1. Validates name: alphanumeric + dashes only, max 50 chars
  2. Creates file: `plan/<name>.md`
  3. Copies content from `templates/PLAN_TEMPLATE.md`
  4. Replaces `[Your Plan Name]` with the provided name
  5. Prints: "✅ Created plan/\<name\>.md — edit it to add your steps"
  6. If file already exists, print error and exit 1
- **Done-check:** 
  1. `./l new-plan test-feature` → creates plan/test-feature.md
  2. `cat plan/test-feature.md | grep "RULE 1"` → shows RULE 1 section
  3. Delete test file: `rm plan/test-feature.md`
- **Depends:** 3.1

---

## Step 3.3 — Update AGENTS.md with strict loop
- **File:** `templates/AGENTS.md`
- **Action:** EDIT
- **Content:** Replace entire file with:
  ```markdown
  # Agent Workflow Rules

  > Auto-loaded every session. Tells the AI agent how to work.

  ---

  ## Before Starting Any Work

  1. Read `.agents/PROGRESS.md` — know what's done and what's next
  2. Read `.agents/RULES.md` — know the coding conventions (especially RULE 0)
  3. Find the next pending step in `plan/*.md`
  4. Verify step follows RULE 1 (atomic format)
  5. Start working

  ---

  ## The Strict Loop (MANDATORY)

  For each step, execute in this exact order:

  1. **Read** the step in `plan/*.md`
  2. **Verify** it follows atomic format (File, Action, Content, Done-check, Depends)
  3. **Execute** ONLY the action specified — ONE file, ONE change
  4. **Run** the Done-check command from the step
  5. **If Done-check fails:**
     - Fix the issue in the SAME step
     - Try Done-check again
     - If fails 2nd time: mark step as BLOCKED, stop, report to user
  6. **Run** `./l v` (validate)
  7. **If validate fails:** Fix and repeat from step 4
  8. **Run** `./l c X.Y "note"` (complete)
  9. **Report** to user (see format below)
  10. **Move** to next step

  ---

  ## Rules

  - **1 step = 1 file = 1 action** — never deviate
  - **Never skip** steps or redo completed ones
  - **Never guess** — if step is ambiguous, mark as BLOCKED
  - **Never auto-execute** files in `plan/drafts/`
  - **2-strike rule:** 2 Done-check failures = BLOCKED, stop working
  - **No freelancing:** Don't add features, refactors, or "improvements" not in the step

  ---

  ## After Each Step

  Report to the user:
  ```
  ✅ Step X.Y Complete — [title]
  📁 File: [path]
  ✓ Done-check: passed
  ✓ Validation: passed
  📊 Progress: X/Y steps (Z%)
  👉 Next: Step X.Y — [title]
  ```

  If BLOCKED:
  ```
  🚫 Step X.Y BLOCKED — [title]
  📁 File: [path]
  ✗ Done-check failed 2x:
    Command: [command]
    Output: [error]
  
  🛠️ Need human intervention:
  [Explain what's wrong and what needs clarification]
  ```

  ---

  ## Checkpoint Usage

  - After completing risky/complex steps: `./l cp save "description"`
  - Before major refactoring: checkpoint first
  - On repeated failures: rollback with `./l cp back`
  ```
- **Done-check:** `cat templates/AGENTS.md | grep "The Strict Loop"` → shows the section
- **Depends:** 3.2

---

## Step 3.4 — Update RULES.md template (already has RULE 0)
- **File:** `templates/RULES.md`
- **Action:** EDIT
- **Content:** Add RULE 1 section after RULE 0:
  ```markdown
  
  ---

  ## RULE 1 — Atomic Step Format (MANDATORY)

  Every step in `plan/*.md` MUST follow this exact format:

  ```markdown
  ### Step X.Y — [Clear Title]
  - **File:** `exact/path/to/file.ext` (ONE file only)
  - **Action:** CREATE | EDIT | DELETE (pick ONE)
  - **Content:** [Complete code OR unambiguous one-line instruction]
  - **Done-check:** `exact command` → expected output
  - **Depends:** X.(Y-1) | None
  ```

  ### Forbidden Words (cause ambiguity)
  ❌ "appropriately", "as needed", "properly", "etc.", "and so on", "refactor nicely", "improve", "optimize"

  ### Step Requirements
  1. One step = one file = one action
  2. Done-check MUST be runnable and verifiable
  3. Content is either full code or has only ONE interpretation
  4. If two people could implement differently, the step is WRONG → split it
  5. Dependencies form a straight chain: 1.1 → 1.2 → 1.3 (no branching)

  ---
  ```
- **Done-check:** `cat templates/RULES.md | grep "RULE 1"` → shows "RULE 1 — Atomic Step Format"
- **Depends:** 3.3

---

## Step 3.5 — Create example atomic plan
- **File:** `examples/atomic-plan-example.md`
- **Action:** CREATE
- **Content:**
  ```markdown
  # Example: Atomic Plan for Date Formatter

  > Shows perfect RULE 1 compliance — copy this pattern.

  ---

  ## Step 1.1 — Create date formatter utility
  - **File:** `packages/utils/format-date.js`
  - **Action:** CREATE
  - **Content:**
    ```javascript
    /**
     * Format date to YYYY-MM-DD
     * @param {Date} date
     * @returns {string}
     */
    function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    module.exports = formatDate;
    ```
  - **Done-check:** `node -e "const f=require('./packages/utils/format-date.js'); console.log(f(new Date('2026-07-18')))"` → prints "2026-07-18"
  - **Depends:** None

  ---

  ## Step 1.2 — Add test for date formatter
  - **File:** `packages/utils/format-date.test.js`
  - **Action:** CREATE
  - **Content:**
    ```javascript
    const formatDate = require('./format-date');

    test('formats date to YYYY-MM-DD', () => {
      const result = formatDate(new Date('2026-07-18T12:00:00Z'));
      expect(result).toBe('2026-07-18');
    });

    test('pads single-digit months and days', () => {
      const result = formatDate(new Date('2026-01-05T12:00:00Z'));
      expect(result).toBe('2026-01-05');
    });
    ```
  - **Done-check:** `npm test -- format-date.test.js` → 2 tests pass
  - **Depends:** 1.1

  ---

  ## Step 1.3 — Export from utils barrel
  - **File:** `packages/utils/index.js`
  - **Action:** EDIT
  - **Content:** Add line: `exports.formatDate = require('./format-date');`
  - **Done-check:** `node -e "const {formatDate} = require('./packages/utils'); console.log(typeof formatDate)"` → prints "function"
  - **Depends:** 1.2

  ---

  ## ✅ Why This Works (for small models)

  - **No ambiguity:** Every step has ONE correct implementation
  - **Full code:** Model doesn't guess structure or syntax
  - **Verifiable:** Done-check proves it worked
  - **Atomic:** Each step fits in small context window
  - **Traceable:** Depends chain shows order clearly

  ## ❌ Bad Example (DO NOT DO THIS)

  ```markdown
  ### Step 1.1 — Add date utilities
  - **File:** `utils/date.js`
  - **Content:** Create date formatting and parsing utilities as needed
  - **Done-check:** Make sure it works
  ```

  Problems:
  - "as needed" → ambiguous (100 different implementations possible)
  - "Make sure it works" → not a runnable command
  - Doesn't show expected output
  - No dependency specified
  ```
- **Done-check:** `test -f examples/atomic-plan-example.md && grep -q "Why This Works" examples/atomic-plan-example.md && echo OK`
- **Depends:** 3.4
