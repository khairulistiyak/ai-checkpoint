# Phase 42: Gate Enforcement

> প্রতিটি step-এ exact কোড দেওয়া আছে। শুধু copy-paste করলেই হবে।
> কোথায় কী আছে এবং কী দিয়ে বদলাবে — সব দেওয়া আছে।

---

### Step 42.1 — Upgrade Complete with Workspace Gate (`packages/cli/cmd-complete.js`)
- **File:** `packages/cli/cmd-complete.js`
- **Action:** EDIT
- **Where (exact line to find):**
```js
const { checkIntegrity } = require('./integrity-guard.js');
```
- **Add AFTER that line:**
```js
let calculateHealth;
try { calculateHealth = require('../core/health-score.js').calculateHealth; } catch { calculateHealth = null; }
```
- **Where (exact lines to find — the block right before `lines[targetStep.lineIndex]`):**
```js
    if (integ.warnings && integ.warnings.length > 0) {
      integ.warnings.forEach(w => log.warn(w));
    }
  }
```
- **Replace with:**
```js
    if (integ.warnings && integ.warnings.length > 0) {
      integ.warnings.forEach(w => log.warn(w));
    }
  }

  if (calculateHealth) {
    const health = calculateHealth(process.cwd());
    if (health.breakdown.syntaxErrors > 0 || health.breakdown.criticalSecurity > 0) {
      console.log(`\n${colors.red}┌${'─'.repeat(74)}┐`);
      console.log(`│ ❌ HEALTH GATE FAILED — Score: ${String(health.score).padEnd(3)} (syntax: ${health.breakdown.syntaxErrors}, critical: ${health.breakdown.criticalSecurity})`.padEnd(75) + "│");
      console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
      process.exit(1);
    }
  }
```
- **Done-check:** `node -e "require('./packages/cli/cmd-complete.js')"` → no error
- **Depends:** 41.2

---

### Step 42.2 — Upgrade Checkpoint with Fortress Gates (`packages/cli/cmd-checkpoint.js`)
- **File:** `packages/cli/cmd-checkpoint.js`
- **Action:** EDIT
- **Where (exact line to find):**
```js
const { validateCommand } = require('./validate.js');
```
- **Add AFTER that line:**
```js
let calculateHealth;
try { calculateHealth = require('../core/health-score.js').calculateHealth; } catch { calculateHealth = null; }
```
- **Where (exact lines to find in checkpointSave — right after `validateCommand();`):**
```js
  validateCommand();
  const step = getCurrentStep();
```
- **Replace with:**
```js
  validateCommand();
  if (calculateHealth) {
    const health = calculateHealth(process.cwd());
    if (health.breakdown.syntaxErrors > 0 || health.breakdown.criticalSecurity > 0) {
      log.error(`Health gate failed (score: ${health.score}). Fix syntax/security issues first.`);
      process.exit(1);
    }
  }
  const step = getCurrentStep();
```
- **Done-check:** `node -e "require('./packages/cli/cmd-checkpoint.js')"` → no error
- **Depends:** 42.1
