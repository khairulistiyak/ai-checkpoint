#!/usr/bin/env bats

load test_helper

@test "start command does not create wildcard or protected files" {
  cat <<EOF > plan/phase-1.md
# Phase 1
## Step 1.1 — Test Wildcard
- **File:** \`path/to/*\`
- **Action:** CREATE
- **Content:** wildcard
- **Done-check:** exit 0

## Step 1.2 — Test Plan File
- **File:** \`plan/my-plan.md\`
- **Action:** CREATE
- **Content:** plan file
- **Done-check:** exit 0

## Step 1.3 — Test Template File
- **File:** \`templates/my-template.json\`
- **Action:** CREATE
- **Content:** template file
- **Done-check:** exit 0
EOF

  cat <<EOF > .agents/PROGRESS.md
# AI Checkpoint
## Project
## 🔷 Phase 1: Test — PENDING
  - [ ] **Step 1.1** — Test Wildcard
  - [ ] **Step 1.2** — Test Plan File
  - [ ] **Step 1.3** — Test Template File
EOF

  run ./l start 1.1
  [ ! -e "path/to/*" ]
  [ ! -d "path/to" ]
  
  run ./l start 1.2
  [ ! -e "plan/my-plan.md" ]
  
  run ./l start 1.3
  [ ! -e "templates/my-template.json" ]
}
