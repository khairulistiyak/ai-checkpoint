# 🧠 Checkpoint-Based Task Ledger

> AI Agent দিয়ে project execution — structured, tracked, resumable.

**যেকোনো AI model** (Gemini, GPT, Claude, Copilot) কে organized রাখতে এই system ব্যবহার করো। Agent ভুলে যাবে না কোথায় ছিল, steps skip করবে না, আর progress track হবে automatically।

---

## ✨ Features

- 📊 **Visual Dashboard** — progress board with percentages
- 🔄 **Resumable** — যেকোনো সময় থামো, পরে আবার শুরু করো
- ✅ **Auto-Verify** — step complete করার আগে file exist/content check
- 📋 **Dynamic Plan Files** — যেকোনো নামে `.md` plan file
- 📝 **Drafts Folder** — R&D notes, ideas — agent auto-execute করে না
- 🤖 **Agent-Agnostic** — যেকোনো AI model কাজ করতে পারবে
- ⚡ **One-Command Setup** — `bash setup.sh` দিলেই install

---

## 🚀 Quick Start

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/checkpoint-task-ledger.git
```

### 2. Go to your project
```bash
cd /path/to/your-project
```

### 3. Install
```bash
bash /path/to/checkpoint-task-ledger/setup.sh
```

### 4. Done! 🎉
```bash
./l        # Dashboard দেখো
./l h      # Help দেখো
```

---

## 📁 What Gets Installed

```
your-project/
├── .agents/
│   ├── AGENTS.md              ← 🤖 Agent workflow rules (auto-loaded)
│   └── scripts/
│       └── ledger.cjs         ← ⚙️ CLI tool
├── plan/
│   ├── PROGRESS.md            ← 🔴 Tracker (কোথায় আছি)
│   ├── RULES.md               ← ⚠️ Coding rules
│   ├── SYSTEM_GUIDE.md        ← 📖 Guide
│   ├── steps/                 ← 📋 Plan files (যেকোনো নাম.md)
│   └── drafts/                ← 📝 R&D notes (free-form)
└── l                          ← ⚡ Shortcut (./l)
```

---

## 📋 Commands

| Command | কি করে |
|---------|--------|
| `./l` | 📊 Dashboard — progress board দেখাও |
| `./l start 2.1` | ▶️ Step 2.1 শুরু করো (file create + mark running) |
| `./l c 2.1 "note"` | ✅ Step 2.1 complete (auto-verify + update log) |
| `./l v` | 🔍 Validate — plan/progress sync check |
| `./l h` | ❓ Help menu |

---

## 📋 Plan File Naming

`plan/steps/` folder এ যেকোনো নামে `.md` file রাখো:

```
plan/steps/
├── plan_01.md                    ← generic name (OK)
├── bugfix-upload-feature.md      ← meaningful name ✅
├── add-dark-mode.md              ← descriptive name ✅
└── refactor-sidebar.md           ← any-name-works.md ✅
```

CLI automatically সব `.md` file scan করে step খুঁজে বের করে। কোনো hardcoded filename নেই!

---

## 📝 Drafts — R&D Notes

`plan/drafts/` এ যেকোনো notes রাখো — agent নিজে থেকে execute করবে না:

```
plan/drafts/
├── feature-idea.md           ← তোমার idea
├── api-research.md           ← research notes
├── color-palette.md          ← design notes
└── anything.md               ← যা ইচ্ছা!
```

Agent কে বললে পড়বে: *"drafts/feature-idea.md পড়ো এবং implement করো"*

---

## 🔄 Workflow

```
1. Plan বানাও     → plan/steps/my-plan.md
2. Steps add করো  → plan/PROGRESS.md
3. কাজ শুরু       → ./l start 1.1
4. কাজ শেষ        → ./l c 1.1 "done note"
5. পরের step      → ./l start 1.2
6. 🔁 Repeat until ✅ TASK COMPLETE ALL
```

---

## 🤖 Works With

| AI Tool | Support |
|---------|---------|
| Google Gemini (Antigravity) | ✅ Full (auto-loads AGENTS.md) |
| GitHub Copilot | ✅ Full (reads plan/) |
| ChatGPT / GPT-4 | ✅ Manual (paste AGENTS.md) |
| Claude | ✅ Manual (paste AGENTS.md) |
| Cursor AI | ✅ Full (reads .agents/) |
| Any AI with file access | ✅ Works |

---

## 📦 Repo Structure

```
checkpoint-task-ledger/
├── README.md              ← এই file
├── setup.sh               ← One-command installer
├── .gitignore
├── scripts/
│   └── ledger.cjs         ← CLI tool (v4.0 — dynamic)
├── templates/
│   ├── PROGRESS.md        ← Progress tracker template
│   ├── RULES.md           ← Code rules template
│   ├── SYSTEM_GUIDE.md    ← System guide template
│   ├── AGENTS.md          ← Agent rules template
│   └── drafts-README.md   ← Drafts folder README
└── examples/
    └── example-plan.md    ← Example plan file
```

---

## 📄 License

MIT — Use freely, modify freely, share freely.

---

Made with 🧠 by [Your Name]
