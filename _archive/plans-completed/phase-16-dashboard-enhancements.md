# Phase 16 — Dashboard Enhancements

> Implement Global Overview and Sidebar Search features using strict atomic rules.

---

## Step 16.1 — Create Global Overview Component
- **File:** `dashboard/src/components/GlobalOverview.jsx`
- **Action:** CREATE
- **Content:**
  ```jsx
  import React from 'react';
  import { motion } from 'framer-motion';
  import { LayoutDashboard, CheckCircle, Clock, FolderOpen } from 'lucide-react';

  export default function GlobalOverview({ projects }) {
    const totalProjects = projects.length;
    const installedProjects = projects.filter(p => p.isInstalled).length;
    
    return (
      <div className="w-full h-full p-4 md:p-8 text-white overflow-y-auto custom-scrollbar">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-violet-400" />
          Global Overview
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 font-medium">Total Projects</h3>
              <FolderOpen className="text-slate-500 w-5 h-5" />
            </div>
            <div className="text-4xl font-bold text-white">{totalProjects}</div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 font-medium">Initialized</h3>
              <CheckCircle className="text-emerald-500 w-5 h-5" />
            </div>
            <div className="text-4xl font-bold text-white">{installedProjects}</div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-400 font-medium">Pending Tasks</h3>
              <Clock className="text-amber-500 w-5 h-5" />
            </div>
            <div className="text-4xl font-bold text-white">0</div>
          </motion.div>
        </div>
      </div>
    );
  }
  ```
- **Done-check:** `test -f dashboard/src/components/GlobalOverview.jsx && grep -q "GlobalOverview" dashboard/src/components/GlobalOverview.jsx && echo OK`
- **Depends:** None

---

## Step 16.2 — Add Sidebar Search & Filters
- **File:** `dashboard/src/components/Sidebar.jsx`
- **Action:** EDIT
- **Content:**
  Find the imports block. Replace:
  ```javascript
  import React, { useState, useEffect, useRef, useCallback } from 'react';
  ```
  With:
  ```javascript
  import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
  ```
  Find `export default function Sidebar({ ... }) {`. Below it, add:
  ```javascript
  const [searchQuery, setSearchQuery] = useState('');
  ```
  Find `const items = projects.slice();`. Replace with:
  ```javascript
  const items = useMemo(() => {
    return projects.filter(p => p.id.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [projects, searchQuery]);
  ```
  Find the `<div className="px-4 pb-4">` containing the "New Project" button. BEFORE it, add:
  ```jsx
  <div className="px-4 mb-4">
    <input 
      type="text" 
      placeholder="Search projects..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full bg-[#020617]/50 border border-white/[0.05] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-violet-500 text-white placeholder-slate-500"
    />
  </div>
  ```
- **Done-check:** `grep -q "Search projects" dashboard/src/components/Sidebar.jsx && echo OK`
- **Depends:** None

---

## Step 16.3 — Mount Global Overview in App.jsx
- **File:** `dashboard/src/App.jsx`
- **Action:** EDIT
- **Content:**
  Find the imports block. Add:
  ```javascript
  import GlobalOverview from './components/GlobalOverview';
  ```
  Find the `useEffect` that auto-selects a project:
  ```javascript
  React.useEffect(() => {
    if (projects.length > 0 && !selectedId) setSelectedId(projects[0].id);
  }, [projects, selectedId]);
  ```
  Delete this entire `useEffect` block so no project is selected by default, allowing the Global Overview to show.

  Find the empty selection rendering:
  ```jsx
  <EmptySelectionView onAddProject={() => setIsAddModalOpen(true)} />
  ```
  Replace it with:
  ```jsx
  {projects.length > 0 ? (
    <GlobalOverview projects={projects} />
  ) : (
    <EmptySelectionView onAddProject={() => setIsAddModalOpen(true)} />
  )}
  ```
- **Done-check:** `grep -q "GlobalOverview" dashboard/src/App.jsx && echo OK`
- **Depends:** 16.1
