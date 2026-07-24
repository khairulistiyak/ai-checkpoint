setup() {
  export ORIGINAL_PWD="$PWD"
  export PROJECT_DIR="$(mktemp -d)"
  export REPO_DIR="$ORIGINAL_PWD"
  
  cd "$PROJECT_DIR"
  git init -b main >/dev/null 2>&1
  git config user.name "Test User"
  git config user.email "test@example.com"
  git commit --allow-empty -m "Initial commit" >/dev/null 2>&1
  
  # Run setup.sh from the repository root
  bash "$REPO_DIR/setup.sh" >/dev/null

  # Create a mock valid project state
  echo "# Phase 1" > plan/phase-1.md
  echo "## Step 1.1 — Test" >> plan/phase-1.md
  echo "- **File:** \`test.txt\`" >> plan/phase-1.md
  echo "# AI Checkpoint" > .agents/PROGRESS.md
  echo "## Project" >> .agents/PROGRESS.md
  echo "## 🔷 Phase 1: Test — PENDING" >> .agents/PROGRESS.md
  echo "  - [ ] **Step 1.1** — Test" >> .agents/PROGRESS.md
}

teardown() {
  cd "$ORIGINAL_PWD"
  rm -rf "$PROJECT_DIR"
}
