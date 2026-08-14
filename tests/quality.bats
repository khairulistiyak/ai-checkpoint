#!/usr/bin/env bats

load test_helper

@test "quality command runs without error" {
  run ./l quality
  [ "$status" -eq 0 ]
  [[ "$output" == *"Quality"* ]] || [[ "$output" == *"Score"* ]] || [[ "$output" == *"score"* ]]
}

@test "quality --json returns valid JSON" {
  run ./l quality --json
  [ "$status" -eq 0 ]
  echo "$output" | node -e "JSON.parse(require('fs').readFileSync(0,'utf8'))"
}

@test "quality detects junk files" {
  touch .DS_Store
  run ./l quality --json
  [ "$status" -eq 0 ]
  local issues
  issues=$(echo "$output" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.issues.length)")
  [ "$issues" -gt 0 ]
}
