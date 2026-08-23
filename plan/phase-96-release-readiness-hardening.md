# Phase 96: Release Readiness Hardening

> Fix release blockers found in the full A–Z audit before publishing `ai-checkpoint`.

---

## Step 96.1 — Install CLI Wrapper During Setup
- **File:** `setup.sh`
- **Action:** EDIT
- **Content:**
  Add one setup step that writes executable `l` into the target project when missing. The wrapper must call local `packages/cli/index.js` when available, then fallback to `$HOME/.ai-checkpoint/engine.bin.js`.
- **Done-check:** `tmp=$(mktemp -d) && (cd "$tmp" && bash /Volumes/SSD/0.1/ai-checkpoint/setup.sh >/dev/null && test -x l && ./l doctor >/dev/null) && rm -rf "$tmp" && echo "SETUP_CLI_OK"` → `SETUP_CLI_OK`
- **Depends:** None

---

## Step 96.2 — Verify Full BATS Suite
- **File:** `tests/test_helper.bash`
- **Action:** EDIT
- **Content:**
  Update only if Step 96.1 does not fully fix test temp-project path setup. Keep helper focused on `PROJECT_DIR`, `REPO_DIR`, and `CLI_DIR` correctness.
- **Done-check:** `npx bats tests` → exit 0
- **Depends:** 96.1

---

## Step 96.3 — Document Version 1.0.1 Release Notes
- **File:** `CHANGELOG.md`
- **Action:** EDIT
- **Content:**
  Add `## [1.0.1] - 2026-08-23` under Unreleased. Include release hardening, health score 100/100, Rule 0 cleanup, Electron performance fix, and diagnostic remediation.
- **Done-check:** `grep -q "## \[1.0.1\] - 2026-08-23" CHANGELOG.md && echo "CHANGELOG_OK"` → `CHANGELOG_OK`
- **Depends:** 96.2

---

## Step 96.4 — Audit esbuild Dev Vulnerability Decision
- **File:** `package.json`
- **Action:** EDIT
- **Content:**
  Upgrade `esbuild` to the npm audit fixed version only if `npm run build:engine` still passes. Do not change runtime dependencies.
- **Done-check:** `npm audit --omit=dev --json | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{const j=JSON.parse(s); if ((j.metadata.vulnerabilities.total||0)!==0) process.exit(1); console.log('PROD_AUDIT_OK');})"` → `PROD_AUDIT_OK`
- **Depends:** 96.3

---

## Step 96.5 — Verify Engine Build Reproducibility
- **File:** `assets/engine.bin.js`
- **Action:** EDIT
- **Content:**
  Regenerate the engine with the current build pipeline after dependency audit decision. Commit the generated output only if build succeeds.
- **Done-check:** `npm run build:engine` → exit 0
- **Depends:** 96.4

---

## Step 96.6 — Verify Dashboard Production Bundle
- **File:** `dashboard/server.js`
- **Action:** EDIT
- **Content:**
  Rebuild the dashboard backend bundle with the existing build script. Keep generated server bundle import-compatible with Electron packaging.
- **Done-check:** `npm --prefix dashboard run build && node --check dashboard/server.js` → exit 0
- **Depends:** 96.5

---

## Step 96.7 — Verify Electron macOS Package
- **File:** `electron-builder.yml`
- **Action:** EDIT
- **Content:**
  Change config only if macOS packaging fails. Keep `!**/._*`, `dashboard/server.js`, `dashboard/dist/**`, `dashboard/src/server/**`, and `assets/engine.bin.js` included/excluded exactly as release requires.
- **Done-check:** `npm run electron:build:mac` → exit 0
- **Depends:** 96.6

---

## Step 96.8 — Add Release Gate Script
- **File:** `scripts/release-check.cjs`
- **Action:** CREATE
- **Content:**
  Create one Node script that runs the release gates in order: `npm test`, `npm run build:engine`, `npm --prefix dashboard run build`, `npm audit --omit=dev`, `./l health`, `./l dry`, and `./l v`.
- **Done-check:** `node scripts/release-check.cjs` → exit 0
- **Depends:** 96.7

---

## Step 96.9 — Expose Release Check Command
- **File:** `package.json`
- **Action:** EDIT
- **Content:**
  Add `"release:check": "node scripts/release-check.cjs"` to `scripts` without changing existing commands.
- **Done-check:** `npm run release:check` → exit 0
- **Depends:** 96.8

---

## Step 96.10 — Final Release Gate Audit
- **File:** `.agents/PROGRESS.md`
- **Action:** EDIT
- **Content:**
  Mark Phase 96 complete only after all release gates pass and health remains 100/100.
- **Done-check:** `npm run release:check && ./l health` → exit 0
- **Depends:** 96.9
