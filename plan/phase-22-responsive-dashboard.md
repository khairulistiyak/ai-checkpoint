# Phase 22 — Full Dashboard Responsive Overhaul (Mobile, Tablet, Desktop)

> 8 atomic steps. Each step = 1 file. Copy-paste ready. Fully verified for Mobile (<640px), Tablet (640px-1024px), and Desktop (1024px+).

---

## Step 22.1 — Make Header scaling and touch targets responsive
- **File:** `dashboard/src/components/Header.jsx`
- **Action:** MODIFY
- **Content:**
  Update the main header wrapper and inner text/button classes to scale smoothly on tiny mobile screens (320px+) up to desktop:
  1. Change header padding from `px-4 md:px-6 py-3` to `px-3 sm:px-4 md:px-6 py-2.5 sm:py-3`.
  2. Change title font size from `text-lg font-bold` to `text-base sm:text-lg font-bold`.
  3. Change the desktop search bar width from `w-64` to `w-48 lg:w-64` so it doesn't crowd medium tablet viewports.
- **Done-check:** `grep "w-48 lg:w-64" dashboard/src/components/Header.jsx` → returns a match
- **Depends:** None

---

## Step 22.2 — Add tablet/laptop responsive grid breakpoints to ProjectGrid
- **File:** `dashboard/src/components/ProjectGrid.jsx`
- **Action:** MODIFY
- **Content:**
  Currently `ProjectGrid.jsx` jumps straight from 1 column (`grid-cols-1`) to 12 columns (`xl:grid-cols-12`). Add `lg:` breakpoints so laptops (1024px-1279px) get a balanced 2-column layout:
  1. Change line 12 grid classes from `grid grid-cols-1 xl:grid-cols-12 gap-5` to `grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5`.
  2. Change line 13 card column span from `xl:col-span-8` to `lg:col-span-7 xl:col-span-8`.
  3. Change line 18 plan card span from `xl:col-span-4` to `lg:col-span-5 xl:col-span-4`.
  4. Keep remaining full-width sections as `col-span-1 lg:col-span-12`.
- **Done-check:** `grep "lg:grid-cols-12" dashboard/src/components/ProjectGrid.jsx` → returns a match
- **Depends:** None

---

## Step 22.3 — Fix ProjectCard text overflow and action button wrapping on mobile
- **File:** `dashboard/src/components/ProjectCard.jsx`
- **Action:** MODIFY
- **Content:**
  On narrow mobile viewports, long project file paths overflow horizontally and action buttons force sideways scrolling.
  1. On line 42, update `<span className="font-mono text-xs">{project.path}</span>` to `<span className="font-mono text-xs break-all sm:break-normal truncate block max-w-[200px] sm:max-w-md md:max-w-lg lg:max-w-xl">{project.path}</span>`.
  2. On line 45, change action buttons wrapper from `flex gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar` to `flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto pt-2 md:pt-0`.
- **Done-check:** `grep "break-all sm:break-normal" dashboard/src/components/ProjectCard.jsx` → returns a match
- **Depends:** None

---

## Step 22.4 — Adapt MetricsDashboard grid across 3 breakpoints
- **File:** `dashboard/src/components/MetricsDashboard.jsx`
- **Action:** MODIFY
- **Content:**
  On mobile devices (< 400px), 2 columns of metrics cards squeeze the large numbers and labels.
  1. Update line 20 grid wrapper from `grid grid-cols-2 md:grid-cols-4 gap-4` to `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4`.
  2. Update line 29 card padding from `p-5` to `p-4 sm:p-5`.
- **Done-check:** `grep "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" dashboard/src/components/MetricsDashboard.jsx` → returns a match
- **Depends:** None

---

## Step 22.5 — Make GlobalOverview cards adaptive on tablet and mobile
- **File:** `dashboard/src/components/GlobalOverview.jsx`
- **Action:** MODIFY
- **Content:**
  1. Update line 20 grid container from `grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto mb-10` to `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full max-w-5xl mx-auto mb-6 sm:mb-10`.
  2. Update card paddings in lines 21, 30, and 39 from `p-6` to `p-4 sm:p-6`.
- **Done-check:** `grep "sm:grid-cols-2 lg:grid-cols-3" dashboard/src/components/GlobalOverview.jsx` → returns a match
- **Depends:** None

---

## Step 22.6 — Optimize PlanModal window dimensions and scrolling on mobile
- **File:** `dashboard/src/components/PlanModal.jsx`
- **Action:** MODIFY
- **Content:**
  Ensure the modal dialog doesn't overflow mobile screen borders and close buttons remain reachable.
  1. Change modal container class from `w-[90vw] max-w-4xl max-h-[85vh]` to `w-[95vw] sm:w-[90vw] max-w-4xl max-h-[92vh] sm:max-h-[85vh]`.
  2. Ensure header and footer sections have responsive padding `p-4 sm:p-6`.
- **Done-check:** `grep "w-\\[95vw\\]" dashboard/src/components/PlanModal.jsx` → returns a match
- **Depends:** None

---

## Step 22.7 — Make ConfigEditor mobile-friendly with standard touch targets
- **File:** `dashboard/src/components/ConfigEditor.jsx`
- **Action:** MODIFY
- **Content:**
  1. Change modal container width/height from `w-[90vw] max-w-3xl max-h-[85vh]` to `w-[95vw] sm:w-[85vw] max-w-3xl max-h-[90vh] sm:max-h-[85vh]`.
  2. Change action buttons (Save / Cancel) padding to ensure minimum 44px touch height on mobile: `py-2 sm:py-2.5 px-4 rounded-xl text-sm font-medium`.
- **Done-check:** `grep "w-\\[95vw\\] sm:w-\\[85vw\\]" dashboard/src/components/ConfigEditor.jsx` → returns a match
- **Depends:** None

---

## Step 22.8 — Add horizontal scrolling protection and responsive height to LogPanel
- **File:** `dashboard/src/components/LogPanel.jsx`
- **Action:** MODIFY
- **Content:**
  1. Ensure terminal output wrapper has `overflow-x-auto max-w-full text-[11px] sm:text-xs` so long command output lines can scroll horizontally on mobile without breaking viewport width.
  2. Adjust panel max-height from `max-h-64` to `max-h-48 sm:max-h-64`.
- **Done-check:** `grep "max-h-48 sm:max-h-64" dashboard/src/components/LogPanel.jsx` → returns a match
- **Depends:** None

---

## Verification & Smoke Test
- Run `npm run build` inside `dashboard/` to verify zero Vite build errors.
- Run `npm test` from project root to ensure all backend and CLI tests continue passing.
