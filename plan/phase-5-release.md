# Phase 5 — Release

> Final testing, versioning, and launch to the community.

---

## Step 5.1 — Dogfood on ai-checkpoint itself
- **File:** `plan/dogfood-test.md`
- **Action:** CREATE
- **Content:**
  ```markdown
  # Dogfooding Test Plan
  
  > Test ai-checkpoint by using it to track one phase of its own development.
  
  ## Test Scenario
  Pick one small enhancement (e.g., add color to error messages) and:
  
  1. Create plan with `./l new-plan color-errors`
  2. Write 3-5 atomic steps following RULE 1
  3. Execute steps using `./l start`, `./l v`, `./l c`
  4. Create checkpoint with `./l cp save`
  5. Intentionally break something and test `./l cp back`
  6. Verify validation catches 150-line violations
  
  ## Success Criteria
  - [ ] All CLI commands work without errors
  - [ ] Dashboard updates correctly after each step
  - [ ] Validation catches file size violations
  - [ ] Checkpoint rollback restores exact state
  - [ ] No friction or confusion during workflow
  
  ## Duration
  Run for 1 week minimum, document any rough edges.
  
  ## Issues Found
  (Log issues here as they're discovered)
  ```
- **Done-check:** `test -f plan/dogfood-test.md && grep -q "Success Criteria" plan/dogfood-test.md && echo OK`
- **Depends:** None

---

## Step 5.2 — Create version tagging script
- **File:** `scripts/release.sh`
- **Action:** CREATE
- **Content:**
  ```bash
  #!/bin/bash
  # Release script for ai-checkpoint
  
  set -euo pipefail
  
  if [ $# -ne 1 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 1.0.0"
    exit 1
  fi
  
  VERSION="$1"
  
  # Validate version format (semver)
  if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Version must be in format X.Y.Z"
    exit 1
  fi
  
  echo "🏷️  Preparing release v$VERSION"
  
  # Check working tree is clean
  if ! git diff-index --quiet HEAD --; then
    echo "Error: Working tree has uncommitted changes"
    exit 1
  fi
  
  # Update CHANGELOG.md
  TODAY=$(date +%Y-%m-%d)
  sed -i.bak "s/## \[Unreleased\]/## [Unreleased]\n\n## [$VERSION] — $TODAY/" CHANGELOG.md
  rm CHANGELOG.md.bak
  
  # Commit and tag
  git add CHANGELOG.md
  git commit -m "Release v$VERSION"
  git tag -a "v$VERSION" -m "Release v$VERSION"
  
  echo "✅ Release v$VERSION created"
  echo ""
  echo "Next steps:"
  echo "  git push origin main"
  echo "  git push origin v$VERSION"
  echo "  Create GitHub release at: https://github.com/USER/ai-checkpoint/releases/new?tag=v$VERSION"
  ```
- **Done-check:** `test -x scripts/release.sh && bash -n scripts/release.sh && echo OK`
- **Depends:** 5.1

---

## Step 5.3 — Create GitHub release template
- **File:** `.github/RELEASE_TEMPLATE.md`
- **Action:** CREATE
- **Content:**
  ```markdown
  # ai-checkpoint v{VERSION}
  
  > Git-based progress tracking for AI-assisted development — now production-ready.
  
  ## 🎯 What's New
  
  - **Checkpoint System**: Save and rollback to any point with `./l cp save`
  - **Validation**: Real enforcement of 150-line limit and atomic steps
  - **RULE 0 & RULE 1**: Micro-file architecture + atomic step format
  - **Zero Ambiguity**: Plans so clear even tiny models can't fail
  - **One-line Install**: `curl -fsSL https://raw.githubusercontent.com/USER/ai-checkpoint/main/install.sh | bash`
  
  ## 📦 Installation
  
  ```bash
  # Install globally
  curl -fsSL https://raw.githubusercontent.com/USER/ai-checkpoint/main/install.sh | bash
  
  # Or clone directly
  git clone https://github.com/USER/ai-checkpoint.git
  cd your-project
  bash /path/to/ai-checkpoint/setup.sh
  ```
  
  ## 🚀 Quick Start
  
  ```bash
  ./l new-plan my-feature        # Create atomic plan
  ./l                            # View dashboard
  ./l start 1.1                  # Execute step
  ./l cp save "checkpoint name"  # Save progress
  ```
  
  ## 📚 Documentation
  
  - [60-Second Quickstart](README.md#-60-second-quickstart)
  - [Complete Walkthrough](examples/walkthrough.md)
  - [Atomic Plan Example](examples/atomic-plan-example.md)
  
  ## 🐛 Known Issues
  
  None reported yet. Please [open an issue](https://github.com/USER/ai-checkpoint/issues) if you find any.
  
  ## 💬 Feedback
  
  Built for developers using free-tier AI models. If something's confusing or broken, we want to know.
  
  ---
  
  **Full Changelog**: https://github.com/USER/ai-checkpoint/blob/main/CHANGELOG.md
  ```
- **Done-check:** `test -f .github/RELEASE_TEMPLATE.md && grep -q "Checkpoint System" .github/RELEASE_TEMPLATE.md && echo OK`
- **Depends:** 5.2

---

## Step 5.4 — Create launch checklist
- **File:** `plan/launch-checklist.md`
- **Action:** CREATE
- **Content:**
  ```markdown
  # Launch Checklist for v1.0.0
  
  ## Pre-Launch (Complete Before Release)
  
  - [ ] All Phase 1-4 steps completed and validated
  - [ ] Dogfooding complete (1 week minimum on real project)
  - [ ] All tests pass (shellcheck, manual testing)
  - [ ] README.md accurate and complete
  - [ ] CHANGELOG.md updated with all changes
  - [ ] Examples verified working
  - [ ] install.sh tested on fresh system
  - [ ] GitHub repo has proper description and topics
  - [ ] LICENSE file present (MIT)
  - [ ] social-preview.png set as repo image
  
  ## Release Day
  
  - [ ] Run `bash scripts/release.sh 1.0.0`
  - [ ] Push to GitHub: `git push origin main && git push origin v1.0.0`
  - [ ] Create GitHub release using `.github/RELEASE_TEMPLATE.md`
  - [ ] Test install from GitHub: `curl -fsSL https://raw.githubusercontent.com/USER/ai-checkpoint/main/install.sh | bash`
  
  ## Launch Posts
  
  ### Show HN (Hacker News)
  **Title:** "ai-checkpoint – Progress tracking for AI-assisted coding with free-tier models"
  
  **Text:**
  ```
  I built this after watching free-tier AI models (Gemini Flash, GPT-4o-mini) 
  get lost in multi-step projects. Two rules fix it:
  
  RULE 0: Files must be <150 lines (enforced)
  RULE 1: Steps must be atomic with runnable verification
  
  Small context windows work great when you give them small, clear tasks.
  
  The checkpoint system (git-based) means you can experiment without fear.
  Rollback is one command.
  
  Built it for myself, now using it to build everything else. Curious what 
  others think — especially those stuck with free models.
  
  GitHub: [link]
  Live demo: [gif/video of ./l dashboard]
  ```
  
  ### r/LocalLLaMA (Reddit)
  **Title:** "[Tool] ai-checkpoint: Make free-tier models reliable with micro-files + atomic steps"
  
  **Text:**
  ```
  Fed up with Claude-3.5-Haiku and Gemini-2.0-Flash hallucinating on 
  multi-step projects, I built a system that breaks work into tiny, 
  verifiable pieces.
  
  Key ideas:
  - 150-line file limit (hard enforced)
  - Atomic steps with runnable checks
  - Git-based checkpoints for rollback
  - Zero ambiguity plans
  
  Small models + small context + small tasks = actually works.
  
  Repo: [link]
  Examples: [link to walkthrough]
  
  Been dogfooding for a week, curious if this helps others with 
  constrained models.
  ```
  
  ### Twitter/X Thread
  ```
  1/ Just shipped ai-checkpoint v1.0 — a system for making free-tier AI 
  models actually reliable on multi-step coding projects 🧵
  
  2/ Problem: Small models (GPT-4o-mini, Gemini Flash) work great for 
  single tasks but lose the plot on multi-step work. They guess. They 
  hallucinate. They break things.
  
  3/ Root cause: Context windows are small, so files must be small too. 
  Solution: Hard 150-line limit + auto-validation. No more god files.
  
  4/ Plus atomic steps: every step has ONE file, ONE action, ONE 
  verifiable check. Model either passes or blocks — no guessing.
  
  5/ Git-based checkpoints mean experiments are free. Break something? 
  `./l cp back` — instant recovery.
  
  6/ Using it to build everything now. Small models feel surprisingly 
  competent when you structure the work right.
  
  7/ MIT licensed, designed for free-tier users: [link]
  ```
  
  ## Post-Launch (First Week)
  
  - [ ] Monitor GitHub issues
  - [ ] Respond to HN/Reddit comments within 24h
  - [ ] Collect feedback on friction points
  - [ ] Document common questions → add to FAQ
  - [ ] Plan v1.1 based on feedback
  
  ## Success Metrics (30 days)
  
  - 50+ GitHub stars
  - 5+ issues/PRs from community
  - 3+ positive testimonials
  - Used successfully by at least 10 people
  ```
- **Done-check:** `test -f plan/launch-checklist.md && grep -q "Show HN" plan/launch-checklist.md && echo OK`
- **Depends:** 5.3

---

## Step 5.5 — Update package repository URLs
- **File:** `install.sh`
- **Action:** EDIT
- **Content:** Update line 6 with actual GitHub username:
  ```bash
  REPO_URL="https://github.com/YOUR-ACTUAL-USERNAME/ai-checkpoint"
  ```
  (Replace YOUR-ACTUAL-USERNAME with real username before release)
- **Done-check:** `grep -q "REPO_URL=" install.sh && echo OK`
- **Depends:** 5.4

---

## Step 5.6 — Final validation run
- **File:** `scripts/pre-release-check.sh`
- **Action:** CREATE
- **Content:**
  ```bash
  #!/bin/bash
  # Pre-release validation — run before tagging
  
  set -e
  
  echo "🔍 Running pre-release checks..."
  echo ""
  
  # 1. Shell scripts pass shellcheck
  echo "1. ShellCheck..."
  shellcheck setup.sh install.sh scripts/*.sh || exit 1
  echo "   ✅ Pass"
  
  # 2. All templates exist
  echo "2. Templates..."
  for f in AGENTS.md PROGRESS.md RULES.md SYSTEM_GUIDE.md PLAN_TEMPLATE.md; do
    test -f "templates/$f" || { echo "Missing templates/$f"; exit 1; }
  done
  echo "   ✅ Pass"
  
  # 3. Examples exist
  echo "3. Examples..."
  test -f examples/atomic-plan-example.md || exit 1
  test -f examples/walkthrough.md || exit 1
  echo "   ✅ Pass"
  
  # 4. CLI exists
  echo "4. CLI..."
  test -f scripts/ledger.cjs || exit 1
  node -c scripts/ledger.cjs || exit 1
  echo "   ✅ Pass"
  
  # 5. Documentation
  echo "5. Documentation..."
  grep -q "60-Second Quickstart" README.md || exit 1
  grep -q "Unreleased" CHANGELOG.md || exit 1
  echo "   ✅ Pass"
  
  # 6. Test setup in clean directory
  echo "6. Setup test..."
  TESTDIR=$(mktemp -d)
  cd "$TESTDIR"
  git init --quiet
  bash "$OLDPWD/setup.sh" > /dev/null 2>&1 || { echo "Setup failed"; exit 1; }
  test -f "./l" || exit 1
  test -d ".agents" || exit 1
  cd "$OLDPWD"
  rm -rf "$TESTDIR"
  echo "   ✅ Pass"
  
  echo ""
  echo "✅ All checks passed!"
  echo "Ready for release."
  ```
- **Done-check:** `test -x scripts/pre-release-check.sh && bash -n scripts/pre-release-check.sh && echo OK`
- **Depends:** 5.5
