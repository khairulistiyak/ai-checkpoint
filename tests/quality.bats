#!/usr/bin/env bats

load test_helper

setup() {
  create_test_project
}

teardown() {
  cleanup_test_project
}

@test "quality command runs without error" {
  cd "$TEST_PROJECT"
  run node ../../packages/cli/index.js quality
  [ "$status" -eq 0 ]
  [[ "$output" == *"Quality"* ]] || [[ "$output" == *"Score"* ]] || [[ "$output" == *"score"* ]]
}

@test "quality --json returns valid JSON" {
  cd "$TEST_PROJECT"
  run node ../../packages/cli/index.js quality --json
  [ "$status" -eq 0 ]
  echo "$output" | node -e "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'))"
}

@test "quality detects junk files" {
  cd "$TEST_PROJECT"
  touch .DS_Store
  run node ../../packages/cli/index.js quality --json
  [ "$status" -eq 0 ]
  local issues
  issues=$(echo "$output" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.issues.length)")
  [ "$issues" -gt 0 ]
}
