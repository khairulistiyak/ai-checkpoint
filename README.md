<div align="center">

# 🧠 Checkpoint Task Ledger

**A portable CLI system for AI-assisted project execution with progress tracking.**

Stop your AI agent from forgetting where it left off.

[![Version](https://img.shields.io/badge/version-5.0-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org)

</div>

---

## The Problem

When using AI coding assistants (Gemini, GPT, Claude, Copilot) for multi-step projects:

- 🔁 They **redo completed work** after context resets
- ⏭️ They **skip steps** or lose track of progress  
- 🧠 They **forget project rules** between sessions
- 📊 There's **no clear progress tracking**

## The Solution

A lightweight CLI + markdown system that gives any AI agent:

- ✅ A **progress tracker** it reads first every session
- 📋 **Step-by-step plans** with exact instructions
- ⚠️ **Coding rules** specific to your project
- 🔒 **Auto-verification** before marking steps complete

---

## Quick Start

```bash
# Clone this repo
git clone https://github.com/YOUR_USERNAME/checkpoint-task-ledger.git

# Go to your project
cd ~/my-project

# Install (one command!)
bash ~/checkpoint-task-ledger/setup.sh

# See dashboard
./l
```

That's it. Your project now has the ledger system.

---

## What Gets Installed

```
your-project/
│
├── .agents/                    ← System files (hidden)
│   ├── AGENTS.md               │  Agent workflow rules
│   ├── PROGRESS.md             │  Progress tracker
│   ├── RULES.md                │  Coding conventions
│   └── scripts/ledger.cjs      │  CLI engine
│
├── plan/                       ← Your plans (clean!)
│   ├── my-feature.md           │  Any name works
│   └── drafts/                 │  Notes & ideas
│
└── l                           ← CLI shortcut
```

> **Design**: `plan/` folder stays clean — only your `.md` files.  
> All system files live in `.agents/`.

---

## Commands

```bash
./l                    # Dashboard
./l start 1.1          # Begin a step
./l c 1.1 "done msg"   # Complete a step
./l v                  # Validate sync
./l h                  # Help
```

### Dashboard Preview

```
┌──────────────────────────────────────────────────────┐
│ LEDGER PROGRESS BOARD                                │
└──────────────────────────────────────────────────────┘

🟢 Phase 1: Setup            [████████████] COMPLETE
┌──────────────────────────────────────────────────────┐
│ 🟡 Phase 2: Components     [██████░░░░░░] 50% ACTIVE │
├──────────────────────────────────────────────────────┤
│    [✓] Step 2.1 — Button component                   │
│    [/] Step 2.2 — Dropdown menu                      │
│    [ ] Step 2.3 — Modal dialog                       │
└──────────────────────────────────────────────────────┘
⚪ Phase 3: Testing          [░░░░░░░░░░░░] PENDING

│ OVERALL: [████████░░░░░░░░░░░░] 40% (4/10)           │
│ 👉 NEXT: Step 2.2 — Dropdown menu                    │
```

---

## How It Works

### 1. Create a Plan

Add a `.md` file to `plan/` with any name:

```markdown
<!-- plan/add-auth.md -->

## Phase 1: Setup

### Step 1.1 — Create auth types (`src/types/auth.ts`)

**File**: `src/types/auth.ts`
**Action**: Create

**Details**:
- User interface with id, email, role
- AuthState type

**✅ Done**: File exists with exported types
```

### 2. Register Steps

Add matching entries to `.agents/PROGRESS.md`:

```markdown
## 🔷 Phase 1: Setup — 🔴 0% PENDING

- [ ] **Step 1.1** — Create auth types (`src/types/auth.ts`)
```

### 3. Work

```bash
./l start 1.1          # Creates file + marks [~] running
# ... do the work ...
./l c 1.1 "Types done" # Verifies file + marks [x] complete
```

### 4. Resume Anytime

Open a new AI session → agent reads `.agents/PROGRESS.md` → knows exactly where to continue.

---

## Plan Files

Name your plans however you want:

```
plan/
├── bugfix-sidebar.md        ✅ Descriptive
├── add-dark-mode.md         ✅ Feature-based
├── sprint-3-tasks.md        ✅ Sprint-based
├── plan_01.md               ✅ Generic
└── drafts/
    └── research-notes.md    📝 Not auto-executed
```

> **Drafts rule**: Files in `plan/drafts/` are never auto-executed.  
> The agent only reads them when you explicitly ask.

---

## Works With

| AI Tool | How |
|---------|-----|
| **Gemini** (Antigravity/Code Assist) | Auto-loads `.agents/AGENTS.md` |
| **Cursor AI** | Reads `.agents/` directory |
| **GitHub Copilot** | Reads `plan/` files in context |
| **ChatGPT / Claude** | Paste `.agents/AGENTS.md` content |
| **Any AI** with file access | Just point it to `PROGRESS.md` |

---

## Auto-Verification

When you run `./l c 1.1 "done"`, the CLI automatically:

1. ✅ Checks the target file **exists**
2. ✅ Checks it's **not empty** (> 10 bytes)
3. ✅ Updates progress **percentage**
4. ✅ Writes to the **update log**
5. ✅ Advances the **NEXT pointer**

If verification fails → step stays incomplete. No false progress.

---

## File Reference

| File | Location | Purpose |
|------|----------|---------|
| `AGENTS.md` | `.agents/` | How the agent should work |
| `PROGRESS.md` | `.agents/` | What's done, what's next |
| `RULES.md` | `.agents/` | Project coding rules |
| `*.md` | `plan/` | Your step-by-step plans |
| `*.md` | `plan/drafts/` | Notes (not auto-executed) |
| `ledger.cjs` | `.agents/scripts/` | CLI engine |

---

## Requirements

- **Node.js** ≥ 16
- **Any OS** — macOS, Linux, Windows (Git Bash / WSL)
- **No dependencies** — zero `npm install` needed

---

## License

MIT — free to use, modify, and share.
