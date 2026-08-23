# Phase 98: Pro Developer Action Dock Overhaul

> Elevate the Developer Action Dock with Dynamic Ambient Aura, Live Stopwatch, Phase Progress Hairline, and Pro Hotkey Badges.

---

## Step 98.1 — Live Execution Timer & Hotkey Hooks
- **File:** `dashboard/src/components/dock/useDeveloperDock.js`
- **Action:** EDIT
- **Content:**
  Add live elapsed stopwatch timer state and global hotkey listeners for Space/Prompt copying.
- **Done-check:** `npm --prefix dashboard run build` → exit 0
- **Depends:** None

---

## Step 98.2 — Dynamic Ambient Aura & Top Progress Hairline
- **File:** `dashboard/src/components/DeveloperActionDock.jsx`
- **Action:** EDIT
- **Content:**
  Add dynamic ambient underglow, top rim progress hairline, and live stopwatch timer display.
- **Done-check:** `npm --prefix dashboard run build` → exit 0
- **Depends:** 98.1

---

## Step 98.3 — Pro Action Buttons & Key Badges
- **File:** `dashboard/src/components/dock/ActionDockButtons.jsx`
- **Action:** EDIT
- **Content:**
  Add hotkey indicator badges (`⌘P`, `Ctrl+\``) and glowing primary CTA button.
- **Done-check:** `npm --prefix dashboard run build` → exit 0
- **Depends:** 98.2

---

## Step 98.4 — Rebuild Engine & Dashboard
- **File:** `assets/engine.bin.js`
- **Action:** EDIT
- **Content:**
  Rebuild global engine binary and verify clean dashboard production bundle.
- **Done-check:** `npm run build:engine && npm --prefix dashboard run build` → exit 0
- **Depends:** 98.3

---

## Step 98.5 — Final Phase 98 Release Verification
- **File:** `.agents/PROGRESS.md`
- **Action:** EDIT
- **Content:**
  Verify full release checks `npm run release:check` and `./l health` at 100/100 and update progress.
- **Done-check:** `npm run release:check && ./l health` → exit 0
- **Depends:** 98.4
