# Quick Reference — ai-checkpoint Pro v1.0 Execution

## 🎯 Current Status
- **Phase:** Planning Complete, Ready for Execution
- **Progress:** 0/27 steps (0%)
- **Next Step:** 1.1 — Add safety header to CLI
- **Command:** `./l start 1.1`

---

## 📋 Phase Overview

| Phase | Steps | Focus |
|-------|-------|-------|
| 1. Core Hardening | 5 | CLI safety, validation, 150-line enforcement |
| 2. Checkpoint & Rollback | 5 | Git-based recovery system |
| 3. Templates Upgrade | 5 | RULE 0 & RULE 1 enforcement |
| 4. DX & Distribution | 6 | Install, examples, CI/CD |
| 5. Release | 6 | Dogfooding, versioning, launch |

---

## 🔄 Execution Workflow

```bash
# View dashboard
./l

# Start a step
./l start X.Y

# [AI executes step, runs Done-check]

# Validate
./l v

# Complete step
./l c X.Y "brief note"

# Checkpoint after phase
./l cp save "Phase X complete"
```

---

## 📁 Key Files

### Plans (Read These First)
- `plan/phase-1-core-hardening.md`
- `plan/phase-2-checkpoint-rollback.md`
- `plan/phase-3-templates-upgrade.md`
- `plan/phase-4-dx-distribution.md`
- `plan/phase-5-release.md`

### Documentation
- `ROADMAP.md` — High-level overview
- `EXECUTION_READY.md` — Complete transformation guide
- `IMPLEMENTATION_NOTES.md` — Design decisions
- `STATUS.md` — Current state tracker
- `PRO_PLAN.md` — Original vision

### System
- `.agents/PROGRESS.md` — Step tracker (dashboard reads this)
- `.agents/RULES.md` — Coding conventions
- `.agents/AGENTS.md` — Agent workflow rules

---

## ✅ Atomic Step Format (Every Step Follows This)

```markdown
### Step X.Y — [Title]
- **File:** `exact/path/to/file.ext`
- **Action:** CREATE | EDIT | DELETE
- **Content:** [Complete code OR unambiguous instruction]
- **Done-check:** `runnable command` → expected output
- **Depends:** X.(Y-1) | None
```

---

## 🚫 Rules to Remember

### RULE 0: Micro-File Monorepo
- Max 150 lines per file (hard limit)
- One file = one job
- Validation enforces automatically

### RULE 1: Atomic Steps
- One step = one file = one action
- No ambiguous words ("appropriately", "as needed", etc.)
- Done-check must be runnable
- Fail twice → BLOCKED (no guessing)

### Strict Agent Loop
1. Read step from plan
2. Execute (one file only)
3. Run Done-check
4. Run validation (`./l v`)
5. Complete (`./l c`)
6. Report to user
7. Move to next step

---

## 🔖 Checkpoint Commands (Available After Phase 2)

```bash
./l cp save "message"     # Save checkpoint (requires validation pass)
./l cp list               # List all checkpoints
./l cp back [tag]         # Rollback to checkpoint
./l cp back --force [tag] # Skip confirmation
```

---

## 📊 Success Criteria

### Before v1.0 Release
- [ ] All 27 steps completed
- [ ] Free-tier model executes Phase 3 exit-check
- [ ] Validation catches 150-line violations
- [ ] Checkpoint rollback works in <10s
- [ ] Setup to first step in <5 minutes
- [ ] 1 week dogfooding on real project

### 30 Days Post-Launch
- [ ] 50+ GitHub stars
- [ ] 5+ community issues/PRs
- [ ] 3+ positive testimonials
- [ ] 10+ successful users

---

## 🎬 Start Execution

```bash
cd /Volumes/SSD/0.1/ai-checkpoint
./l start 1.1
```

**The transformation begins.**
