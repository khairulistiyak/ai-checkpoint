# Phase 9 — Dashboard Features & Performance

> Add health check UI, refactor App.jsx, debounce sidebar, add SEO, keyboard shortcuts.

---

## Step 9.1 — Extract AddProjectModal from App.jsx
- **File:** `dashboard/src/components/AddProjectModal.jsx`
- **Action:** CREATE
- **Content:**
  ```jsx
  import React, { useState } from 'react';
  import { motion } from 'framer-motion';

  export default function AddProjectModal({ isOpen, onClose, onAdd }) {
    const [path, setPath] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!path) return;
      await onAdd(path);
      setPath('');
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md" onClick={onClose}></div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border-white/[0.05]"
        >
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Track New Project</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
                Absolute Directory Path
              </label>
              <input
                type="text"
                value={path}
                onChange={e => setPath(e.target.value)}
                placeholder="/path/to/your/project"
                className="w-full bg-[#020617]/50 border border-white/[0.05] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-inner text-white transition-all"
                required
              />
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Project
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }
  ```
- **Done-check:** `test -f dashboard/src/components/AddProjectModal.jsx && grep -q "AddProjectModal" dashboard/src/components/AddProjectModal.jsx && echo OK` → prints OK
- **Depends:** None

---

## Step 9.2 — Use AddProjectModal in App.jsx
- **File:** `dashboard/src/App.jsx`
- **Action:** EDIT
- **Content:** Find the import block. Add after the existing component imports:
  ```javascript
  import AddProjectModal from './components/AddProjectModal';
  ```
  Then find the `handleAddProject` function. Replace:
  ```javascript
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProjectPath) return;
    try {
      await addProject(newProjectPath);
      setIsAddModalOpen(false);
      setNewProjectPath('');
      showToast('Project added successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  ```
  With:
  ```javascript
  const handleAddProject = async (projectPath) => {
    try {
      await addProject(projectPath);
      setIsAddModalOpen(false);
      showToast('Project added successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
  ```
  Then delete the `const [newProjectPath, setNewProjectPath] = useState('');` line.
  Then find the entire inline add modal JSX block starting with `{isAddModalOpen && (` and ending with its closing `)}`. Replace that entire block with:
  ```jsx
  <AddProjectModal
    isOpen={isAddModalOpen}
    onClose={() => setIsAddModalOpen(false)}
    onAdd={handleAddProject}
  />
  ```
- **Done-check:** `grep -c "AddProjectModal" dashboard/src/App.jsx && grep -c "newProjectPath" dashboard/src/App.jsx` → prints 2, 0
- **Depends:** 9.1

---

## Step 9.3 — Add keyboard shortcuts for Escape and Cmd+S
- **File:** `dashboard/src/App.jsx`
- **Action:** EDIT
- **Content:** Find the existing keyboard shortcut useEffect (the one with `metaKey` and `key === 'k'`). Replace:
  ```javascript
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  ```
  With:
  ```javascript
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setIsSettingsOpen(false);
        setIsPlanModalOpen(false);
        setConfigProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  ```
- **Done-check:** `grep -c "Escape" dashboard/src/App.jsx` → prints 1 (or more)
- **Depends:** None

---

## Step 9.4 — Debounce sidebar reorder API calls
- **File:** `dashboard/src/components/Sidebar.jsx`
- **Action:** EDIT
- **Content:** Find these lines at the top:
  ```javascript
  import React, { useState, useEffect } from 'react';
  ```
  Replace with:
  ```javascript
  import React, { useState, useEffect, useRef, useCallback } from 'react';
  ```
  Then find the `handleReorder` function. Replace:
  ```javascript
  const handleReorder = (newItems) => {
    setItems(newItems);
    if (onReorder) {
      onReorder(newItems.map(p => p.id));
    }
  };
  ```
  With:
  ```javascript
  const reorderTimer = useRef(null);

  const handleReorder = (newItems) => {
    setItems(newItems);
    if (onReorder) {
      clearTimeout(reorderTimer.current);
      reorderTimer.current = setTimeout(() => {
        onReorder(newItems.map(p => p.id));
      }, 500);
    }
  };
  ```
- **Done-check:** `grep -c "setTimeout" dashboard/src/components/Sidebar.jsx && grep -c "clearTimeout" dashboard/src/components/Sidebar.jsx` → prints 1, 1
- **Depends:** None

---

## Step 9.5 — Add SEO meta tags to index.html
- **File:** `dashboard/index.html`
- **Action:** EDIT
- **Content:** Replace entire file with:
  ```html
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="AI-Checkpoint Dashboard — Track AI agent progress, manage checkpoints, and visualize project execution in real-time." />
    <meta name="theme-color" content="#020617" />
    <meta property="og:title" content="AI-Checkpoint Dashboard" />
    <meta property="og:description" content="Track AI agent progress with atomic step management, git checkpoints, and real-time monitoring." />
    <meta property="og:type" content="website" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>" />
    <title>AI-Checkpoint Dashboard</title>
  </head>

  <body class="bg-slate-900 text-white selection:bg-violet-500/30">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>

  </html>
  ```
- **Done-check:** `grep -c "meta name" dashboard/index.html && grep -c "og:title" dashboard/index.html && grep -c "favicon" dashboard/index.html` → prints 3, 1, 0 (favicon is inline via link rel)
- **Depends:** None

---

## Step 9.6 — Add health check display to ProjectCard
- **File:** `dashboard/src/components/ProjectCard.jsx`
- **Action:** EDIT
- **Content:** Find the imports. Replace:
  ```javascript
  import React from 'react';
  import ProgressRing from './ProgressRing';
  import ExportButton from './ExportButton';
  import { Terminal, FolderOpen, Settings, Zap, Trash2 } from 'lucide-react';
  import { motion } from 'framer-motion';
  ```
  With:
  ```javascript
  import React, { useState, useEffect } from 'react';
  import ProgressRing from './ProgressRing';
  import ExportButton from './ExportButton';
  import { Terminal, FolderOpen, Settings, Zap, Trash2, ShieldCheck, ShieldX } from 'lucide-react';
  import { motion } from 'framer-motion';
  import * as api from '../utils/api';
  ```
  Then find the function declaration. Replace:
  ```javascript
  export default function ProjectCard({ project, onRemove, onOpenConfig }) {
    const { progress } = project;
  ```
  With:
  ```javascript
  export default function ProjectCard({ project, onRemove, onOpenConfig }) {
    const { progress } = project;
    const [health, setHealth] = useState(null);

    useEffect(() => {
      if (project.isInstalled) {
        api.fetchProjectHealth(project.id).then(setHealth).catch(() => {});
      }
    }, [project.id, project.isInstalled]);
  ```
  Then find the closing `</div>` of the space-y-6 div (after the buttons row). Add this BEFORE that closing `</div>`:
  ```jsx
        {health && (
          <div className="flex items-center gap-2 flex-wrap">
            {health.checks.map(c => (
              <span key={c.name} className={`text-[10px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 ${c.passed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {c.passed ? <ShieldCheck className="w-3 h-3" /> : <ShieldX className="w-3 h-3" />}
                {c.name}
              </span>
            ))}
          </div>
        )}
  ```
- **Done-check:** `grep -c "fetchProjectHealth" dashboard/src/components/ProjectCard.jsx && grep -c "ShieldCheck" dashboard/src/components/ProjectCard.jsx` → prints 1, 2
- **Depends:** None
