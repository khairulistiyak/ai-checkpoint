# Phase 153: Move Brand Header into Sidebar and Remove Top Navbar

> **Objective:** Integrate the VEYLX STUDIO brand emblem & typography directly into the top of the Sidebar (`SidebarHeader.jsx`) and remove the top navigation bar (`Header.jsx`) for a sleek, full-height IDE experience.

---

## 📋 Execution Steps

### Step 153.1 — Integrate VEYLX STUDIO Brand into SidebarHeader (`dashboard/src/components/SidebarHeader.jsx`)
- **File**: `dashboard/src/components/SidebarHeader.jsx`
- **Action**: EDIT
- **Content**: Update `SidebarHeader.jsx` to render the official VEYLX STUDIO emblem (Brain icon + typography) along with workspace actions (add, collapse, mobile close). Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 153.2 — Update Sidebar Layout & Props (`dashboard/src/components/Sidebar.jsx`)
- **File**: `dashboard/src/components/Sidebar.jsx`
- **Action**: EDIT
- **Content**: Accept `onOpenCommandPalette` prop and integrate `⌘K` shortcut trigger into the search bar. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 153.1

---

### Step 153.3 — Remove Top Header & Streamline App Layout (`dashboard/src/App.jsx`)
- **File**: `dashboard/src/App.jsx`
- **Action**: EDIT
- **Content**: Remove `<Header />` from `App.jsx`, wire `onOpenCommandPalette` to `Sidebar`, and add a minimal mobile top bar for small screens. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 153.2

---

### Step 153.4 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 153.3

---

### Step 153.5 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 153.4
