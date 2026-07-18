# Plan: [Your Plan Name]

> Brief description of what this plan accomplishes.

---

## Step X.1 — [Step Title]
- **File:** `path/to/file.js`
- **Action:** CREATE | EDIT | DELETE
- **Content:**
  [Complete code here, OR single unambiguous instruction]
- **Done-check:** `command to verify` → expected output
- **Depends:** None

---

## Step X.2 — [Next Step Title]
- **File:** `path/to/another-file.js`
- **Action:** CREATE
- **Content:**
  Put the complete working code for this one file here.
- **Done-check:** `node -e "require('./path/to/another-file.js')"` → exit 0
- **Depends:** X.1

---

## Atomic Step Rules (RULE 1)

### DO
- One step = one file = one action
- Include complete code or one clear instruction
- Specify exact file path
- Provide runnable Done-check command
- List dependency step ID

### DON'T
- Use vague words: "appropriately", "as needed", "etc.", "properly"
- Create steps without Done-check
- Touch multiple files in one step
- Write ambiguous instructions

### Done-check Examples
- File exists: `test -f path/to/file.js && echo OK`
- Syntax valid: `node -c path/to/file.js`
- Import works: `node -e "require('./path/file.js')"`
- Test passes: `npm test -- path/to/test.js`
- Build works: `npm run build`
- Grep match: `grep -q "expected text" file.txt && echo OK`
