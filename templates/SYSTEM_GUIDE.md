# 📖 System Guide — Checkpoint-Based Task Ledger

## কেন এই System?

AI agents (Gemini, GPT, Claude) দিয়ে প্রজেক্ট করতে গেলে common সমস্যা:
- Agent ভুলে যায় কোথায় ছিল
- একই কাজ আবার করে
- Steps skip করে
- Context হারায়

**Checkpoint-Based Task Ledger** এই সমস্যা সমাধান করে।

---

## 📁 System Architecture

```
your-project/
├── .agents/
│   └── AGENTS.md           ← 🤖 Auto-loaded workflow rules (HOW to work)
├── plan/
│   ├── PROGRESS.md         ← 🔴 Progress tracker (WHERE we are) — READ FIRST
│   ├── RULES.md            ← ⚠️ Code rules (WHAT conventions to follow)
│   ├── SYSTEM_GUIDE.md     ← 📖 This guide (WHY this system works)
│   ├── steps/              ← 📋 Execution plans (step-by-step instructions)
│   │   ├── plan_01.md                    ← Default plan (generic name OK)
│   │   ├── bugfix-feature-name.md        ← Meaningful name ✅ PREFERRED
│   │   └── refactor-component.md         ← Meaningful name ✅ PREFERRED
│   └── drafts/             ← 📝 R&D / Notes / Ideas (free-form scratch pad)
│       ├── README.md
│       └── *.md                          ← যেকোনো নামে যেকোনো file
├── src/
│   └── ...
```

### Architecture — File & Folder Separation

| File/Folder | Role | Contents | কখন পড়বে |
|-------------|------|----------|-----------|
| **AGENTS.md** | HOW to work | Workflow rules, error recovery, reading order | Auto-loaded প্রতি session |
| **RULES.md** | WHAT rules | Import, styling, naming, verification | কাজ শুরুর আগে |
| **PROGRESS.md** | WHERE we are | Checkboxes, %, metadata, blockers, log | **সবার আগে, প্রতিবার** |
| **steps/*.md** | WHAT to do | Step-by-step details, code, props, layouts | Step execute করার সময় |
| **drafts/*.md** | IDEAS & R&D | Free-form notes, research, brainstorming | **শুধু user বললে** — auto-execute নয় |

---

## 🔄 Data Flow

```
নতুন Session → AGENTS.md (auto) → PROGRESS.md → RULES.md → steps/*.md → কাজ → ./l c X.Y "note" → 🔁 Loop
```

---

## 📋 CLI Commands

| Command | কি করে |
|---------|--------|
| `./l` | Dashboard দেখাও |
| `./l start 2.1` | Step 2.1 শুরু করো (file create + [~]) |
| `./l c 2.1 "note"` | Step 2.1 complete করো (verify + [x]) |
| `./l v` | Plan/Progress sync validate করো |
| `./l h` | Help দেখাও |
