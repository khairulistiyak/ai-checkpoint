# Phase 55: Project Cleanup — Archive Garbage Files

> Move all unnecessary/dead files to `_archive/` folder. Clean project structure, zero code breakage.

---

### Step 55.1 — Create archive directory structure
- **File:** `_archive/docs/.gitkeep`
- **Action:** CREATE
- **Content:** Create empty directories: `_archive/docs/`, `_archive/media/`, `_archive/marketing/`, `_archive/story/`, `_archive/logos/`, `_archive/plans-completed/`, `_archive/dead-code/`. Add `_archive/README.md` explaining this is archived content and date of archival.
- **Done-check:** `ls _archive/` → shows docs, media, marketing, story, logos, plans-completed, dead-code
- **Depends:** None

---

### Step 55.2 — Move dead documentation files to archive
- **File:** `_archive/docs/EXECUTION_READY.md`
- **Action:** CREATE (via move)
- **Content:** `mv EXECUTION_READY.md IMPLEMENTATION_NOTES.md PRO_PLAN.md QUICK_REFERENCE.md STATUS.md ROADMAP.md _archive/docs/`
- **Done-check:** `ls _archive/docs/` → 6 files; `test ! -f EXECUTION_READY.md` → pass
- **Depends:** 55.1

---

### Step 55.3 — Move unused SVGs and images to archive
- **File:** `_archive/media/ui-mockup.svg`
- **Action:** CREATE (via move)
- **Content:** `mv ui-mockup.svg architecture.svg ai-workflow-modern.svg social-preview.png _archive/media/`. Also move `dashboard/screenshot.png` to `_archive/media/`.
- **Done-check:** `ls _archive/media/` → 5 files; `test ! -f architecture.svg` → pass
- **Depends:** 55.1

---

### Step 55.4 — Move marketing folder to archive
- **File:** `_archive/marketing/`
- **Action:** CREATE (via move)
- **Content:** `mv marketing/* _archive/marketing/ && rmdir marketing`
- **Done-check:** `ls _archive/marketing/` → facebook, x_twitter, youtube, linkedin, reddit, producthunt, instagram, dev_to, personal-branding; `test ! -d marketing` → pass
- **Depends:** 55.1

---

### Step 55.5 — Move story folder to archive
- **File:** `_archive/story/`
- **Action:** CREATE (via move)
- **Content:** `mv story/* _archive/story/ && rmdir story`
- **Done-check:** `ls _archive/story/` → 5 .md files; `test ! -d story` → pass
- **Depends:** 55.1

---

### Step 55.6 — Move extra logo variants to archive
- **File:** `_archive/logos/`
- **Action:** CREATE (via move)
- **Content:** Keep `logo/ai_checkpoint_concept_2_premium.svg` and `logo/ai_checkpoint_minimal_2.png` in `logo/`. Move all other 12 files to `_archive/logos/`.
- **Done-check:** `ls logo/ | wc -l` → 2; `ls _archive/logos/ | wc -l` → 12
- **Depends:** 55.1

---

### Step 55.7 — Move completed plan files to archive
- **File:** `_archive/plans-completed/`
- **Action:** CREATE (via move)
- **Content:** Move all `plan/phase-*.md` files EXCEPT `plan/phase-54-electron-desktop-app.md` to `_archive/plans-completed/`. Also move `plan/bugfix-*.md`, `plan/dashboard-redesign-plan.md`, `plan/error-prevention-plan.md`, `plan/dogfood-test.md`, `plan/launch-checklist.md`, `plan/my_plan.md`, `plan/npm-publish-notes.md`, `plan/release-evidence.md`, `plan/AUDIT-REPORT.md`, `plan/architecture-component-library.md` to `_archive/plans-completed/`.
- **Done-check:** `ls plan/*.md | wc -l` → 1 (only phase-54); `ls _archive/plans-completed/ | wc -l` → 57+
- **Depends:** 55.1

---

### Step 55.8 — Move dead React component to archive
- **File:** `_archive/dead-code/EmptySelectionView.jsx`
- **Action:** CREATE (via move)
- **Content:** `mv dashboard/src/components/EmptySelectionView.jsx _archive/dead-code/`
- **Done-check:** `test ! -f dashboard/src/components/EmptySelectionView.jsx` → pass
- **Depends:** 55.1

---

### Step 55.9 — Clean build cache
- **File:** `dashboard/.vite/`
- **Action:** DELETE
- **Content:** `rm -rf dashboard/.vite dashboard/dist`. Add `dashboard/.vite/` and `dashboard/dist/` to `dashboard/.gitignore` if not already present.
- **Done-check:** `test ! -d dashboard/.vite` → pass; `grep ".vite" dashboard/.gitignore` → match
- **Depends:** None

---

### Step 55.10 — Update .gitignore for archive
- **File:** `.gitignore`
- **Action:** EDIT
- **Content:** Add `_archive/` to `.gitignore` so archived files are not tracked in git. Add `dashboard/.vite/` and `dashboard/dist/` if not present.
- **Done-check:** `grep "_archive" .gitignore` → match
- **Depends:** 55.1

---

### Step 55.11 — Update .npmignore for archive
- **File:** `.npmignore`
- **Action:** EDIT
- **Content:** Add `_archive/` to `.npmignore` so archived files are not included in npm package.
- **Done-check:** `grep "_archive" .npmignore` → match
- **Depends:** 55.10

---

### Step 55.12 — Verify no broken imports or references
- **File:** `tests/cleanup-verify.sh`
- **Action:** CREATE
- **Content:** Shell script that: (1) runs `cd dashboard && npx vite build` to verify no broken imports, (2) runs `node scripts/ledger.cjs --help` to verify CLI works, (3) checks no source file imports EmptySelectionView, (4) checks README.md images still exist. Exit 0 on success.
- **Done-check:** `bash tests/cleanup-verify.sh` → exit 0
- **Depends:** 55.2, 55.3, 55.4, 55.5, 55.6, 55.7, 55.8, 55.9

---

### Step 55.13 — Update PROGRESS.md with Phase 55 completion
- **File:** `.agents/PROGRESS.md`
- **Action:** EDIT
- **Content:** Mark all Phase 55 steps as complete. Update overall progress counter.
- **Done-check:** `grep "Phase 55" .agents/PROGRESS.md | grep COMPLETE` → match
- **Depends:** 55.12
