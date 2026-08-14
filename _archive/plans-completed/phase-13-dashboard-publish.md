# Phase 13 — Dashboard Publish Ready

> Clean uncommitted dashboard changes, validate the build, and prepare npm-style distribution.

---

## Step 13.1 — Commit all dashboard changes
- **File:** `.gitignore`
- **Action:** EDIT
- **Content:** Add `dashboard/node_modules/` and `dashboard/dist/` to gitignore. Stage and commit every modified and untracked dashboard file in a single commit.
- **Done-check:** `test -z "$(git status --porcelain dashboard)"` → exit 0
- **Depends:** None

## Step 13.2 — Dashboard build smoke test
- **File:** `dashboard/package.json`
- **Action:** EDIT
- **Content:** No file change needed. Run `cd dashboard && npm ci && npm run build` to prove the build passes.
- **Done-check:** `test -d dashboard/dist` → exit 0
- **Depends:** 13.1

## Step 13.3 — Add dashboard dev guide
- **File:** `dashboard/README.md`
- **Action:** CREATE
- **Content:** Document commands: `npm run dev` (hot-reload), `npm run build`, `npm start` (production). List dependencies, explain project structure, and describe adding projects via API.
- **Done-check:** `test -f dashboard/README.md` → exit 0
- **Depends:** 13.2

## Step 13.4 — Add dashboard screenshot
- **File:** `dashboard/screenshot.png`
- **Action:** CREATE
- **Content:** Capture a screenshot of the running dashboard with at least one project visible. Reference it in `dashboard/README.md`.
- **Done-check:** `test -f dashboard/screenshot.png` → exit 0
- **Depends:** 13.3

## Step 13.5 — Document dashboard in main README
- **File:** `README.md`
- **Action:** EDIT
- **Content:** Add a dashboard section between quickstart and core concepts. Show the screenshot and link to `dashboard/README.md`.
- **Done-check:** `grep -q "Dashboard" README.md` → exit 0
- **Depends:** 13.4
