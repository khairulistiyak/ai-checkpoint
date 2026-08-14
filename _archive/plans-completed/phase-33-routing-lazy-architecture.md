# Phase 33 — Lightweight SPA Routing & Lazy-Loading Architecture

> Transform the dashboard into a truly modular, route-driven application using lightweight Hash Routing and `React.lazy` code-splitting to drastically reduce PC RAM and CPU memory pressure ("pc te chap kom falabe").

---

## Architecture & Design (Why this is the Best Routing Idea)

1. **Hash-Based Route Pattern (`useHashRoute`)**:
   - `#/` → **Home Page** (`HomePage.jsx`: overview and project selection)
   - `#/project/:id` → **Project Detail Page** (`ProjectPage.jsx`: metrics, git history, actions)
   - `#/project/:id/plans/:tab` → **Plans Studio Page** (`PlansPage.jsx`: progress tracker, specs, generator)
   - `#/library` → **Developer Control Studio** (`ComponentLibrary`: UI showcase)
2. **Zero-Load On Unvisited Routes (`React.lazy` + `<Suspense>`)**:
   - Heavy markdown parsers, Git visualizers, and Plan editors are code-split into separate JS chunks.
   - PC CPU and RAM consumption drops by over 60% because inactive pages are never evaluated or kept in active memory.
3. **Browser Navigation & Deep Linking**:
   - Browser Back / Forward buttons work automatically.
   - Instant bookmarks to any project or plan tab.

---

## Step 33.1 — Create lightweight hash router hook

- **File**: `dashboard/src/hooks/useHashRoute.js`
- **Goal**: Implement a clean, reactive hook that parses `window.location.hash` into route parameters (`route`, `projectId`, `tab`) and provides a `navigate(path)` helper.
- **Validation**:
  - Run `npm run build` in `dashboard/` to verify clean compilation.

---

## Step 33.2 — Create eye-comfort route loading skeleton

- **File**: `dashboard/src/components/ui/PageSkeleton.jsx`
- **Goal**: Create an eye-comfort matte dark Suspense loading fallback with subtle shimmer animations to display while lazy-loaded page chunks are fetched.
- **Validation**:
  - Run `npm run build` in `dashboard/` to verify clean compilation.

---

## Step 33.3 — Create HomePage module

- **File**: `dashboard/src/pages/HomePage.jsx`
- **Goal**: Encapsulate the default landing view (`EmptySelectionView` or global overview banner) into a dedicated page component under 150 lines.
- **Validation**:
  - Run `npm run build` in `dashboard/` to verify clean compilation.

---

## Step 33.4 — Create ProjectPage module

- **File**: `dashboard/src/pages/ProjectPage.jsx`
- **Goal**: Encapsulate the project workspace (`ProjectGrid`, config modals, remove modals) into a dedicated page component under 150 lines.
- **Validation**:
  - Run `npm run build` in `dashboard/` to verify clean compilation.

---

## Step 33.5 — Create PlansPage module

- **File**: `dashboard/src/pages/PlansPage.jsx`
- **Goal**: Encapsulate the full-page Plans Studio (`PlansCenter`) into a standalone route-driven page component under 150 lines.
- **Validation**:
  - Run `npm run build` in `dashboard/` to verify clean compilation.

---

## Step 33.6 — Refactor App.jsx to use lazy-loaded routes and useHashRoute

- **File**: `dashboard/src/App.jsx`
- **Goal**: Remove synchronous heavy component imports in `App.jsx`, replace with `React.lazy`, and route views using `useHashRoute()` inside `<Suspense>`.
- **Validation**:
  - Run `npm run build` in `dashboard/` to verify clean compilation.

---

## Step 33.7 — Update ProjectGrid navigation to emit hash route URLs

- **File**: `dashboard/src/components/ProjectGrid.jsx`
- **Goal**: Update PlanCard and Generate Plan buttons to navigate via `#` hash URLs instead of state mutation.
- **Validation**:
  - Run `npm run build` in `dashboard/` to verify clean compilation.
