# Progress Tracker

> Agent reads this **first** every session.

---

## Project

| Key | Value |
|-----|-------|
| Project | ai-checkpoint Pro v1.0 |
| Started | 2026-07-18 |

---

## Overall Progress

```
[███████████░░░░░░░░░] 56% (15/27 steps complete)
```

## 👉 NEXT: Step 4.1 — Make setup.sh idempotent (`setup.sh`)
> 📋 Details → `plan/` → Phase 4 → Step 4.1

---

## 🔷 Phase 1: Core Hardening — ✅ 100% COMPLETE

- [x] **Step 1.1** — Add safety header to CLI (`.agents/scripts/ledger.cjs`)
- [x] **Step 1.2** — Add `doctor` command (`.agents/scripts/ledger.cjs`)
- [x] **Step 1.3** — Add real validation to `validate` command (`.agents/scripts/ledger.cjs`)
- [x] **Step 1.4** — Update RULES.md template with micro-file rules (`templates/RULES.md`)
- [x] **Step 1.5** — Update setup.sh with safe paths (`setup.sh`)

---

## 🔷 Phase 2: Checkpoint & Rollback — ✅ 100% COMPLETE

- [x] **Step 2.1** — Add `checkpoint save` command (`.agents/scripts/ledger.cjs`)
- [x] **Step 2.2** — Add `checkpoint list` command (`.agents/scripts/ledger.cjs`)
- [x] **Step 2.3** — Add `checkpoint back` command (`.agents/scripts/ledger.cjs`)
- [x] **Step 2.4** — Update AGENTS.md with checkpoint workflow (`templates/AGENTS.md`)
- [x] **Step 2.5** — Add checkpoint documentation to SYSTEM_GUIDE.md (`templates/SYSTEM_GUIDE.md`)

---

## 🔷 Phase 3: Templates Upgrade — ✅ 100% COMPLETE

- [x] **Step 3.1** — Create PLAN_TEMPLATE.md (`templates/PLAN_TEMPLATE.md`)
- [x] **Step 3.2** — Add `new-plan` command to CLI (`.agents/scripts/ledger.cjs`)
- [x] **Step 3.3** — Update AGENTS.md with strict loop (`templates/AGENTS.md`)
- [x] **Step 3.4** — Update RULES.md template (`templates/RULES.md`)
- [x] **Step 3.5** — Create example atomic plan (`examples/atomic-plan-example.md`)

---

## 🔷 Phase 4: DX & Distribution — 🔴 0% PENDING (0/6)

- [ ] **Step 4.1** — Make setup.sh idempotent (`setup.sh`)
- [ ] **Step 4.2** — Create install.sh (`install.sh`)
- [ ] **Step 4.3** — Add comprehensive walkthrough (`examples/walkthrough.md`)
- [ ] **Step 4.4** — Add shellcheck CI workflow (`.github/workflows/shellcheck.yml`)
- [ ] **Step 4.5** — Create CHANGELOG.md (`CHANGELOG.md`)
- [ ] **Step 4.6** — Update README.md with quickstart (`README.md`)

---

## 🔷 Phase 5: Release — 🔴 0% PENDING (0/6)

- [ ] **Step 5.1** — Dogfood test plan (`plan/dogfood-test.md`)
- [ ] **Step 5.2** — Create version tagging script (`scripts/release.sh`)
- [ ] **Step 5.3** — Create GitHub release template (`.github/RELEASE_TEMPLATE.md`)
- [ ] **Step 5.4** — Create launch checklist (`plan/launch-checklist.md`)
- [ ] **Step 5.5** — Update package repository URLs (`install.sh`)
- [ ] **Step 5.6** — Final validation run (`scripts/pre-release-check.sh`)

---

<!--
UPDATE LOG:
2026-07-18: Initial setup - all 5 phases planned with 27 atomic steps
[2026-07-19 03:28] Step 1.1 completed — strict mode, rejected-promise handling, and --help support added | Agent: CLI
[2026-07-19 03:30] Step 1.2 completed — doctor validates required files, progress format, and git repository | Agent: CLI
[2026-07-19 03:36] Step 1.3 completed — Real validation added: file bounds, IDs, and 150-line rule; block-on-complete configured | Agent: CLI
[2026-07-19 03:39] Step 1.4 completed — RULES template enforces micro-file monorepo and protected paths | Agent: CLI
[2026-07-19 03:43] Step 1.5 completed — setup.sh uses set -euo pipefail and safe path quoting | Agent: CLI
[2026-07-19 04:46] Step 2.1 completed — cp save command with validation gate and git tagging | Agent: CLI
[2026-07-19 05:09] Step 2.2 completed — cp list shows aicp tags with messages | Agent: CLI
[2026-07-19 05:17] Step 2.3 completed — checkpoint back successfully handles tree checkout and stash without detached HEAD | Agent: CLI
[2026-07-19 05:18] Step 2.4 completed — AGENTS template documents checkpoint workflow | Agent: CLI
[2026-07-19 05:18] Step 2.5 completed — SYSTEM_GUIDE checkpoint commands and instructions added | Agent: CLI
[2026-07-19 05:28] Step 3.1 completed — atomic PLAN_TEMPLATE created | Agent: CLI
[2026-07-19 05:35] Step 3.2 completed — new-plan command validates names and copies atomic template | Agent: CLI
[2026-07-19 05:37] Step 3.3 completed — AGENTS template enforces strict loop and 2-strike blocking | Agent: CLI
[2026-07-19 05:38] Step 3.4 completed — RULE 1 atomic format and forbidden language added | Agent: CLI
[2026-07-19 05:39] Step 3.5 completed — atomic plan example documents good and bad step formats | Agent: CLI
-->
