# System Guide

> How the Checkpoint Task Ledger works.

---

## Structure

```
.agents/          ← System (agent reads these)
├── PROGRESS.md   ← Where we are
├── RULES.md      ← How to code
├── AGENTS.md     ← How to work
└── scripts/      ← CLI tool

plan/             ← Your plans (clean folder)
├── *.md          ← Step-by-step plans
└── drafts/       ← Notes & ideas
```

## Flow

```
New Session
    ↓
Read PROGRESS.md → know what's done
    ↓
Read RULES.md → know conventions
    ↓
Read plan/*.md → get step details
    ↓
Do the work → create/edit files
    ↓
./l c X.Y "note" → mark complete
    ↓
Repeat ↑
```

## CLI

| Command | Does |
|---------|------|
| `./l` | Show dashboard |
| `./l start 1.1` | Begin step |
| `./l c 1.1 "msg"` | Complete step |
| `./l v` | Validate sync |
| `./l cp save "msg"` | Save validated checkpoint |
| `./l cp list` | List checkpoints |
| `./l cp back --force aicp/2.1-1` | Restore checkpoint |

## 🔖 Checkpoints

Git-based recovery points save validated project state.

### Save

```bash
./l checkpoint save "message"
./l cp save "message"
```

Validation must pass. The command commits tracked changes and creates an annotated `aicp/<step>-<n>` tag.

### List

```bash
./l cp list
```

### Roll Back

```bash
./l cp back --force aicp/2.1-1
```

Dirty tracked and untracked files are auto-stashed first. The tagged tree is restored without switching branches. Restore stashed work with `git stash pop`.
