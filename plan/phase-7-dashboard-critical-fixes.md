# Phase 7 — Dashboard Critical Fixes

> Fix security holes, replace all alert/confirm with toast, add error boundary.

---

## Step 7.1 — Sanitize hash and message inputs in server API
- **File:** `dashboard/src/server/api.js`
- **Action:** EDIT
- **Content:** Find the rollback route (around line 308). Replace:
  ```javascript
  const { hash } = req.body;
  if (!hash) return res.status(400).json({ error: 'Hash required' });

  try {
    // Very dangerous, but requested feature:
    execSync(`git reset --hard ${hash}`, { cwd: project.path });
  ```
  With:
  ```javascript
  const { hash } = req.body;
  if (!hash) return res.status(400).json({ error: 'Hash required' });
  if (!/^[a-f0-9]{4,40}$/i.test(hash)) return res.status(400).json({ error: 'Invalid hash format' });

  try {
    execSync(`git reset --hard ${hash}`, { cwd: project.path });
  ```
  Then find the command route (around line 326). Replace:
  ```javascript
  if (command === 'start') {
      execSync(`./l start ${step}`, { cwd });
    } else if (command === 'complete') {
      execSync(`./l c ${step} "${message || 'Completed via Dashboard'}"`, { cwd });
  ```
  With:
  ```javascript
  if (!/^\d+\.\d+$/.test(step)) return res.status(400).json({ error: 'Invalid step format. Use X.Y' });
    const safeMessage = (message || 'Completed via Dashboard').replace(/["`$\\]/g, '');
    if (command === 'start') {
      execSync(`./l start ${step}`, { cwd });
    } else if (command === 'complete') {
      execSync(`./l c ${step} "${safeMessage}"`, { cwd });
  ```
  Then find the config write route (around line 372). Replace:
  ```javascript
  const { rules, agents } = req.body;
  const rulesPath = path.join(project.path, '.agents', 'RULES.md');
  const agentsPath = path.join(project.path, '.agents', 'AGENTS.md');
  
  try {
    if (rules !== undefined) fs.writeFileSync(rulesPath, rules);
    if (agents !== undefined) fs.writeFileSync(agentsPath, agents);
  ```
  With:
  ```javascript
  const { rules, agents } = req.body;
  const MAX_SIZE = 50 * 1024; // 50KB limit
  if (rules !== undefined && rules.length > MAX_SIZE) return res.status(400).json({ error: 'Rules content too large (max 50KB)' });
  if (agents !== undefined && agents.length > MAX_SIZE) return res.status(400).json({ error: 'Agents content too large (max 50KB)' });
  const rulesPath = path.join(project.path, '.agents', 'RULES.md');
  const agentsPath = path.join(project.path, '.agents', 'AGENTS.md');
  
  try {
    if (rules !== undefined) fs.writeFileSync(rulesPath, rules);
    if (agents !== undefined) fs.writeFileSync(agentsPath, agents);
  ```
- **Done-check:** `grep -c "Invalid hash format" dashboard/src/server/api.js && grep -c "Invalid step format" dashboard/src/server/api.js && grep -c "MAX_SIZE" dashboard/src/server/api.js` → prints 1, 1, 2
- **Depends:** None

---

## Step 7.2 — Create ConfirmModal component
- **File:** `dashboard/src/components/ConfirmModal.jsx`
- **Action:** CREATE
- **Content:**
  ```jsx
  import React from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { AlertTriangle, X } from 'lucide-react';

  export default function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, danger }) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onCancel}></div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-card p-6 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 border border-white/[0.08]"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
              <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-amber-400'}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title || 'Confirm'}</h3>
              <p className="text-sm text-slate-400 mt-1">{message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              {cancelText || 'Cancel'}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${danger
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                : 'btn-primary'
              }`}
            >
              {confirmText || 'Confirm'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  ```
- **Done-check:** `test -f dashboard/src/components/ConfirmModal.jsx && grep -q "ConfirmModal" dashboard/src/components/ConfirmModal.jsx && echo OK` → prints OK
- **Depends:** None

---

## Step 7.3 — Replace alert/confirm in GitVisualizer
- **File:** `dashboard/src/components/GitVisualizer.jsx`
- **Action:** EDIT
- **Content:** Replace the entire file with:
  ```jsx
  import React, { useState, useEffect } from 'react';
  import { GitCommit, Clock, RotateCcw, Loader2 } from 'lucide-react';
  import { motion } from 'framer-motion';
  import * as api from '../utils/api';
  import { useToast } from './ToastProvider';
  import ConfirmModal from './ConfirmModal';

  export default function GitVisualizer({ projectId, onRefresh }) {
    const { showToast } = useToast();
    const [checkpoints, setCheckpoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rollingBack, setRollingBack] = useState(false);
    const [confirmHash, setConfirmHash] = useState(null);

    useEffect(() => {
      let cancelled = false;
      async function load() {
        try {
          const data = await api.fetchProjectCheckpoints(projectId);
          if (!cancelled) setCheckpoints(data);
        } catch (err) {
          console.error(err);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
      setLoading(true);
      load();
      const interval = setInterval(load, 30000);
      return () => { cancelled = true; clearInterval(interval); };
    }, [projectId]);

    const handleRollback = async () => {
      if (!confirmHash) return;
      setRollingBack(true);
      try {
        await api.rollbackCheckpoint(projectId, confirmHash);
        showToast('Rollback successful!', 'success');
        if (onRefresh) onRefresh();
      } catch (err) {
        showToast(`Rollback failed: ${err.message}`, 'error');
      } finally {
        setRollingBack(false);
        setConfirmHash(null);
      }
    };

    if (loading) {
      return (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
        </div>
      );
    }

    if (checkpoints.length === 0) {
      return (
        <div className="h-full flex items-center justify-center p-8 text-center text-slate-400 italic">
          No checkpoints found. Use `./l cp save "message"` to create one.
        </div>
      );
    }

    return (
      <>
        <div className="relative min-h-full py-2">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-700/50"></div>
          <div className="space-y-6">
            {checkpoints.map((cp, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={cp.hash}
                className="flex items-start gap-4 group relative z-10"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-primary-500/50 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.2)] mt-1 group-hover:border-accent-400 transition-colors z-10">
                  <div className="w-2 h-2 rounded-full bg-primary-400 group-hover:bg-accent-400 transition-colors"></div>
                </div>
                <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-4 group-hover:border-slate-600 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-mono text-xs text-accent-300 bg-accent-500/10 px-2 py-0.5 rounded border border-accent-500/20 shrink-0">{cp.hash}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {cp.timeAgo}
                      </span>
                      <span className="text-xs text-slate-500 truncate">{cp.author}</span>
                    </div>
                    <div className="text-slate-200 text-sm truncate pr-2" title={cp.message}>{cp.message.replace(/^(?:aicp\/[^\s]+|checkpoint:)\s*/i, '')}</div>
                  </div>
                  <button
                    onClick={() => setConfirmHash(cp.hash)}
                    disabled={rollingBack}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg text-xs font-medium transition-colors border border-transparent hover:border-red-500/30 flex items-center justify-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto mt-2 sm:mt-0"
                  >
                    {rollingBack ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    Rollback
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <ConfirmModal
          isOpen={!!confirmHash}
          title="Rollback Checkpoint"
          message={`This will reset the project to checkpoint ${confirmHash}. All unsaved changes will be lost.`}
          confirmText="Yes, Rollback"
          cancelText="Cancel"
          danger={true}
          onConfirm={handleRollback}
          onCancel={() => setConfirmHash(null)}
        />
      </>
    );
  }
  ```
- **Done-check:** `grep -c "useToast" dashboard/src/components/GitVisualizer.jsx && grep -c "ConfirmModal" dashboard/src/components/GitVisualizer.jsx && grep -c "alert" dashboard/src/components/GitVisualizer.jsx` → prints 1, 2, 0
- **Depends:** 7.2

---

## Step 7.4 — Replace alert in ConfigEditor
- **File:** `dashboard/src/components/ConfigEditor.jsx`
- **Action:** EDIT
- **Content:** Find line 1 imports. Replace:
  ```javascript
  import React, { useState, useEffect } from 'react';
  import { Save, FileText, Code2, Loader2, X } from 'lucide-react';
  import { motion, AnimatePresence } from 'framer-motion';
  import * as api from '../utils/api';
  ```
  With:
  ```javascript
  import React, { useState, useEffect } from 'react';
  import { Save, FileText, Code2, Loader2, X } from 'lucide-react';
  import { motion, AnimatePresence } from 'framer-motion';
  import * as api from '../utils/api';
  import { useToast } from './ToastProvider';
  ```
  Then find the `handleSave` function. Replace:
  ```javascript
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateConfig(projectId, { rules: rulesContent, agents: agentsContent });
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };
  ```
  With:
  ```javascript
  const { showToast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateConfig(projectId, { rules: rulesContent, agents: agentsContent });
      showToast('Config saved successfully!', 'success');
    } catch (err) {
      showToast(`Failed to save: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };
  ```
- **Done-check:** `grep -c "useToast" dashboard/src/components/ConfigEditor.jsx && grep -c "alert" dashboard/src/components/ConfigEditor.jsx` → prints 2, 0
- **Depends:** None

---

## Step 7.5 — Replace confirm in App.jsx remove handler
- **File:** `dashboard/src/App.jsx`
- **Action:** EDIT
- **Content:** Find the import block at line 1. Add this import after the existing imports:
  ```javascript
  import ConfirmModal from './components/ConfirmModal';
  ```
  Then find the state declarations (around line 31). Add after `const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);`:
  ```javascript
  const [confirmRemove, setConfirmRemove] = useState(false);
  ```
  Then find `handleRemoveProject`. Replace:
  ```javascript
  const handleRemoveProject = async () => {
    if (confirm('Remove this project from the dashboard?')) {
      await removeProject(selectedId);
      setSelectedId(null);
      showToast('Project removed', 'info');
    }
  };
  ```
  With:
  ```javascript
  const handleRemoveProject = () => {
    setConfirmRemove(true);
  };

  const doRemoveProject = async () => {
    await removeProject(selectedId);
    setSelectedId(null);
    setConfirmRemove(false);
    showToast('Project removed', 'info');
  };
  ```
  Then find the `{isSettingsOpen &&` block near the end of the JSX (around line 377). Add this right BEFORE the closing `</div>` of the main component:
  ```jsx
      <ConfirmModal
        isOpen={confirmRemove}
        title="Remove Project"
        message="Remove this project from the dashboard? The files on disk will not be deleted."
        confirmText="Remove"
        cancelText="Keep"
        danger={true}
        onConfirm={doRemoveProject}
        onCancel={() => setConfirmRemove(false)}
      />
  ```
- **Done-check:** `grep -c "ConfirmModal" dashboard/src/App.jsx && grep -c "confirm(" dashboard/src/App.jsx` → prints 3, 0
- **Depends:** 7.2

---

## Step 7.6 — Create ErrorBoundary component
- **File:** `dashboard/src/components/ErrorBoundary.jsx`
- **Action:** CREATE
- **Content:**
  ```jsx
  import React from 'react';
  import { AlertTriangle, RefreshCw } from 'lucide-react';

  export default class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="h-screen w-screen bg-[#020617] flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">Something Went Wrong</h1>
              <p className="text-slate-400 mb-6 text-sm">
                {this.state.error?.message || 'An unexpected error occurred.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Dashboard
              </button>
            </div>
          </div>
        );
      }
      return this.props.children;
    }
  }
  ```
- **Done-check:** `test -f dashboard/src/components/ErrorBoundary.jsx && grep -q "getDerivedStateFromError" dashboard/src/components/ErrorBoundary.jsx && echo OK` → prints OK
- **Depends:** None

---

## Step 7.7 — Wrap App with ErrorBoundary in main.jsx
- **File:** `dashboard/src/main.jsx`
- **Action:** EDIT
- **Content:** Replace entire file with:
  ```jsx
  import React from 'react'
  import ReactDOM from 'react-dom/client'
  import App from './App.jsx'
  import './index.css'
  import { ToastProvider } from './components/ToastProvider.jsx'
  import { ThemeProvider } from './components/ThemeProvider.jsx'
  import ErrorBoundary from './components/ErrorBoundary.jsx'

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  )
  ```
- **Done-check:** `grep -c "ErrorBoundary" dashboard/src/main.jsx` → prints 2
- **Depends:** 7.6
