# Phase 43: Watch Mode & Templates

> প্রতিটি step-এ exact কোড দেওয়া আছে। শুধু copy-paste করলেই হবে।

---

### Step 43.1 — Upgrade Watch with In-Flight Guards (`packages/cli/cmd-watch.js`)
- **File:** `packages/cli/cmd-watch.js`
- **Action:** EDIT (full file replace — file is only 25 lines)
- **Content (full file):**
```js
const fs = require('fs');
const { statusCommand } = require('./cmd-status.js');
const { PROGRESS_PATH } = require('./paths.js');

let calculateHealth;
try { calculateHealth = require('../core/health-score.js').calculateHealth; } catch { calculateHealth = null; }

function watchCommand() {
  console.clear();
  statusCommand();

  if (calculateHealth) {
    const health = calculateHealth(process.cwd());
    const status = health.passed ? '✅ HEALTHY' : `⚠️ Score: ${health.score}/100`;
    console.log(`\n  🛡️ Health: ${status}\n`);
  }

  let debounceTimer = null;
  const watcher = fs.watch(PROGRESS_PATH, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.clear();
      statusCommand();
      if (calculateHealth) {
        const health = calculateHealth(process.cwd());
        const status = health.passed ? '✅ HEALTHY' : `⚠️ Score: ${health.score}/100`;
        console.log(`\n  🛡️ Health: ${status}\n`);
      }
    }, 100);
  });

  process.on('SIGINT', () => {
    watcher.close();
    process.exit(0);
  });
}

module.exports = { watchCommand };
```
- **Done-check:** `node -e "require('./packages/cli/cmd-watch.js')"` → no error
- **Depends:** None

---

### Step 43.2 — Add Zero-Error Protocol to AGENTS.md (`templates/AGENTS.md`)
- **File:** `templates/AGENTS.md`
- **Action:** EDIT
- **Where (exact lines to find — the "Checkpoints" section):**
```
## Checkpoints
```
- **Add BEFORE that line (a new section):**
```markdown
## Zero-Error Protocol

- Before completing any step, the health gate must pass.
- If `./l health` shows syntax errors or critical security issues, fix them first.
- Never complete a step with health score below 60.
- Run `./l health` after every 3 completed steps to catch regressions.

```
- **Done-check:** `grep "Zero-Error Protocol" templates/AGENTS.md` → shows the line
- **Depends:** 43.1

---

### Step 43.3 — Add Rule 3 to RULES.md (`templates/RULES.md`)
- **File:** `templates/RULES.md`
- **Action:** EDIT
- **Where (exact lines to find — end of RULE 2 section, the last `---` before Project Settings):**
```
---

## Project Settings
```
- **Replace with:**
```markdown
---

## RULE 3 — Zero-Error Health Gate

1. **Health Score**: Every project must maintain a health score of 60+ at all times.
2. **Syntax Gate**: `./l c` (complete) blocks if workspace has syntax errors.
3. **Security Gate**: `./l cp save` blocks if workspace has critical security issues.
4. **Monitoring**: Run `./l health` regularly to track project health.
5. **Auto-Fix**: Use `./l health --json` for programmatic checks in CI/CD.

---

## Project Settings
```
- **Done-check:** `grep "RULE 3" templates/RULES.md` → shows the line
- **Depends:** 43.2
