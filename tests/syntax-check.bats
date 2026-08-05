#!/usr/bin/env bats

load test_helper

@test "syntaxCheck passes valid JS file" {
  setup_test_env
  echo "const a = 1;" > test-valid.js
  run node -e "const { syntaxCheck } = require('$CLI_DIR/syntax-checker.js'); const r = syntaxCheck('test-valid.js'); console.log(JSON.stringify(r));"
  [ "$status" -eq 0 ]
  [[ "$output" == *"\"ok\":true"* ]]
}

@test "syntaxCheck fails on invalid JS syntax" {
  setup_test_env
  echo "const a = (" > test-invalid.js
  run node -e "const { syntaxCheck } = require('$CLI_DIR/syntax-checker.js'); const r = syntaxCheck('test-invalid.js'); console.log(JSON.stringify(r));"
  [ "$status" -eq 0 ]
  [[ "$output" == *"\"ok\":false"* ]]
}

@test "syntaxCheck fails on invalid JSON" {
  setup_test_env
  echo "{ invalid: json" > test.json
  run node -e "const { syntaxCheck } = require('$CLI_DIR/syntax-checker.js'); const r = syntaxCheck('test.json'); console.log(JSON.stringify(r));"
  [ "$status" -eq 0 ]
  [[ "$output" == *"\"ok\":false"* ]]
}

@test "syntaxCheck warns on missing import" {
  setup_test_env
  echo "const x = require('./missing-module.js');" > test-import.js
  run node -e "const { syntaxCheck } = require('$CLI_DIR/syntax-checker.js'); const r = syntaxCheck('test-import.js'); console.log(JSON.stringify(r));"
  [ "$status" -eq 0 ]
  [[ "$output" == *"\"ok\":true"* ]]
  [[ "$output" == *"Possibly missing import"* ]]
}

@test "integrity-guard detects unexpected new file" {
  setup_test_env
  mkdir -p packages
  run node -e "const { saveIntegritySnapshot, checkIntegrity } = require('$CLI_DIR/integrity-guard.js'); saveIntegritySnapshot('100.1'); const fs = require('fs'); fs.writeFileSync('packages/test-extra.js', 'a'); const r = checkIntegrity('100.1', 'packages/target.js'); console.log(JSON.stringify(r));"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Unexpected new file"* ]]
}
