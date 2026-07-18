# Walkthrough: Building a TODO CLI

> A complete micro-file monorepo project using ai-checkpoint.

---

## 1. Setup

```bash
mkdir todo-cli && cd todo-cli
git init
curl -fsSL https://raw.githubusercontent.com/khairulistiyak/ai-checkpoint/main/install.sh | bash
```

---

## 2. Create the Plan

```bash
./l new-plan v1-core
```

Edit `plan/v1-core.md` (keep it atomic):

```markdown
## Step 1.1 — Create package.json
- **File:** `package.json`
- **Action:** CREATE
- **Content:**
  ```json
  {
    "name": "todo-cli",
    "main": "index.js",
    "type": "commonjs"
  }
  ```
- **Done-check:** `node -e "require('./package.json')"` → exit 0
- **Depends:** None

## Step 1.2 — Create storage module
- **File:** `packages/core/storage.js`
- **Action:** CREATE
- **Content:**
  ```javascript
  const fs = require('fs');
  exports.load = () => fs.existsSync('db.json') ? JSON.parse(fs.readFileSync('db.json')) : [];
  ```
- **Done-check:** `node -e "require('./packages/core/storage.js').load()"` → exit 0
- **Depends:** 1.1
```

---

## 3. Register in PROGRESS.md

Add to `.agents/PROGRESS.md`:

```markdown
## 🔷 Phase 1: Core Setup — 🔴 0% PENDING

- [ ] **Step 1.1** — Create package.json (`package.json`)
- [ ] **Step 1.2** — Create storage module (`packages/core/storage.js`)
```

---

## 4. Let AI Work

```bash
./l start 1.1
# AI adds package.json and verifies
./l v
./l c 1.1 "init package"

./l start 1.2
# AI writes storage module (< 150 lines)
./l v
./l c 1.2 "add storage"
```

## 5. Checkpoint Progress

```bash
./l cp save "core modules done"
```

✅ Safe! If Step 1.3 breaks the build, ` ./l cp back --force aicp/1.2-1 ` instantly restores the working state.
