# 🛡️ AI Error Prevention System — "Zero Error" Feature

AI tool ব্যবহার করলে প্রজেক্টে কোনো error না থাকে — সেটা নিশ্চিত করার জন্য **৩টি শক্তিশালী সেফটি লেয়ার** যোগ করব CLI-তে।

---

## সমস্যা কী?

AI (Claude, GPT, Gemini) কোড লেখার সময় প্রায়ই এই ভুলগুলো করে:
1. **Syntax Error** — ভুল JavaScript/JSX লেখে
2. **Broken Imports** — এমন ফাইল বা প্যাকেজ `import` করে যা exist করে না
3. **Accidental File Corruption** — নিজের target ফাইল ছাড়া অন্য ফাইল ভুলে নষ্ট করে
4. **Empty/Truncated Files** — ফাইল লিখতে গিয়ে অর্ধেক রেখে দেয়

এখনকার `./l c` (complete) কমান্ডে `validateCommand()` আর `verifyTargetFile()` চলে, কিন্তু এগুলো শুধু **ফাইল আছে কিনা** চেক করে — **কোড সঠিক কিনা** চেক করে না।

---

## Phase 37: AI Error Prevention System

### Step 37.1 — Create syntax checker module (`packages/cli/syntax-checker.js`)
- **File:** `packages/cli/syntax-checker.js`
- **Action:** Create
- **Depends:** None
- **Done-check:** `node -c packages/cli/syntax-checker.js`

ফাইলের extension দেখে automatic syntax check করবে:

| Extension | Check Method |
|-----------|-------------|
| `.js`, `.cjs`, `.mjs` | `node -c file.js` (Node.js built-in syntax check) |
| `.jsx`, `.tsx`, `.ts` | Balanced bracket check + basic parse |
| `.json` | `JSON.parse()` validation |
| `.sh`, `.bash` | `bash -n file.sh` (bash syntax check) |
| `.css` | Balanced `{}` bracket check |
| `.md` | Skip (always pass) |

---

### Step 37.2 — Create integrity guard module (`packages/cli/integrity-guard.js`)
- **File:** `packages/cli/integrity-guard.js`
- **Action:** Create
- **Depends:** 37.1
- **Done-check:** `node -c packages/cli/integrity-guard.js`

Step শুরু হওয়ার সময় সব ফাইলের hash snapshot নেবে। Complete করার সময় চেক করবে যে AI শুধু target file-ই পরিবর্তন করেছে — অন্য কিছু accidentally নষ্ট হয়নি।

**Snapshot ফাইল:** `.agents/.integrity-snapshot.json`
```json
{
  "step": "1.1",
  "timestamp": "2026-08-03T10:00:00Z",
  "files": {
    "src/App.jsx": "abc123hash",
    "src/utils/api.js": "def456hash"
  }
}
```

---

### Step 37.3 — Integrate syntax check into cmd-complete.js (`packages/cli/cmd-complete.js`)
- **File:** `packages/cli/cmd-complete.js`
- **Action:** Modify
- **Depends:** 37.1
- **Done-check:** `node -c packages/cli/cmd-complete.js`

Complete flow-তে নতুন চেক যোগ হবে:
```
validateCommand() → verifyTargetFile() → syntaxCheck() → checkImports() → checkIntegrity() → ✅ Complete
```

---

### Step 37.4 — Integrate integrity snapshot into cmd-start.js (`packages/cli/cmd-start.js`)
- **File:** `packages/cli/cmd-start.js`
- **Action:** Modify
- **Depends:** 37.2
- **Done-check:** `node -c packages/cli/cmd-start.js`

Start flow-তে integrity snapshot save যোগ হবে:
```
startCommand() → ... → saveIntegritySnapshot() → ✅ Step initialized
```

---

### Step 37.5 — Add tests for syntax checker (`tests/syntax-check.bats`)
- **File:** `tests/syntax-check.bats`
- **Action:** Create
- **Depends:** 37.3, 37.4
- **Done-check:** `npx bats tests/syntax-check.bats`

টেস্ট কেস:
1. ভালো `.js` ফাইল → pass
2. ভুল syntax `.js` → block
3. ভুল `.json` → block
4. Missing import → warning (block না)
5. Unexpected file change → warning

---

### Step 37.6 — Update CLI help and README (`packages/cli/index.js`)
- **File:** `packages/cli/index.js`
- **Action:** Modify
- **Depends:** 37.5
- **Done-check:** `node -c packages/cli/index.js`

Help text-এ নতুন feature document করা:
```
./l c <step> "note"    Step complete করো (with syntax check ✅)
```
