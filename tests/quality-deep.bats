#!/usr/bin/env bats

load test_helper

setup() {
  create_test_project
}

teardown() {
  cleanup_test_project
}

@test "complexity analyzer runs without error" {
  cd "$TEST_PROJECT"
  run node -e "
    const { analyzeComplexity } = require('../../packages/core/complexity-analyzer.js');
    const r = analyzeComplexity('.');
    console.log(JSON.stringify(r));
  "
  [ "$status" -eq 0 ]
}

@test "dep-hygiene scanner runs without error" {
  cd "$TEST_PROJECT"
  run node -e "
    const { scanDependencyHygiene } = require('../../packages/core/dep-hygiene.js');
    const r = scanDependencyHygiene('.');
    console.log(JSON.stringify(r));
  "
  [ "$status" -eq 0 ]
}

@test "project-config checker runs without error" {
  cd "$TEST_PROJECT"
  run node -e "
    const { checkProjectConfig } = require('../../packages/core/project-config-checker.js');
    const r = checkProjectConfig('.');
    console.log(JSON.stringify(r));
  "
  [ "$status" -eq 0 ]
}

@test "quality report includes deep scanner data" {
  cd "$TEST_PROJECT"
  run node -e "
    const { generateQualityReport } = require('../../packages/core/quality-report.js');
    const r = generateQualityReport('.');
    if (typeof r.breakdown.complexityIssues !== 'number') process.exit(1);
    if (typeof r.breakdown.dependencyIssues !== 'number') process.exit(1);
    if (typeof r.breakdown.configIssues !== 'number') process.exit(1);
    console.log('OK');
  "
  [ "$status" -eq 0 ]
  [[ "$output" == *"OK"* ]]
}

@test "structure cleaner dry-run works" {
  cd "$TEST_PROJECT"
  touch .DS_Store
  run node -e "
    const { cleanStructure } = require('../../packages/core/structure-cleaner.js');
    const r = cleanStructure('.', { dryRun: true });
    console.log(JSON.stringify(r));
  "
  [ "$status" -eq 0 ]
  [[ "$output" == *"would-delete"* ]]
}

@test "hygiene fixer dry-run works" {
  cd "$TEST_PROJECT"
  # Create a file with trailing whitespace
  printf 'const x = 1;   \nconst y = 2;\n' > test-hygiene.js
  run node -e "
    const { fixHygiene } = require('../../packages/core/hygiene-fixer.js');
    const r = fixHygiene('.', { dryRun: true });
    console.log(JSON.stringify(r));
  "
  [ "$status" -eq 0 ]
}
