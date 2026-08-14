# Plan: Phase 34 — AI Page Minimal Studio Overhaul

> Refactor the AI Plan Builder page and AI Tier selector to keep only essential elements, delete clutter, and create a sleek, structured Apple Studio minimalist aesthetic.

---

## Step 34.1 — Refactor AiTierSelector.jsx to minimal studio cards
- **File:** `dashboard/src/components/AiTierSelector.jsx`
- **Action:** EDIT
- **Content:**
  Remove emojis, noisy recommended model lists, and excessive glowing gradients. Keep only the essential tier name, step limit badge, and concise complexity description in Apple Studio monochrome cards.
- **Done-check:** `grep -q "Small" dashboard/src/components/AiTierSelector.jsx && echo OK`
- **Depends:** None

---

## Step 34.2 — Refactor PlanGeneratorTab.jsx to centered minimal studio form
- **File:** `dashboard/src/components/plans/PlanGeneratorTab.jsx`
- **Action:** EDIT
- **Content:**
  Delete the fake markdown live preview panel and redundant badges/info boxes. Center the AI Plan Builder form in a sleek, spacious studio card with clean input fields and clear action button.
- **Done-check:** `grep -q "Plan Identifier" dashboard/src/components/plans/PlanGeneratorTab.jsx && echo OK`
- **Depends:** 34.1

---

## Step 34.3 — Update PlansSidebar.jsx label to AI Plan Builder
- **File:** `dashboard/src/components/plans/PlansSidebar.jsx`
- **Action:** EDIT
- **Content:**
  Rename the generate tab label to 'AI Plan Builder' and clean up badge styling for clarity and minimalist Apple Studio aesthetic.
- **Done-check:** `grep -q "AI Plan Builder" dashboard/src/components/plans/PlansSidebar.jsx && echo OK`
- **Depends:** 34.2

---

## Step 34.4 — Refine PlanCard.jsx to studio minimal aesthetic
- **File:** `dashboard/src/components/PlanCard.jsx`
- **Action:** EDIT
- **Content:**
  Clean up typography and borders in PlanCard.jsx to ensure zero visual noise and consistent Apple Studio monochrome styling.
- **Done-check:** `grep -q "Implementation Plan" dashboard/src/components/PlanCard.jsx && echo OK`
- **Depends:** 34.3
