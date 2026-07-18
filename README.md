<div align="center">

<img src="https://img.shields.io/badge/%F0%9F%A7%A0-ai--checkpoint-blueviolet?style=for-the-badge&labelColor=1a1b27" alt="ai-checkpoint" />

# ai-checkpoint

**Your AI forgets. This doesn't.**

A zero-dependency CLI that tracks progress across AI coding sessions.  
Works with Gemini, GPT, Claude, Copilot — any AI with file access.

[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A516-brightgreen?style=flat-square)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=flat-square)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#contributing)

[Install](#install) · [How it Works](#how-it-works) · [Commands](#commands) · [Examples](#examples)

</div>

## 60-Second Quickstart

```bash
mkdir my-project && cd my-project
git init
curl -fsSL https://raw.githubusercontent.com/khairulistiyak/ai-checkpoint/main/install.sh | bash

./l new-plan my-feature
# Edit plan/my-feature.md using its atomic-step template.
# Copy its steps into .agents/PROGRESS.md.
./l start 1.1
./l v
./l c 1.1 "done"
./l cp save "feature complete"
```

### RULE 0: Micro-Files

One file has one job and stays within 150 effective lines. Import modules through their `index.js` barrel.

### RULE 1: Atomic Steps

Every plan step declares exactly one File, Action, Content, Done-check, and Depends value. Ambiguous work is a BLOCKED step, not a guess.

### Recovery

`./l cp save "message"` saves a validated Git checkpoint. `./l cp list` displays tags. `./l cp back --force <tag>` restores a checkpoint after auto-stashing local work.

- [Walkthrough](examples/walkthrough.md)
- [Atomic plan example](examples/atomic-plan-example.md)
- [System guide](templates/SYSTEM_GUIDE.md)

---

## Why?

AI coding assistants lose context between sessions. On multi-step projects, they:

- 🔁 **Redo** completed work
- ⏭️ **Skip** steps  
- 🧠 **Forget** project conventions
- 📊 **Can't track** progress

**ai-checkpoint** fixes this with a simple markdown + CLI system that any AI can read.

---

## Install

```bash
git clone https://github.com/khairulistiyak/ai-checkpoint.git
cd ~/my-project
bash ~/ai-checkpoint/setup.sh
```

Done. Run `./l` to see the dashboard.

---

## What Gets Created

```
your-project/
│
├── .agents/                ← System (auto-managed)
│   ├── AGENTS.md            ← How the AI should work
│   ├── PROGRESS.md          ← What's done, what's next
│   ├── RULES.md             ← Project coding rules
│   └── scripts/ledger.cjs   ← CLI engine
│
├── plan/                   ← Your plans (clean folder)
│   └── drafts/              ← Scratch notes
│
└── l                       ← CLI shortcut
```

`plan/` starts empty. You add `.md` plan files with any name you want.

---

## How it Works

```
1. You write a plan          →  plan/add-auth.md
2. You register steps        →  .agents/PROGRESS.md
3. AI reads progress first   →  knows exactly where to resume
4. AI does the work          →  creates/edits files
5. CLI marks it done         →  ./l c 1.1 "done"
6. Repeat                    →  until ✅ complete
```

The AI reads `PROGRESS.md` at the start of every session. It always knows what's done and what's next.

---

## Commands

```bash
./l                     # Show dashboard
./l start 1.1           # Begin a step (creates files, marks running)
./l c 1.1 "msg"         # Complete step (verifies file, updates progress)
./l v                   # Validate plan ↔ progress sync
./l h                   # Help
```

### Dashboard

```
┌──────────────────────────────────────────────────────┐
│ LEDGER PROGRESS BOARD                                │
└──────────────────────────────────────────────────────┘

 🟢 Phase 1: Setup               [████████████] COMPLETE
┌──────────────────────────────────────────────────────┐
│ 🟡 Phase 2: Components         [██████░░░░░░] 50%    │
├──────────────────────────────────────────────────────┤
│    [✓] Step 2.1 — Button component                   │
│    [/] Step 2.2 — Dropdown menu                      │
│    [ ] Step 2.3 — Modal dialog                       │
└──────────────────────────────────────────────────────┘
 ⚪ Phase 3: Testing             [░░░░░░░░░░░░] PENDING

┌──────────────────────────────────────────────────────┐
│ OVERALL: [████████░░░░░░░░░░░░] 40% (4/10)           │
│ 👉 NEXT: Step 2.2 — Dropdown menu                    │
└──────────────────────────────────────────────────────┘
```

---

## Examples

### Plan File

Create `plan/add-auth.md`:

```markdown
## Phase 1: Auth Setup

### Step 1.1 — User types (`src/types/user.ts`)

**File**: `src/types/user.ts`
**Action**: Create
**Details**: User interface with id, email, role fields.
**✅ Done**: File exists with exported types.

### Step 1.2 — Auth hook (`src/hooks/useAuth.ts`)

**File**: `src/hooks/useAuth.ts`
**Action**: Create
**Details**: Login, logout, getCurrentUser functions.
**✅ Done**: Hook exports all 3 functions.
```

### Progress File

Register steps in `.agents/PROGRESS.md`:

```markdown
## 🔷 Phase 1: Auth Setup — 🔴 0% PENDING

- [ ] **Step 1.1** — User types (`src/types/user.ts`)
- [ ] **Step 1.2** — Auth hook (`src/hooks/useAuth.ts`)
```

### Workflow

```bash
./l start 1.1           # Creates src/types/user.ts with boilerplate
# ... AI writes the code ...
./l c 1.1 "User types"  # ✅ Verified & marked done
./l start 1.2           # Next step
```

---

## Auto-Verification

When completing a step, the CLI automatically:

1. Checks the target file **exists**
2. Checks it's **not empty**
3. Updates **progress percentage**
4. Writes to the **update log**  
5. Advances the **NEXT pointer**

No false progress. If verification fails, the step stays incomplete.

---

## Works With Any AI

| Tool | Setup |
|------|-------|
| **Gemini** / Antigravity | Auto-loads `.agents/AGENTS.md` |
| **Cursor AI** | Reads `.agents/` automatically |
| **GitHub Copilot** | Include files in context |
| **ChatGPT / Claude** | Paste `PROGRESS.md` content |
| **Any AI** | Point it to `.agents/PROGRESS.md` |

---

## Requirements

- **Node.js** ≥ 16
- **Zero npm dependencies**
- Works on macOS, Linux, Windows (WSL/Git Bash)

---

## Contributing

PRs welcome! Feel free to:

- Add new template types
- Improve the dashboard UI
- Add integrations (VS Code extension, npm package)
- Fix bugs

---

## License

[MIT](LICENSE) — use freely, modify freely, share freely.

<div align="center">
<br>

**Built for developers who use AI to build things.**

<sub>If this helped you, consider giving it a ⭐</sub>

</div>
