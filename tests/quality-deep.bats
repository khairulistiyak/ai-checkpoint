#!/usr/bin/env bats

load test_helper

@test "complexity analyzer runs without error" {
  run node -e "
    const { analyzeComplexity } = require(process.env.REPO_DIR + '/packages/core/complexity-analyzer.js');
    const r = analyzeComplexity('.');
    console.log(JSON.stringify(r));
  "
  [ "$status" -eq 0 ]
}

@test "dep-hygiene scanner runs without error" {
  run node -e "
    const { scanDependencyHygiene } = require(process.env.REPO_DIR + '/packages/core/dep-hygiene.js');
    const r = scanDependencyHygiene('.');
    console.log(JSON.stringify(r));
  "
  [ "$status" -eq 0 ]
}

@test "project-config checker runs without error" {
  run node -e "
    const { checkProjectConfig } = require(process.env.REPO_DIR + '/packages/core/project-config-checker.js');
    const r = checkProjectConfig('.');
    console.log(JSON.stringify(r));
  "
  [ "$status" -eq 0 ]
}

@test "quality report includes deep scanner data" {
  run node -e "
    const { generateQualityReport } = require(process.env.REPO_DIR + '/packages/core/quality-report.js');
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
  touch .DS_Store
  run node -e "
    const { cleanStructure } = require(process.env.REPO_DIR + '/packages/core/structure-cleaner.js');
    const r = cleanStructure('.', { dryRun: true });
    console.log(JSON.stringify(r));
  "
  [ "$status" -eq 0 ]
  [[ "$output" == *"would-delete"* ]]
}

@test "hygiene fixer dry-run works" {
  printf 'const x = 1;   \nconst y = 2;\n' > test-hygiene.js
  run node -e "
    const { fixHygiene } = require(process.env.REPO_DIR + '/packages/core/hygiene-fixer.js');
    const r = fixHygiene('.', { dryRun: true });
    console.log(JSON.stringify(r));
  "
  [ "$status" -eq 0 ]
}
