# Agent Workflow Rules

> Auto-loaded every session. Tells the AI agent how to work.

---

## Before Starting Any Work

1. Read `.agents/PROGRESS.md` — know what's done and what's next
2. Read `.agents/RULES.md` — know the coding conventions
3. Find the next pending step in `plan/*.md`
4. Start working

---

## Rules

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
