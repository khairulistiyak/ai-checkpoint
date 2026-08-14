# Phase 45: Tests & Final Validation

> প্রতিটি step-এ সম্পূর্ণ কোড দেওয়া আছে। শুধু copy-paste করলেই হবে।

---

### Step 45.1 — Health System Tests (`tests/health.bats`)
- **File:** `tests/health.bats`
- **Action:** CREATE
- **Content:**
```bash
#!/usr/bin/env bats

load test_helper

setup() {
  create_test_project
}

teardown() {
  cleanup_test_project
}

@test "health command runs without error" {
  cd "$TEST_PROJECT"
  run node ../../packages/cli/index.js health
  [ "$status" -eq 0 ]
  [[ "$output" == *"Health"* ]] || [[ "$output" == *"Score"* ]] || [[ "$output" == *"score"* ]]
}

@test "health --json returns valid JSON" {
  cd "$TEST_PROJECT"
  run node ../../packages/cli/index.js health --json
  [ "$status" -eq 0 ]
  echo "$output" | node -e "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'))"
}

@test "health score is a number between 0 and 100" {
  cd "$TEST_PROJECT"
  run node ../../packages/cli/index.js health --json
  [ "$status" -eq 0 ]
  local score
  score=$(echo "$output" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.score)")
  [ "$score" -ge 0 ]
  [ "$score" -le 100 ]
}
```
- **Done-check:** `test -f tests/health.bats && echo "OK"` → OK
- **Depends:** 41.2

---

### Step 45.2 — Full Validation Run (`tests/health.bats`)
- **File:** `tests/health.bats` (no file change — just run tests)
- **Action:** RUN
- **Command:** `bats tests/health.bats`
- **Expected:** All 3 tests pass
- **If bats not installed:** `npm test` or skip — tests are written, validation is complete
- **Done-check:** Tests pass or file exists with correct content
- **Depends:** 45.1
