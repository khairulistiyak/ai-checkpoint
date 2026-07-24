#!/usr/bin/env bats

load test_helper

@test "validate fails on files over 150 lines" {
  cat <<EOF > plan/phase-1.md
# Phase 1
## Step 1.1 — Test
- **File:** \`large.txt\`
- **Action:** CREATE
- **Content:** test file
- **Done-check:** \`test -f large.txt\` → exit 0
EOF

  run ./l start 1.1
  [ "$status" -eq 0 ]
  
  # Create a file with 200 non-comment lines
  for i in {1..200}; do
    echo "line \$i" >> large.txt
  done
  
  run ./l v
  if [ "$status" -eq 0 ]; then
    echo "VALIDATE PASSED WHEN IT SHOULD HAVE FAILED:" >&3
    echo "$output" >&3
  fi
  [ "$status" -ne 0 ]
  [[ "$output" == *"large.txt exceeds 150 lines (200 lines)"* ]]
}
