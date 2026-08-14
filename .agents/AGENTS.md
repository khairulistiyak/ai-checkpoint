# Agent Workflow Rules

> Auto-loaded every session. Tells the AI agent how to work.

---

## Before Starting Any Work

1. Read `.agents/SYSTEM_GUIDE.md` — **পুরো প্রজেক্ট বোঝো** (structure, rules, module system)
2. Read `.agents/PROGRESS.md` — know what's done and what's next
3. Read `.agents/RULES.md` — know the coding conventions
4. Find the next pending step in `plan/*.md`
5. Start working

---

## Critical Rules (সবচেয়ে গুরুত্বপূর্ণ)

- **packages/ = CommonJS** → `require()` / `module.exports` ব্যবহার করো
- **dashboard/ = ESM** → `import` / `export` ব্যবহার করো
- **electron/ = CommonJS** → `require()` / `module.exports` ব্যবহার করো
- **কখনো মেশাবে না!** CommonJS ফাইলে `import` লিখলে crash করবে
- প্রতি ফাইল সর্বোচ্চ **150 lines**

---

## Step Workflow Rules

- **1 step = 1 file** — finish one before starting the next
- **Start**: `./l start X.Y` — creates files, marks running
- **Complete**: `./l c X.Y "note"` — verifies, marks done
- **Never skip** steps or redo completed ones
- **Never auto-execute** files in `plan/drafts/`
- **On error**: fix in the same step, don't create new ones

---

## After Each Step

Report to the user:
```
✅ Step X.Y Complete — [title]
📁 File: [path]
📊 Progress: X/Y steps
👉 Next: Step X.Y — [title]
```

---

## Quick Reference

| কাজ | কমান্ড |
|---|---|
| Status দেখো | `./l` |
| Step শুরু করো | `./l start X.Y` |
| Step complete করো | `./l c X.Y "note"` |
| Validate করো | `./l v` |
| Health check | `./l doctor` |
| Dashboard চালাও | `cd dashboard && npm run dev` |
