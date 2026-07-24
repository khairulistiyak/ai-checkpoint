#!/usr/bin/env bats

load test_helper

@test "doctor passes in valid project" {
  run ./l doctor
  [ "$status" -eq 0 ]
  [[ "$output" == *"All checks passed"* ]]
}

@test "doctor fails when .agents is missing" {
  rm -rf .agents
  run ./l doctor
  [ "$status" -ne 0 ]
}

@test "validate passes in valid project" {
  run ./l v
  [ "$status" -eq 0 ]
  [[ "$output" == *"Validation passed"* ]]
}
