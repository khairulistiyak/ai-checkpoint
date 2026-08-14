# Phase 2 — Checkpoint & Rollback

> Git-based snapshots with validation gates — never lose working state.

---

## Step 2.1 — Add `checkpoint save` command
- **File:** `.agents/scripts/ledger.cjs`
- **Action:** EDIT
- **Content:** Add new command `checkpoint save <message>` (alias: `cp save`) that:
  1. **Validates first:** Run internal validation (from Step 1.3) — if validation fails, print error and exit 1 without saving
  2. Get current step from PROGRESS.md (e.g., "3.2")
  3. Count existing checkpoint tags for this step: `git tag | grep "^aicp/3.2-" | wc -l`
  4. Create annotated git tag: `aicp/<step>-<n>` (e.g., `aicp/3.2-1`)
  5. Commit with message: `git commit -am "checkpoint: <user message>"`
  6. Tag the commit: `git tag -a "aicp/3.2-1" -m "<user message>"`
  7. Print: "✅ Checkpoint saved: aicp/3.2-1"
  
  Handle dirty working tree gracefully (commit changes first).
- **Done-check:** 
  1. Make a trivial file change
  2. Run `./l cp save "test checkpoint"` → exit 0, tag created
  3. Run `git tag | grep aicp` → shows the new tag
- **Depends:** Phase 1 complete (needs validation from 1.3)

---

## Step 2.2 — Add `checkpoint list` command
- **File:** `.agents/scripts/ledger.cjs`
- **Action:** EDIT
- **Content:** Add command `checkpoint list` (alias: `cp list`) that:
  1. Run: `git tag -n1 | grep "^aicp/"` to list all checkpoint tags with their messages
  2. Format output as table:
     ```
     TAG              MESSAGE                    DATE
     aicp/1.1-1       Initial setup              2026-07-18
     aicp/1.2-1       Added validation           2026-07-18
     ```
  3. If no checkpoints exist, print "No checkpoints found"
- **Done-check:** `./l cp list` → shows checkpoint from 2.1, or "No checkpoints found"
- **Depends:** 2.1

---

## Step 2.3 — Add `checkpoint back` command
- **File:** `.agents/scripts/ledger.cjs`
- **Action:** EDIT
- **Content:** Add command `checkpoint back [tag]` (alias: `cp back`) that:
  1. **Auto-stash first:** If working tree is dirty, run `git stash push -u -m "aicp-rollback-$(date +%s)"`
  2. If `[tag]` provided: checkout that specific tag (`git checkout <tag>`)
  3. If no tag: list available checkpoints and prompt user to specify one
  4. Print: "✅ Rolled back to <tag>" and show stash info if stashed
  5. Add safety check: confirm with user before rolling back (unless `--force` flag provided)
- **Done-check:**
  1. Create test file: `echo "test" > rollback-test.txt`
  2. Save checkpoint: `./l cp save "before rollback test"`
  3. Modify file: `echo "modified" >> rollback-test.txt`
  4. Run: `./l cp back --force aicp/2.2-1` (or latest tag)
  5. Verify: modified changes are stashed, file state is from checkpoint
  6. Clean up: `git stash drop`, delete test file
- **Depends:** 2.2

---

## Step 2.4 — Update AGENTS.md with checkpoint workflow
- **File:** `templates/AGENTS.md`
- **Action:** EDIT
- **Content:** Add new section after "## Rules":
  ```markdown
  ## Checkpoint Workflow
  
  - **After risky changes:** Run `./l cp save "description"` to create recovery point
  - **Before complex refactoring:** Always checkpoint first
  - **On failure:** Use `./l cp back` to recover last known-good state
  - **Checkpoints require validation:** You cannot save a checkpoint if `./l v` fails
  
  Example flow:
  ```
  ./l start 2.3
  # ... make changes ...
  ./l v                          # validate first
  ./l cp save "refactored auth"  # only if validation passes
  ./l c 2.3 "done"
  ```
  ```
- **Done-check:** `cat templates/AGENTS.md | grep "Checkpoint Workflow"` → shows new section
- **Depends:** 2.3

---

## Step 2.5 — Add checkpoint documentation to SYSTEM_GUIDE.md
- **File:** `templates/SYSTEM_GUIDE.md`
- **Action:** EDIT
- **Content:** Add new section before the final section:
  ```markdown
  ## 🔖 Checkpoints
  
  Git-based recovery points that save your progress.
  
  ### Save a checkpoint
  ```bash
  ./l checkpoint save "message"
  ./l cp save "message"           # short alias
  ```
  
  - ✅ Only saves if validation passes
  - 🏷️ Creates tagged commit: `aicp/<step>-<n>`
  - 💾 Full git commit + annotated tag
  
  ### List checkpoints
  ```bash
  ./l cp list
  ```
  
  ### Roll back
  ```bash
  ./l cp back aicp/2.1-1          # to specific checkpoint
  ./l cp back --force aicp/2.1-1  # skip confirmation
  ```
  
  - 🔒 Auto-stashes uncommitted changes
  - ⚠️ Asks for confirmation (unless --force)
  - ⏮️ Returns to exact file state
  
  ### When to checkpoint
  
  - ✅ Before complex refactoring
  - ✅ After completing a risky step
  - ✅ Before trying experimental approach
  - ❌ After every tiny change (too noisy)
  ```
- **Done-check:** `cat templates/SYSTEM_GUIDE.md | grep "🔖 Checkpoints"` → shows new section
- **Depends:** 2.4
