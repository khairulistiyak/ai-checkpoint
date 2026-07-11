# 🧠 Checkpoint-Based Task Ledger

> AI Agent দিয়ে project execution — structured, tracked, resumable.

**Clean Structure**: System files `.agents/` এ, `plan/` folder শুধু তোমার `.md` files।

---

## ✨ Features

- 📂 **Clean plan/ folder** — শুধু তোমার plan files, system files আলাদা
- 📊 **Visual Dashboard** — progress board with percentages
- 🔄 **Resumable** — যেকোনো সময় থামো, পরে শুরু করো
- ✅ **Auto-Verify** — step complete করার আগে file check
- 📋 **Dynamic Plan Names** — যেকোনো নামে `.md` file
- 📝 **Drafts Folder** — R&D notes, agent auto-execute করে না
- 🤖 **Agent-Agnostic** — Gemini, GPT, Claude, Copilot — সব কাজ করে

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/checkpoint-task-ledger.git

# 2. Go to your project
cd /path/to/your-project

# 3. Install
bash /path/to/checkpoint-task-ledger/setup.sh

# 4. Done!
./l        # Dashboard
./l h      # Help
```

---

## 📁 What Gets Installed

```
your-project/
├── .agents/                       ← 🔧 System (agent manages this)
│   ├── AGENTS.md                  ← Workflow rules (auto-loaded)
│   ├── PROGRESS.md                ← Tracker (কোথায় আছি)
│   ├── RULES.md                   ← Coding rules
│   ├── SYSTEM_GUIDE.md            ← Guide
│   └── scripts/
│       └── ledger.cjs             ← CLI tool
│
├── plan/                          ← 📝 CLEAN! শুধু তোমার files
│   ├── my-feature.md              ← তোমার plan (যেকোনো নাম!)
│   ├── bugfix-auth.md             ← আরেকটা plan
│   └── drafts/                    ← R&D notes
│       └── ideas.md
│
├── l                              ← ⚡ Shortcut (./l)
└── src/                           ← তোমার code
```

**Key Point**: `plan/` folder একদম clean — শুধু তোমার `.md` plan files।
System files সব `.agents/` এ লুকানো।

---

## 📋 Commands

| Command | কি করে |
|---------|--------|
| `./l` | 📊 Dashboard |
| `./l start 2.1` | ▶️ Step শুরু |
| `./l c 2.1 "note"` | ✅ Step complete |
| `./l v` | 🔍 Validate |
| `./l h` | ❓ Help |

---

## 📋 Plan File Naming

`plan/` folder এ যেকোনো নামে `.md` file রাখো:

```
plan/
├── bugfix-upload.md         ← meaningful name ✅
├── add-dark-mode.md         ← descriptive name ✅
├── plan_01.md               ← generic name (OK)
└── drafts/
    └── random-idea.md       ← R&D notes
```

---

## 🔄 Workflow

```
1. Install করো       → bash setup.sh
2. Plan বানাও        → plan/my-plan.md
3. Steps add করো     → .agents/PROGRESS.md
4. কাজ শুরু          → ./l start 1.1
5. কাজ শেষ           → ./l c 1.1 "done"
6. 🔁 Repeat until ✅
```

---

## 📦 This Repo

```
checkpoint-task-ledger/
├── README.md              ← এই file
├── setup.sh               ← Installer
├── .gitignore
├── scripts/
│   └── ledger.cjs         ← CLI v5.0
├── templates/             ← Template files
│   ├── AGENTS.md
│   ├── PROGRESS.md
│   ├── RULES.md
│   ├── SYSTEM_GUIDE.md
│   └── drafts-README.md
└── examples/
    └── example-plan.md
```

---

## 📄 License

MIT — Use freely, share freely.
