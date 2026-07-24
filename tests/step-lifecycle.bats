#!/usr/bin/env bats

load test_helper

@test "step lifecycle: start, validate, complete" {
  cat <<EOF > plan/phase-1.md
# Phase 1
## Step 1.1 — Test
- **File:** \`test.txt\`
- **Action:** CREATE
- **Content:** test file
- **Done-check:** \`test -f test.txt\` → exit 0
EOF

  run ./l start 1.1
  if [ "$status" -ne 0 ]; then
    echo "START FAILED:" >&3
    echo "$output" >&3
  fi
  [ "$status" -eq 0 ]
  [[ "$output" == *"Step 1.1 initialized"* ]]
  
  echo "test" > test.txt
  
  run ./l v
  if [ "$status" -ne 0 ]; then
    echo "VALIDATE FAILED:" >&3
    echo "$output" >&3
  fi
  [ "$status" -eq 0 ]
  
  run ./l c 1.1 "Completed test"
  if [ "$status" -ne 0 ]; then
    echo "COMPLETE FAILED:" >&3
    echo "$output" >&3
  fi
  [ "$status" -eq 0 ]
  [[ "$output" == *"COMPLETED!"* ]]
  
  run grep "\[x\] \*\*Step 1.1\*\*" .agents/PROGRESS.md
  if [ "$status" -ne 0 ]; then
    echo "GREP FAILED:" >&3
    cat .agents/PROGRESS.md >&3
  fi
  [ "$status" -eq 0 ]
}
