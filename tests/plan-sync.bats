#!/usr/bin/env bats

load test_helper

@test "sync detects new plan file" {
  setup_test_env
  # Create a plan file with Phase 99
  mkdir -p plan
  cat > plan/test-plan.md << 'EOF'
# Test Plan

## Phase 99: Test Phase

### Step 99.1 — Test step one (`test-file.js`)
- **File:** `test-file.js`
- **Action:** Create
- **Depends:** None
- **Done-check:** `node -c test-file.js`
EOF

  run node -e "const { syncPlansToProgress } = require('$CLI_DIR/plan-sync.js'); const r = syncPlansToProgress(); console.log(JSON.stringify(r));"
  [ "$status" -eq 0 ]
  [[ "$output" == *"99"* ]]

  # Verify PROGRESS.md was updated
  grep -q "Phase 99" .agents/PROGRESS.md
}

@test "sync skips existing phases" {
  setup_test_env
  # Create a plan file with Phase 1 (already exists)
  mkdir -p plan
  cat > plan/existing.md << 'EOF'
## Phase 1: Already Exists

### Step 1.1 — Already done (`test.js`)
- **File:** `test.js`
- **Action:** Create
- **Depends:** None
- **Done-check:** `node -c test.js`
EOF

  run node -e "const { syncPlansToProgress } = require('$CLI_DIR/plan-sync.js'); const r = syncPlansToProgress(); console.log(JSON.stringify(r));"
  [ "$status" -eq 0 ]
  [[ "$output" == *"skipped"* ]]
}

@test "sync command runs without error" {
  setup_test_env
  run node -e "const { syncCommand } = require('$CLI_DIR/cmd-sync.js'); syncCommand();"
  [ "$status" -eq 0 ]
}
