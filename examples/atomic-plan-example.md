# Example: Atomic Plan for Date Formatter

> Shows perfect RULE 1 compliance. Small models succeed when plans look like this.

---

## Step 1.1 — Create date formatter utility
- **File:** `packages/utils/format-date.js`
- **Action:** CREATE
- **Content:**
  ```javascript
  /**
   * Format date to YYYY-MM-DD
   * @param {Date} date
   * @returns {string}
   */
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  module.exports = formatDate;
  ```
- **Done-check:** `node -e "const f=require('./packages/utils/format-date.js'); console.log(f(new Date('2026-07-18')))"` → prints "2026-07-18"
- **Depends:** None

---

## Step 1.2 — Export from utils barrel
- **File:** `packages/utils/index.js`
- **Action:** EDIT
- **Content:** Add `exports.formatDate = require('./format-date');`
- **Done-check:** `node -e "const {formatDate} = require('./packages/utils'); console.log(typeof formatDate)"` → prints "function"
- **Depends:** 1.1

---

## Why This Works

- **No ambiguity:** Every step has one correct implementation.
- **Full code:** The model doesn't guess structure or logic.
- **Verifiable:** The Done-check command proves it worked instantly.
- **Atomic scope:** Fits in small context windows seamlessly.
- **Traceable chain:** Depends shows order clearly.

## ❌ Bad Example (Do Not Use)

```markdown
### Step 1.1 — Add date utilities
- **File:** `utils/date.js`
- **Action:** CREATE
- **Content:** Create date formatting and parsing utilities as needed. Ensure they handle edge cases appropriately.
- **Done-check:** Make sure it works
- **Depends:** None
```

**Why it fails:**
- "as needed" / "appropriately" = ambiguous, forces guessing.
- "Make sure it works" = not a runnable command.
- Misses expected output completely.
