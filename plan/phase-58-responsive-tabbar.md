# Phase 58: Project Tab Bar Device Responsiveness & Touch Optimization

## Goal
Make `ProjectTabBar` and `ProjectTabItem` fully responsive across all device sizes (Mobile, Tablet, Desktop) with touch-friendly swipe scrolling and adaptive layouts.

### Step 58.1 — Update ProjectTabItem responsiveness
- **File:** `dashboard/src/components/project/ProjectTabItem.jsx`
- **Action:** EDIT
- **Content:** Update padding to `px-2 sm:px-3.5 py-1.5 sm:py-2` and refine label visibility classes.
- **Done-check:** `cat dashboard/src/components/project/ProjectTabItem.jsx | grep -q "px-2 sm:px-3.5"` → exit 0
- **Depends:** None

### Step 58.2 — Update ProjectTabBar responsive scrolling
- **File:** `dashboard/src/components/ProjectTabBar.jsx`
- **Action:** EDIT
- **Content:** Remove `w-max` and add touch-friendly scrolling classes `w-full` where appropriate, along with a fade indicator for scrolling.
- **Done-check:** `cat dashboard/src/components/ProjectTabBar.jsx | grep -q "w-full"` → exit 0
- **Depends:** 58.1

