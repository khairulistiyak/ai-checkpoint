# Phase 35: Activity Log System

> Zero-token auto activity logging. Backend watcher logs every file change.
> কোনো AI agent token খরচ হবে না।

---

## Step 35.1 — Create activity-logger.js

- **File**: `dashboard/src/server/activity-logger.js`
- **Action**: CREATE new file
- **Done-check**: File exists and exports `ActivityLogger` class
- **Depends**: Nothing

### Complete Code:

```javascript
import fs from 'fs';
import path from 'path';

// Directories and files to IGNORE (never log these)
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  '.vite',
  '.DS_Store',
  'activity-log.jsonl',
  '.swp',
  '.swo',
  'package-lock.json',
];

// File extensions to IGNORE
const IGNORE_EXTENSIONS = [
  '.swp', '.swo', '.tmp', '.log',
];

/**
 * Checks if a file path should be ignored.
 * @param {string} relativePath - path relative to project root
 * @returns {boolean}
 */
function shouldIgnore(relativePath) {
  // Check directory patterns
  for (const pattern of IGNORE_PATTERNS) {
    if (relativePath.includes(pattern)) return true;
  }
  // Check hidden macOS files
  if (path.basename(relativePath).startsWith('._')) return true;
  // Check extensions
  const ext = path.extname(relativePath);
  if (IGNORE_EXTENSIONS.includes(ext)) return true;
  return false;
}

/**
 * ActivityLogger — writes file change entries to .agents/activity-log.jsonl
 * 
 * Format: one JSON object per line (JSONL)
 * Max entries: 5000 (oldest are trimmed)
 */
class ActivityLogger {
  /**
   * @param {string} projectPath - absolute path to the project root
   */
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.logFile = path.join(projectPath, '.agents', 'activity-log.jsonl');
    this.maxEntries = 5000;
    this.writeQueue = [];
    this.isWriting = false;
  }

  /**
   * Log a file change event.
   * @param {'CREATED'|'MODIFIED'|'DELETED'|'RESTORED'} action
   * @param {string} relativePath - file path relative to project root
   */
  log(action, relativePath) {
    // Never log ignored files
    if (shouldIgnore(relativePath)) return;

    const entry = {
      ts: new Date().toISOString(),
      action: action,
      file: relativePath,
    };

    // Try to get file size for non-deleted files
    if (action !== 'DELETED') {
      try {
        const fullPath = path.join(this.projectPath, relativePath);
        const stat = fs.statSync(fullPath);
        entry.size = stat.size;
      } catch (e) {
        // File might not exist anymore, that's ok
      }
    }

    this.writeQueue.push(entry);
    this._flush();
  }

  /**
   * Read log entries.
   * @param {number} limit - max entries to return
   * @param {number} offset - skip this many entries from the end
   * @returns {{ entries: Array, total: number }}
   */
  read(limit = 100, offset = 0) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return { entries: [], total: 0 };
      }
      const content = fs.readFileSync(this.logFile, 'utf8').trim();
      if (!content) return { entries: [], total: 0 };

      const lines = content.split('\n');
      const total = lines.length;

      // Return from newest to oldest
      const reversed = lines.reverse();
      const sliced = reversed.slice(offset, offset + limit);

      const entries = [];
      for (const line of sliced) {
        try {
          entries.push(JSON.parse(line));
        } catch (e) {
          // Skip corrupted lines
        }
      }

      return { entries, total };
    } catch (e) {
      return { entries: [], total: 0 };
    }
  }

  /**
   * Flush the write queue to disk.
   * @private
   */
  _flush() {
    if (this.isWriting || this.writeQueue.length === 0) return;
    this.isWriting = true;

    try {
      // Ensure .agents/ directory exists
      const dir = path.dirname(this.logFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Append new entries
      const lines = this.writeQueue.map(e => JSON.stringify(e)).join('\n') + '\n';
      this.writeQueue = [];
      fs.appendFileSync(this.logFile, lines, 'utf8');

      // Check if rotation is needed
      this._rotate();
    } catch (e) {
      // Logging should never crash the app
      console.error('⚠️ ActivityLogger write error:', e.message);
    } finally {
      this.isWriting = false;
    }
  }

  /**
   * Trim log file if it exceeds maxEntries.
   * @private
   */
  _rotate() {
    try {
      if (!fs.existsSync(this.logFile)) return;
      const content = fs.readFileSync(this.logFile, 'utf8').trim();
      if (!content) return;

      const lines = content.split('\n');
      if (lines.length > this.maxEntries) {
        // Keep only the newest entries
        const trimmed = lines.slice(lines.length - this.maxEntries);
        fs.writeFileSync(this.logFile, trimmed.join('\n') + '\n', 'utf8');
      }
    } catch (e) {
      // Non-critical
    }
  }
}

export { ActivityLogger, shouldIgnore };
```

---

## Step 35.2 — Add ActivityLogger to watcher.js

- **File**: `dashboard/src/server/watcher.js`
- **Action**: MODIFY — 3 small changes
- **Done-check**: Server logs file changes to `.agents/activity-log.jsonl`
- **Depends**: Step 35.1

### Change 1: Add import at top of file (line 4)

Find this line:
```javascript
import { getSettings } from './settings.js';
```

Add AFTER it:
```javascript
import { ActivityLogger } from './activity-logger.js';
```

### Change 2: Add logger to ProjectWatcher constructor (line 88-91)

Find this block:
```javascript
    this.watchers = [];
    this.debounceTimers = new Map();
    this.isRestoring = false; // prevent loops when we restore a file
```

Replace with:
```javascript
    this.watchers = [];
    this.debounceTimers = new Map();
    this.isRestoring = false; // prevent loops when we restore a file
    this.logger = new ActivityLogger(projectPath);
```

### Change 3: Add logging calls to handleFileEvent (line 159-169)

Find this method:
```javascript
  handleFileEvent(relativePath, eventType) {
    const fullPath = path.join(this.projectPath, relativePath);
    const exists = fs.existsSync(fullPath);

    if (!exists) {
      // File was DELETED
      this.handleDeletion(relativePath);
    } else {
      // File was CHANGED
      this.handleChange(relativePath);
    }
  }
```

Replace with:
```javascript
  handleFileEvent(relativePath, eventType) {
    const fullPath = path.join(this.projectPath, relativePath);
    const exists = fs.existsSync(fullPath);

    if (!exists) {
      // File was DELETED
      this.logger.log('DELETED', relativePath);
      this.handleDeletion(relativePath);
    } else {
      // File was CREATED or MODIFIED
      const action = eventType === 'rename' ? 'CREATED' : 'MODIFIED';
      this.logger.log(action, relativePath);
      this.handleChange(relativePath);
    }

    // Broadcast activity-log event to dashboard
    this.sseManager.broadcast(this.projectId, 'activity-log', {
      ts: new Date().toISOString(),
      action: exists ? (eventType === 'rename' ? 'CREATED' : 'MODIFIED') : 'DELETED',
      file: relativePath,
    });
  }
```

### Change 4: Log auto-restore events (line 257)

Find this line inside `restoreFromTemplate()`:
```javascript
      console.log(`🔄 Auto-restored: ${relativePath}`);
```

Add AFTER it:
```javascript
      this.logger.log('RESTORED', relativePath);
```

### Change 5: Log pointer restore events (line 275)

Find this line inside `restorePointerFile()`:
```javascript
      console.log(`🔄 Auto-restored pointer: ${filename}`);
```

Add AFTER it:
```javascript
      this.logger.log('RESTORED', filename);
```

---

## Step 35.3 — Add activity-log API endpoint

- **File**: `dashboard/src/server/projects.js`
- **Action**: MODIFY — add 1 new endpoint
- **Done-check**: `curl http://localhost:20226/api/projects/ID/activity-log` returns JSON
- **Depends**: Step 35.1, 35.2

### Add this endpoint BEFORE the line `export default router;`

```javascript
// ──────────────────────────────────────────────
// Activity Log — read file change history
// ──────────────────────────────────────────────

router.get('/:id/activity-log', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const offset = parseInt(req.query.offset) || 0;

  try {
    const watcher = watcherManager.watchers.get(project.id);
    if (!watcher) {
      return res.json({ entries: [], total: 0, hasMore: false });
    }
    const result = watcher.logger.read(limit, offset);
    res.json({
      entries: result.entries,
      total: result.total,
      hasMore: (offset + limit) < result.total,
    });
  } catch (e) {
    res.json({ entries: [], total: 0, hasMore: false });
  }
});
```

---

## Step 35.4 — Add SSE activity-log event to frontend hook

- **File**: `dashboard/src/hooks/useFileWatcher.js`
- **Action**: MODIFY — add 1 event listener
- **Done-check**: Hook calls `onActivityLog` callback when file changes
- **Depends**: Step 35.2

### Find this block:

```javascript
    es.addEventListener('config-updated', (e) => {
      callbacksRef.current.onRefresh?.();
    });
```

### Add AFTER it:

```javascript
    es.addEventListener('activity-log', (e) => {
      try {
        const entry = JSON.parse(e.data);
        callbacksRef.current.onActivityLog?.(entry);
      } catch (err) { /* ignore */ }
    });
```

---

## Step 35.5 — Create ActivityLog UI component

- **File**: `dashboard/src/components/ActivityLog.jsx`
- **Action**: CREATE new file
- **Done-check**: Component renders in the dashboard
- **Depends**: Step 35.3

### Complete Code:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, FileEdit, FilePlus, FileX, RotateCcw, ChevronDown } from 'lucide-react';

const BASE_URL = (window.location.port === '5173'
  ? 'http://localhost:20226'
  : window.location.origin) + '/api';

const ACTION_CONFIG = {
  CREATED:  { icon: FilePlus,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Created' },
  MODIFIED: { icon: FileEdit,   color: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'Modified' },
  DELETED:  { icon: FileX,      color: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Deleted' },
  RESTORED: { icon: RotateCcw,  color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  label: 'Restored' },
};

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (e) {
    return '--:--';
  }
}

function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Unknown';
  }
}

function groupByDate(entries) {
  const groups = {};
  for (const entry of entries) {
    const dateKey = formatDate(entry.ts);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(entry);
  }
  return groups;
}

export default function ActivityLog({ projectId, liveEntry }) {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef(null);

  // Fetch initial entries
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetch(`${BASE_URL}/projects/${projectId}/activity-log?limit=50`)
      .then(r => r.json())
      .then(data => {
        setEntries(data.entries || []);
        setTotal(data.total || 0);
        setHasMore(data.hasMore || false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  // Add live entries from SSE
  useEffect(() => {
    if (!liveEntry) return;
    setEntries(prev => [liveEntry, ...prev]);
    setTotal(prev => prev + 1);
  }, [liveEntry]);

  // Load more
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `${BASE_URL}/projects/${projectId}/activity-log?limit=50&offset=${entries.length}`
      );
      const data = await res.json();
      setEntries(prev => [...prev, ...(data.entries || [])]);
      setHasMore(data.hasMore || false);
    } catch (e) {}
    setLoadingMore(false);
  };

  const grouped = groupByDate(entries);

  if (loading) {
    return (
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 animate-pulse">
        <div className="h-6 w-40 bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-8 bg-white/5 rounded-xl" />
          <div className="h-8 bg-white/5 rounded-xl" />
          <div className="h-8 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
      className="bg-[#121214] border border-white/10 rounded-3xl p-6 relative flex flex-col shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10">
        <h2 className="text-base font-bold text-white flex items-center gap-2.5 font-outfit">
          <ScrollText className="w-4 h-4 text-white" />
          <span>Activity Log</span>
        </h2>
        <span className="text-xs font-mono text-white/50">
          {total} events
        </span>
      </div>

      {/* Entries */}
      <div ref={scrollRef} className="max-h-[320px] overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-4">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-white/30">
            <ScrollText className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No activity recorded yet</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, dateEntries]) => (
            <div key={dateLabel}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">
                {dateLabel}
              </div>
              <div className="space-y-1">
                {dateEntries.map((entry, idx) => {
                  const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.MODIFIED;
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={`${entry.ts}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
                    >
                      <span className="text-[11px] font-mono text-white/30 w-12 shrink-0">
                        {formatTime(entry.ts)}
                      </span>
                      <div className={`w-6 h-6 rounded-md ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-3 h-3 ${config.color}`} />
                      </div>
                      <span className="text-xs text-white/70 truncate group-hover:text-white transition-colors font-mono">
                        {entry.file}
                      </span>
                      {entry.size != null && (
                        <span className="text-[10px] text-white/20 ml-auto shrink-0">
                          {entry.size > 1024 ? `${(entry.size / 1024).toFixed(1)}KB` : `${entry.size}B`}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Load More */}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full py-2 text-xs text-white/40 hover:text-white/70 transition-colors flex items-center justify-center gap-2 font-mono"
          >
            <ChevronDown className="w-3 h-3" />
            {loadingMore ? 'Loading...' : `Load More (${total - entries.length} more)`}
          </button>
        )}
      </div>
    </motion.div>
  );
}
```

---

## Step 35.6 — Add ActivityLog to ProjectGrid

- **File**: `dashboard/src/components/ProjectGrid.jsx`
- **Action**: MODIFY — 2 small changes
- **Done-check**: Activity Log panel visible in project dashboard
- **Depends**: Step 35.5

### Change 1: Add import at top of file (line 1-6)

Find this line:
```javascript
import { Rocket, Sparkles, Target, Activity, Zap, Layers, FileText, ArrowRight } from 'lucide-react';
```

Add AFTER it:
```javascript
import ActivityLog from './ActivityLog';
```

### Change 2: Add component and prop

Find these props in the function signature:
```javascript
export default function ProjectGrid({
  selectedProject,
  loading,
  installing,
  onRemove,
  onOpenConfig,
  onOpenPlans,
  onInstall,
  refresh,
}) {
```

Replace with:
```javascript
export default function ProjectGrid({
  selectedProject,
  loading,
  installing,
  onRemove,
  onOpenConfig,
  onOpenPlans,
  onInstall,
  refresh,
  liveActivityEntry,
}) {
```

### Change 3: Add ActivityLog component after GitVisualizer

Find this closing tag:
```jsx
            </motion.div>
          </div>
        </>
```

Replace with:
```jsx
            </motion.div>
          </div>

          {/* 4. Activity Log Panel */}
          <ActivityLog projectId={selectedProject.id} liveEntry={liveActivityEntry} />
        </>
```

---

## Step 35.7 — Wire liveActivityEntry in App.jsx

- **File**: `dashboard/src/App.jsx`
- **Action**: MODIFY — 2 small changes
- **Done-check**: Live activity entries appear in dashboard without refresh
- **Depends**: Step 35.6

### Change 1: Add state for live activity entry

Find this line:
```javascript
  const [progressDeleteWarning, setProgressDeleteWarning] = useState(null);
```

Add AFTER it:
```javascript
  const [liveActivityEntry, setLiveActivityEntry] = useState(null);
```

### Change 2: Add onActivityLog callback to useFileWatcher

Find this block in the useFileWatcher call:
```javascript
    onPlanDeleted: (data) => {
      showToast(`🗑️ ${data.file} deleted`, 'info');
    },
```

Add AFTER it (still inside the callbacks object):
```javascript
    onActivityLog: (entry) => {
      setLiveActivityEntry(entry);
    },
```

### Change 3: Pass liveActivityEntry to ProjectPage

Find this block:
```jsx
                ) : route === 'project' ? (
                  <ProjectPage
                    project={selectedProject} installing={installing}
                    onRemove={() => setConfirmRemove(true)} onOpenConfig={() => setConfigProject(selectedProject.id)}
                    onInstall={handleInstallProject} refresh={refresh}
                    onOpenPlans={(t) => navigate(`#/project/${selectedProject.id}/plans/${t || 'progress'}`)}
                  />
```

Replace with:
```jsx
                ) : route === 'project' ? (
                  <ProjectPage
                    project={selectedProject} installing={installing}
                    onRemove={() => setConfirmRemove(true)} onOpenConfig={() => setConfigProject(selectedProject.id)}
                    onInstall={handleInstallProject} refresh={refresh}
                    onOpenPlans={(t) => navigate(`#/project/${selectedProject.id}/plans/${t || 'progress'}`)}
                    liveActivityEntry={liveActivityEntry}
                  />
```

---

## Step 35.8 — Pass liveActivityEntry through ProjectPage to ProjectGrid

- **File**: `dashboard/src/pages/ProjectPage.jsx`
- **Action**: MODIFY — 2 small changes
- **Done-check**: Prop flows from App → ProjectPage → ProjectGrid
- **Depends**: Step 35.7

### Change 1: Add prop to function signature

Find:
```javascript
export default function ProjectPage({
  project,
  installing,
  onRemove,
  onOpenConfig,
  onOpenPlans,
  onInstall,
  refresh
}) {
```

Replace with:
```javascript
export default function ProjectPage({
  project,
  installing,
  onRemove,
  onOpenConfig,
  onOpenPlans,
  onInstall,
  refresh,
  liveActivityEntry
}) {
```

### Change 2: Pass prop to ProjectGrid

Find:
```jsx
      <ProjectGrid
        selectedProject={project}
        installing={installing}
        onRemove={onRemove}
        onOpenConfig={onOpenConfig}
        onInstall={onInstall}
        refresh={refresh}
        onOpenPlans={onOpenPlans}
      />
```

Replace with:
```jsx
      <ProjectGrid
        selectedProject={project}
        installing={installing}
        onRemove={onRemove}
        onOpenConfig={onOpenConfig}
        onInstall={onInstall}
        refresh={refresh}
        onOpenPlans={onOpenPlans}
        liveActivityEntry={liveActivityEntry}
      />
```

---

## Step 35.9 — Add recursive watching for full project

- **File**: `dashboard/src/server/watcher.js`
- **Action**: MODIFY — add 1 new method + call it from start()
- **Done-check**: Watcher logs changes from ALL project directories (not just .agents/ and plan/)
- **Depends**: Step 35.2

### Change 1: Add new method to ProjectWatcher class

Add this method AFTER the `watchRootPointerFiles()` method:

```javascript
  watchProjectFiles() {
    // Watch entire project recursively for activity logging
    // macOS FSEvents handles recursive watching efficiently
    try {
      const watcher = fs.watch(this.projectPath, { recursive: true }, (eventType, filename) => {
        if (!filename || this.isRestoring) return;
        // Skip directories we already watch or should ignore
        if (filename.startsWith('node_modules') ||
            filename.startsWith('.git' + path.sep) ||
            filename === '.git' ||
            filename.startsWith('dist' + path.sep) ||
            filename.startsWith('.vite' + path.sep) ||
            filename.startsWith('.agents' + path.sep) ||
            filename.startsWith('plan' + path.sep) ||
            filename.startsWith('._') ||
            path.basename(filename).startsWith('._') ||
            filename === '.DS_Store' ||
            filename === 'activity-log.jsonl' ||
            filename.endsWith('.swp') ||
            filename.endsWith('.swo')) {
          return;
        }
        this.debounce('proj:' + filename, () => {
          const fullPath = path.join(this.projectPath, filename);
          const exists = fs.existsSync(fullPath);
          const action = exists ? (eventType === 'rename' ? 'CREATED' : 'MODIFIED') : 'DELETED';
          this.logger.log(action, filename);
          this.sseManager.broadcast(this.projectId, 'activity-log', {
            ts: new Date().toISOString(),
            action: action,
            file: filename,
          });
        });
      });
      this.watchers.push(watcher);
      watcher.on('error', () => { /* non-critical */ });
    } catch (e) {
      // Recursive watching may not be supported on all platforms
      console.error('⚠️ Recursive watch not available:', e.message);
    }
  }
```

### Change 2: Call it from start()

Find:
```javascript
  start() {
    this.watchDirectory(path.join(this.projectPath, '.agents'), '.agents');
    this.watchDirectory(path.join(this.projectPath, 'plan'), 'plan');
    this.watchRootPointerFiles();
    console.log(`👁️  Watching: ${this.projectPath}`);
  }
```

Replace with:
```javascript
  start() {
    this.watchDirectory(path.join(this.projectPath, '.agents'), '.agents');
    this.watchDirectory(path.join(this.projectPath, 'plan'), 'plan');
    this.watchRootPointerFiles();
    this.watchProjectFiles();
    console.log(`👁️  Watching: ${this.projectPath}`);
  }
```

---

## Execution Order

```
35.1  →  Create activity-logger.js         (new file, no dependencies)
35.2  →  Add logger to watcher.js          (needs 35.1)
35.3  →  Add API endpoint                  (needs 35.1, 35.2)
35.4  →  Add SSE event to frontend hook    (needs 35.2)
35.5  →  Create ActivityLog component      (needs 35.3)
35.6  →  Add to ProjectGrid               (needs 35.5)
35.7  →  Wire in App.jsx                   (needs 35.4, 35.6)
35.8  →  Pass prop through ProjectPage     (needs 35.7)
35.9  →  Add recursive project watching    (needs 35.2)
```
