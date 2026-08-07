#!/usr/bin/env bats

load test_helper

@test "health command runs without error" {
  run ./l health
  [ "$status" -eq 0 ]
  [[ "$output" == *"Health"* ]] || [[ "$output" == *"Score"* ]] || [[ "$output" == *"score"* ]]
}

@test "health --json returns valid JSON" {
  run ./l health --json
  [ "$status" -eq 0 ]
  echo "$output" | node -e "JSON.parse(require('fs').readFileSync(0,'utf8'))"
}

@test "health score is a number between 0 and 100" {
  run ./l health --json
  [ "$status" -eq 0 ]
  local score
  score=$(echo "$output" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.score)")
  [ "$score" -ge 0 ]
  [ "$score" -le 100 ]
}
