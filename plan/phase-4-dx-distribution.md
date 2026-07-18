# Phase 4 — DX & Distribution

> Polish the developer experience and make installation friction-free.

---

## Step 4.1 — Make setup.sh idempotent
- **File:** `setup.sh`
- **Action:** EDIT
- **Content:** Add check at the beginning (after the header, before folder creation):
  ```bash
  # Check if already installed
  if [ -f "$PROJECT_DIR/l" ] && [ -d "$PROJECT_DIR/.agents" ]; then
    echo -e "${YELLOW}⚠ ai-checkpoint already installed in this directory${NC}"
    echo -e "${CYAN}Re-run will update system files but preserve your data${NC}"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Cancelled."
      exit 0
    fi
  fi
  ```
  Test by running setup.sh twice in same directory.
- **Done-check:** 
  1. `cd /tmp && mkdir test-idempotent && cd test-idempotent`
  2. Run setup twice: `bash /Volumes/SSD/0.1/ai-checkpoint/setup.sh && bash /Volumes/SSD/0.1/ai-checkpoint/setup.sh`
  3. Second run prompts for confirmation
  4. Clean up: `rm -rf /tmp/test-idempotent`
- **Depends:** None

---

## Step 4.2 — Create install.sh (curl installer)
- **File:** `install.sh`
- **Action:** CREATE
- **Content:**
  ```bash
  #!/bin/bash
  # One-line installer for ai-checkpoint
  # Usage: curl -fsSL https://raw.githubusercontent.com/USER/ai-checkpoint/main/install.sh | bash
  
  set -euo pipefail
  
  REPO_URL="https://github.com/USER/ai-checkpoint"
  INSTALL_DIR="$HOME/.ai-checkpoint"
  
  echo "📦 Installing ai-checkpoint..."
  
  # Clone or update repo
  if [ -d "$INSTALL_DIR" ]; then
    echo "Updating existing installation..."
    cd "$INSTALL_DIR" && git pull --quiet
  else
    echo "Downloading ai-checkpoint..."
    git clone --quiet --depth 1 "$REPO_URL" "$INSTALL_DIR"
  fi
  
  # Run setup in current project
  cd "$(pwd)"
  bash "$INSTALL_DIR/setup.sh"
  
  echo ""
  echo "✅ Installation complete!"
  echo "Run: ./l"
  ```
- **Done-check:** `test -f install.sh && head -1 install.sh | grep -q "#!/bin/bash" && echo OK`
- **Depends:** 4.1

---

## Step 4.3 — Add comprehensive examples/walkthrough.md
- **File:** `examples/walkthrough.md`
- **Action:** CREATE
- **Content:**
  ```markdown
  # Complete Walkthrough — Building a TODO CLI

  > Shows ai-checkpoint in action with a real micro-file monorepo project.

  ---

  ## Setup

  ```bash
  mkdir todo-cli && cd todo-cli
  git init
  bash /path/to/ai-checkpoint/setup.sh
  ```

  ---

  ## Create Your Plan

  ```bash
  ./l new-plan todo-cli-v1
  ```

  Edit `plan/todo-cli-v1.md`:

  ```markdown
  # Plan: TODO CLI v1

  ## Step 1.1 — Create package.json
  - **File:** `package.json`
  - **Action:** CREATE
  - **Content:**
    ```json
    {
      "name": "todo-cli",
      "version": "1.0.0",
      "main": "index.js",
      "scripts": {
        "test": "node --test"
      }
    }
    ```
  - **Done-check:** `node -e "require('./package.json')" && echo OK`
  - **Depends:** None

  ## Step 1.2 — Create task storage module
  - **File:** `packages/core/storage.js`
  - **Action:** CREATE
  - **Content:**
    ```javascript
    const fs = require('fs');
    const path = require('path');
    
    const DB_FILE = path.join(__dirname, '../../data/tasks.json');
    
    function load() {
      if (!fs.existsSync(DB_FILE)) return [];
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
    
    function save(tasks) {
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
    }
    
    module.exports = { load, save };
    ```
  - **Done-check:** `node -e "const s=require('./packages/core/storage.js'); s.save([{id:1}]); console.log(s.load().length)"` → prints "1"
  - **Depends:** 1.1
  ```

  ---

  ## Update PROGRESS.md

  Copy steps from your plan to `.agents/PROGRESS.md`:

  ```markdown
  ## 🔷 Phase 1: Core Setup — 🔴 0% PENDING

  - [ ] **Step 1.1** — Create package.json (`package.json`)
  - [ ] **Step 1.2** — Create task storage module (`packages/core/storage.js`)
  ```

  ---

  ## Execute Steps

  ### Step 1.1
  ```bash
  ./l start 1.1
  # AI creates package.json
  # AI runs done-check
  ./l v        # validate passes
  ./l c 1.1 "initialized project"
  ```

  Dashboard now shows:
  ```
  ✅ Step 1.1 Complete
  👉 Next: Step 1.2
  ```

  ### Step 1.2
  ```bash
  ./l start 1.2
  # AI creates packages/core/storage.js (132 lines — under 150 limit!)
  # AI runs done-check
  ./l v        # validation checks file exists + line count
  ./l c 1.2 "added storage"
  ```

  ---

  ## Checkpoint After Risky Work

  ```bash
  ./l cp save "core storage complete"
  ```

  Now tagged as `aicp/1.2-1` — can rollback anytime.

  ---

  ## Continue Building

  Add more steps following RULE 1 format:
  - 1.3: CLI argument parser (≤150 lines)
  - 1.4: Add task command (≤150 lines)
  - 1.5: List tasks command (≤150 lines)
  - 1.6: Main entry point barrel (≤150 lines)

  Each file does ONE thing. No 500-line god files.

  ---

  ## Final Structure

  ```
  todo-cli/
  ├── .agents/
  │   ├── PROGRESS.md          (6/6 steps ✅)
  │   ├── RULES.md
  │   └── scripts/
  ├── plan/
  │   └── todo-cli-v1.md
  ├── packages/
  │   ├── core/
  │   │   ├── storage.js       (132 lines)
  │   │   └── index.js         (15 lines — barrel)
  │   └── cli/
  │       ├── parse-args.js    (98 lines)
  │       ├── cmd-add.js       (67 lines)
  │       ├── cmd-list.js      (54 lines)
  │       └── index.js         (22 lines — barrel)
  ├── index.js                 (41 lines — entry)
  ├── package.json
  └── data/
      └── tasks.json
  ```

  Every file under 150 lines ✅  
  Every module focused ✅  
  AI never confused about structure ✅

  ---

  ## What Made This Work

  1. **Atomic plans** — AI had zero ambiguity
  2. **Micro-files** — Each step fit in small model's context
  3. **Done-checks** — AI verified its own work
  4. **Validation** — Caught line-limit violations immediately
  5. **Checkpoints** — Could experiment without fear

  ## Try It Yourself

  Use this exact pattern for your next project. The smaller your files, the smarter your AI appears.
  ```
- **Done-check:** `test -f examples/walkthrough.md && wc -l examples/walkthrough.md` → shows line count (should be less than 250 lines)
- **Depends:** 4.2

---

## Step 4.4 — Add shellcheck CI workflow
- **File:** `.github/workflows/shellcheck.yml`
- **Action:** CREATE
- **Content:**
  ```yaml
  name: ShellCheck
  
  on:
    push:
      branches: [ main, develop ]
    pull_request:
      branches: [ main ]
  
  jobs:
    shellcheck:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        
        - name: Run ShellCheck
          uses: ludeeus/action-shellcheck@master
          with:
            scandir: '.'
            severity: warning
            ignore_paths: node_modules .git
  ```
- **Done-check:** `test -f .github/workflows/shellcheck.yml && grep -q "ShellCheck" .github/workflows/shellcheck.yml && echo OK`
- **Depends:** 4.3

---

## Step 4.5 — Create CHANGELOG.md
- **File:** `CHANGELOG.md`
- **Action:** CREATE
- **Content:**
  ```markdown
  # Changelog

  All notable changes to ai-checkpoint will be documented in this file.

  The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
  and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

  ## [Unreleased]

  ### Added
  - Core hardening: CLI safety, doctor command, real validation
  - Checkpoint system: save, list, rollback with git tags
  - RULE 0: Micro-File Monorepo architecture enforcement
  - RULE 1: Atomic Step Format for zero-ambiguity plans
  - Plan templates and `./l new-plan` command
  - Strict agent loop with 2-strike blocking
  - 150-line file limit validation
  - Comprehensive examples and walkthrough
  - One-line curl installer
  - CI with ShellCheck

  ### Changed
  - AGENTS.md: strict loop with Done-check enforcement
  - RULES.md: added RULE 0 and RULE 1
  - setup.sh: idempotent with confirmation
  - Templates: production-grade guidance

  ### Fixed
  - Path quoting in shell scripts
  - Validation actually validates now

  ## [0.1.0] — 2026-07-11

  ### Added
  - Initial release
  - Basic CLI (`./l`)
  - Template system
  - Progress tracking
  - Simple dashboard

  [Unreleased]: https://github.com/USER/ai-checkpoint/compare/v0.1.0...HEAD
  [0.1.0]: https://github.com/USER/ai-checkpoint/releases/tag/v0.1.0
  ```
- **Done-check:** `test -f CHANGELOG.md && grep -q "Unreleased" CHANGELOG.md && echo OK`
- **Depends:** 4.4

---

## Step 4.6 — Update README.md with quickstart
- **File:** `README.md`
- **Action:** EDIT
- **Content:** Add section after the header/description:
  ```markdown
  
  ## 🚀 60-Second Quickstart

  ```bash
  # 1. Install (one-time global setup)
  curl -fsSL https://raw.githubusercontent.com/USER/ai-checkpoint/main/install.sh | bash

  # 2. In your project
  cd your-project
  bash ~/.ai-checkpoint/setup.sh

  # 3. Create a plan
  ./l new-plan my-feature

  # 4. Edit plan/my-feature.md (follow the template)

  # 5. Add steps to .agents/PROGRESS.md

  # 6. Let AI work
  ./l                    # view dashboard
  ./l start 1.1          # AI starts step
  ./l v                  # validate
  ./l c 1.1 "done"       # complete step

  # 7. Checkpoint your progress
  ./l cp save "feature complete"
  ```

  ## 🎯 Core Concepts

  ### RULE 0: Micro-File Monorepo
  - One file = one job (max 150 lines)
  - Small files = small context = fewer AI errors
  - Validation enforces this automatically

  ### RULE 1: Atomic Steps
  - Every step is unambiguous: File + Action + Done-check
  - AI can't guess — it either works or blocks
  - See `examples/atomic-plan-example.md`

  ### Recovery System
  - `./l cp save "msg"` — git-based checkpoints
  - `./l cp back` — instant rollback
  - Never lose working state

  ## 📚 Learn More

  - [Complete Walkthrough](examples/walkthrough.md) — Build a TODO CLI
  - [Atomic Plan Example](examples/atomic-plan-example.md) — Perfect format
  - [System Guide](templates/SYSTEM_GUIDE.md) — Full CLI reference
  ```
- **Done-check:** `grep -q "60-Second Quickstart" README.md && echo OK`
- **Depends:** 4.5
