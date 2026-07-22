# Phase 6: UI Refinements & Error Handling

> UI/UX refinement to make the dashboard robust and provide exact error feedback.

## Step 6.1 — Better Command Error Feedback
- **Goal:** Capture `stdout`/`stderr` from `execSync` in `api.js` backend and send it to the frontend.
- **Why:** To show exact errors (e.g. `No plan/*.md files found`) in toasts instead of generic "Command execution failed".

## Step 6.2 — Empty Plan Guard
- **Goal:** Check if `plan/` contains `.md` files in `api.js` when sending project details.
- **Why:** Prevent users from clicking "Start Task" on uninitialized plans, avoiding crashes entirely.

## Step 6.3 — Z-Index and Overlap Fixes
- **Goal:** Increase Toast Z-index and adjust `LogPanel` interactions.
- **Why:** Toasts should never hide under the Command Palette, and `LogPanel` should feel fluid without blocking critical UI.
