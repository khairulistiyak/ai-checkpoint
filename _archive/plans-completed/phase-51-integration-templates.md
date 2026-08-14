# Phase 51: Integration & Templates

> প্রতিটি step-এ exact কোড দেওয়া আছে। শুধু copy-paste করলেই হবে।

---

### Step 51.1 — Add Quality Gate to Complete Command (`packages/cli/cmd-complete.js`)
- **File:** `packages/cli/cmd-complete.js`
- **Action:** EDIT
- **Where (exact line to find):**
```js
let calculateHealth;
try { calculateHealth = require('../core/health-score.js').calculateHealth; } catch { calculateHealth = null; }
```
- **Add AFTER that line:**
```js
let generateQualityReport;
try { generateQualityReport = require('../core/quality-report.js').generateQualityReport; } catch { generateQualityReport = null; }
```
- **Where (exact lines to find — the health gate block ending with `process.exit(1);` and closing `}` `}`):**
Find this block inside `completeCommand`:
```js
  if (calculateHealth) {
    const health = calculateHealth(process.cwd());
    if (health.breakdown.syntaxErrors > 0 || health.breakdown.criticalSecurity > 0) {
```
- **Add AFTER the closing `}` of the `if (calculateHealth)` block:**
```js

  if (generateQualityReport) {
    const quality = generateQualityReport(process.cwd());
    if (quality.score < 40) {
      log.warn(`Quality score is ${quality.score}/100 — consider running ./l quality`);
    }
  }
```
- **Done-check:** `node -e "require('./packages/cli/cmd-complete.js')"` → no error
- **Depends:** 49.2

---

### Step 51.2 — Add Rule 4 Clean Code Policy to RULES.md (`templates/RULES.md`)
- **File:** `templates/RULES.md`
- **Action:** EDIT
- **Where (exact lines to find — end of RULE 3 section, the last line before `## Project Settings`):**
```
---

## Project Settings
```
- **Replace with:**
```markdown
---

## RULE 4 — Clean Code Policy

1. **No Junk Files**: Remove `.DS_Store`, `.bak`, `.tmp`, `backup.js`, `old.js` and similar garbage.
2. **No Generic Names**: Never name files `utils.js`, `helpers.js`, or `misc.js`. Use descriptive names like `format-date.js`.
3. **No Debug Leftovers**: Remove `console.log` and `debugger` before completing a step.
4. **No TODO in Production**: Resolve all `TODO`, `FIXME`, `HACK`, `XXX` comments before release.
5. **Quality Gate**: Run `./l quality` to check. Score must be 80+ for release.

---

## Project Settings
```
- **Done-check:** `grep "RULE 4" templates/RULES.md` → shows the line
- **Depends:** 51.1

---

### Step 51.3 — Quality Tests (`tests/quality.bats`)
- **File:** `tests/quality.bats`
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
```
- **Done-check:** `test -f tests/quality.bats && echo "OK"` → OK
- **Depends:** 51.2
