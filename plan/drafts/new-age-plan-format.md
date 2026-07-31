# New Age Plan Format — Standard Template

> এই format এখন থেকে সব plan-এ follow করতে হবে।
> Rule: ছোট, clear, কোনো ambiguity নেই — free model ও কাজ করতে পারবে।

---

## কেন এই format?

পুরোনো plans (phase-1 to phase-24) অনেক বড় ছিল। Free/small models:
- বড় plan পড়তে পারে না (context window ছোট)
- ব্যাখ্যা বেশি থাকলে confused হয়
- কোন file কি করতে হবে quickly বুঝে না

**New Age Rule:** প্রতিটা plan 3 section-এ, maximum 80-100 lines।

---

## Template Structure

প্রতিটা plan file-এ **ঠিক 3টা section** থাকবে:

---

### Section 1: 📋 SUMMARY (5-8 lines max)

```markdown
# [Plan Name]

**Goal:** 1 line — কি করতে হবে
**Why:** 1 line — কেন দরকার  
**Files:** কোন files touch হবে (list)
**Risk:** Low / Medium / High
**Steps:** X টা step আছে
```

**Rules:**
- 1 sentence per field
- No paragraphs
- Goal must answer: "কি change হবে?"

---

### Section 2: 📖 STORY (5-10 lines max)

```markdown
## Story

আগে X ছিল → সমস্যা ছিল Y → এখন Z করবো → result হবে W

1. আগে: [current state]
2. সমস্যা: [what's broken/missing]  
3. Fix: [what we'll do]
4. পরে: [what it'll look like after]
```

**Rules:**
- Maximum 4 bullet points
- "আগে → সমস্যা → Fix → পরে" format follow করো
- No technical jargon in story — plain language
- Free model এটা পড়ে context বুঝবে

---

### Section 3: 🔧 MAIN PLAN (steps)

```markdown
## Steps

### X.Y — [Short Title]
- **File:** `exact/path/to/file.js`
- **Do:** [1 line — exactly কি করতে হবে]
- **How:** [2-3 lines max — কিভাবে করবে]
- **Check:** [1 line — কিভাবে verify করবে]

### X.Z — [Next Step]
...
```

**Rules per step:**
- **File** = 1 file only (atomic step)
- **Do** = 1 sentence, verb দিয়ে শুরু (Add/Fix/Remove/Create/Update)
- **How** = Max 3 lines, code snippet optional
- **Check** = 1 line verification command or condition
- No long descriptions, no explanations
- No "Description:" field — it's merged into Do + How

---

## ❌ DON'T (পুরোনো style)

```markdown
### Step 24.2 — Fix `checkpointSave()` — `git add .` missing before commit

- **File:** `packages/cli/cmd-checkpoint.js`
- **Action:** MODIFY
- **Done-check:** `grep -c "git.*add" packages/cli/cmd-checkpoint.js` → ≥ 1
- **Depends:** None

**Description:**
Line 30: `git commit -am` only commits **tracked** files। নতুন files 
(untracked) কখনো checkpoint-এ include হবে না। User যদি নতুন file 
create করে, checkpoint-এ সেটা missing থাকবে।

**Fix:**
(code block with 5+ lines)
```

**Problem:** 15+ lines per step। Free model confused হয়।

---

## ✅ DO (New Age style)

```markdown
### 24.2 — Add git add before checkpoint commit
- **File:** `packages/cli/cmd-checkpoint.js`
- **Do:** Add `git add .` before `git commit` so new files are included
- **How:** Line 30 এ `git commit -am` এর আগে `execFileSync('git', ['add', '.'])` add করো
- **Check:** `grep "git.*add" packages/cli/cmd-checkpoint.js` → found
```

**Result:** 4 lines per step। Free model instantly বুঝবে।

---

## Full Example — Real Plan

```markdown
# Fix Checkpoint Bugs

**Goal:** checkpoint save command-এ 2টা bug fix করো
**Why:** New files miss হচ্ছে, progress bar corrupt হচ্ছে
**Files:** cmd-checkpoint.js, cmd-complete.js
**Risk:** Medium
**Steps:** 3

## Story

1. আগে: `./l cp save` করলে শুধু tracked files commit হতো
2. সমস্যা: নতুন file create করে checkpoint নিলে সেটা save হয় না
3. Fix: commit এর আগে `git add .` যোগ করবো
4. পরে: সব files (নতুন + পুরোনো) checkpoint-এ থাকবে

## Steps

### 1.1 — Add git add before commit
- **File:** `packages/cli/cmd-checkpoint.js`
- **Do:** Add `git add .` before `git commit`
- **How:** Line 30 এ commit এর আগে `execFileSync('git', ['add', '.'], { stdio: 'inherit' })` add করো
- **Check:** `grep "add" packages/cli/cmd-checkpoint.js` → found

### 1.2 — Fix progress bar loop 
- **File:** `packages/cli/cmd-complete.js`
- **Do:** Add `break` after first progress bar match
- **How:** Line 46 loop-এ bar update হলেই `break` দাও, নাহলে duplicate match হয়
- **Check:** `grep "break" packages/cli/cmd-complete.js` → found

### 1.3 — Same fix in block command
- **File:** `packages/cli/cmd-block.js`
- **Do:** Add `break` after first progress bar match
- **How:** Same as 1.2 — progress bar loop-এ `break` add করো
- **Check:** `grep "break" packages/cli/cmd-block.js` → found
```

---

## Checklist — Plan লেখার আগে

- [ ] Summary 8 lines এর মধ্যে?
- [ ] Story 4 bullets format follow করছে?
- [ ] প্রতিটা step 4-5 lines?
- [ ] প্রতিটা step-এ 1 file only?
- [ ] "Do" field verb দিয়ে শুরু?
- [ ] কোনো paragraph/essay নেই?
- [ ] Total plan 100 lines এর মধ্যে?
- [ ] Free model (Gemma 2B) এটা পড়ে execute করতে পারবে?

---

## Size Comparison

| Style | Lines/Step | Total (10 steps) | Free Model? |
|-------|-----------|-------------------|-------------|
| Old (phase 1-23) | 12-20 | 150-200 | ❌ Confused |
| **New Age** | **4-5** | **50-60** | **✅ Works** |

---

> **Golden Rule:** যদি step 5 lines-এ না লেখা যায়, step-টা ভেঙ্গে 2টা step বানাও।
