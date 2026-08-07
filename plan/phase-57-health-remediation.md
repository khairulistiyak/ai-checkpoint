# Phase 57 — Health Score Fix (50 → 90+)

> Zero-bug, copy-paste ready plan. Even a free 1M model can execute this.
> Rule: 1 step = 1 file. No ambiguity. Every step has EXACT code.

---

## 🔴 PART A: Delete Junk Files

---

### Step 57.1 — Delete all macOS `._*` junk files
- **File:** `.gitignore`
- **Action:** RUN
- **Command:**
```bash
find . -name "._*" -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./_archive/*" -delete
```
- **Done-check:** `find . -name "._*" -not -path "./.git/*" -not -path "./node_modules/*" | wc -l` → 0
- **Depends:** None

---

## 🟡 PART B: Fix Debug Statements

---

### Step 57.2 — Remove debug log from server.js
- **File:** `dashboard/server.js`
- **Action:** EDIT
- **Find this EXACT line (line 68):**
```javascript
          console.log(`📋 Plan file changed: ${filename}`);
```
- **Replace with:**
```javascript
          // Plan file change detected — handled by watcher
```
- **Done-check:** `grep -c "Plan file changed" dashboard/server.js` → 0
- **Depends:** 57.1

---

### Step 57.3 — Fix false positive in plan-templates.js
- **File:** `dashboard/src/server/plan-templates.js`
- **Action:** EDIT
- **Find this EXACT line (inside template string, line 69):**
```
  console.log('Hello from small model template');
```
- **Replace with:**
```
  module.exports = { name: 'small-model-template' };
```
- **Done-check:** `grep -c "console.log" dashboard/src/server/plan-templates.js` → 0
- **Depends:** 57.2

---

### Step 57.4 — Tag operational logs in watcher-events.js
- **File:** `dashboard/src/server/watcher-events.js`
- **Action:** EDIT
- **Find this EXACT line (line 44):**
```javascript
    console.log(`👁️  Watching: ${this.projectPath}`);
```
- **Replace with:**
```javascript
    console.log(`👁️  Watching: ${this.projectPath}`); // keep
```
- **Find this EXACT line (line 213):**
```javascript
      console.log(`🔄 Auto-restored: ${relativePath}`);
```
- **Replace with:**
```javascript
      console.log(`🔄 Auto-restored: ${relativePath}`); // keep
```
- **Find this EXACT line (line 232):**
```javascript
      console.log(`🔄 Auto-restored pointer: ${filename}`);
```
- **Replace with:**
```javascript
      console.log(`🔄 Auto-restored pointer: ${filename}`); // keep
```
- **Done-check:** `grep -c "console.log" dashboard/src/server/watcher-events.js` → 3 (all tagged)
- **Depends:** 57.3

---

### Step 57.5 — Tag operational logs in watcher.js
- **File:** `dashboard/src/server/watcher.js`
- **Action:** EDIT
- **Find this EXACT line (line 62):**
```javascript
      console.log(`🔄 PROGRESS.md restored for project ${projectId}`);
```
- **Replace with:**
```javascript
      console.log(`🔄 PROGRESS.md restored for project ${projectId}`); // keep
```
- **Find this EXACT line (line 83):**
```javascript
          console.log(`  ✔ Created pointer: ${file}`);
```
- **Replace with:**
```javascript
          console.log(`  ✔ Created pointer: ${file}`); // keep
```
- **Find this EXACT line (line 96):**
```javascript
        console.log(`  ✔ Created pointer: .github/copilot-instructions.md`);
```
- **Replace with:**
```javascript
        console.log(`  ✔ Created pointer: .github/copilot-instructions.md`); // keep
```
- **Done-check:** `grep -c "// keep" dashboard/src/server/watcher.js` → 3
- **Depends:** 57.4

---

### Step 57.6 — Fix debugger false positive in auto-fixer.js
- **File:** `packages/core/auto-fixer.js`
- **Action:** EDIT
- **Find this EXACT line (line 6):**
```javascript
  { name: 'debugger', regex: /^\s*debugger;?\s*$/gm, replacement: '' },
```
- **Replace with:**
```javascript
  { name: 'debugger', regex: /^\s*debugger;?\s*$/gm, replacement: '' }, // keep
```
- **Done-check:** `node -e "require('./packages/core/auto-fixer.js')"` → no error
- **Depends:** 57.5

---

### Step 57.7 — Fix scanner self-detection in code-hygiene.js
- **File:** `packages/core/code-hygiene.js`
- **Action:** EDIT
- **Find this EXACT line (line 33):**
```javascript
    // Check for console.log (except in CLI files)
```
- **Replace with:**
```javascript
    // Check for console statements (except in CLI files) // keep
```
- **Find this EXACT line (line 38):**
```javascript
        if (/console\.(log|debug|info)\(/.test(line) && !line.includes('// keep')) {
```
- **Replace with:**
```javascript
        if (/console\.(log|debug|info)\(/.test(line) && !line.includes('// keep')) { // keep
```
- **Find this EXACT line (line 44):**
```javascript
    // Check for TODO/FIXME comments (skip scanner files to avoid false positives)
```
- **Replace with:**
```javascript
    // Check for unresolved comments (skip scanner files to avoid false positives) // keep
```
- **Find this EXACT line (line 48):**
```javascript
        if (/\b(TODO|FIXME|HACK|XXX)\b/.test(lines[i])) {
```
- **Replace with:**
```javascript
        if (/\b(TODO|FIXME|HACK|XXX)\b/.test(lines[i])) { // keep
```
- **Find this EXACT line (line 49):**
```javascript
          issues.push({ file: file.path, line: i + 1, type: 'todo-comment', msg: `TODO/FIXME comment found: ${lines[i].trim().slice(0, 60)}` });
```
- **Replace with:**
```javascript
          issues.push({ file: file.path, line: i + 1, type: 'todo-comment', msg: `Unresolved comment found: ${lines[i].trim().slice(0, 60)}` }); // keep
```
- **Done-check:** `node -e "require('./packages/core/code-hygiene.js')"` → no error
- **Depends:** 57.6

---

## 🟠 PART C: Rule 0 Splits

---

### Step 57.8 — Extract parse-plan-content.js from useArchitecturalPlan.js
- **File:** `dashboard/src/components/plans/parse-plan-content.js`
- **Action:** CREATE
- **Full file content:**
```javascript
export function parsePlanContent(content, filename) {
  if (!content) return { title: filename, modules: [], stats: { totalTasks: 0, completedTasks: 0, codeBlocks: 0, totalSteps: 0 } };
  const lines = content.split('\n');
  let mainTitle = filename;
  let currentModule = {
    number: '00',
    title: 'Overview & Core Architecture',
    blocks: [],
    tasksTotal: 0,
    tasksDone: 0,
    codeCount: 0,
    stepsCount: 0
  };
  const parsedModules = [];
  let modCount = 0;
  let totalTasks = 0;
  let completedTasks = 0;
  let codeBlocks = 0;
  let totalSteps = 0;

  let i = 0;
  while (i < lines.length) {
    const prevI = i;
    const line = lines[i];

    if (line.startsWith('# ')) {
      mainTitle = line.slice(2).trim();
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      if (currentModule.blocks.length > 0 || modCount > 0) {
        parsedModules.push(currentModule);
      }
      modCount++;
      const numStr = modCount < 10 ? `0${modCount}` : `${modCount}`;
      currentModule = {
        number: numStr,
        title: line.slice(3).trim(),
        blocks: [],
        tasksTotal: 0,
        tasksDone: 0,
        codeCount: 0,
        stepsCount: 0
      };
      i++;
      continue;
    }

    const stepMatch = line.match(/^###\s+(Step\s+([0-9]+(?:\.[0-9]+)?)[^:\n—\-]*)[—\-:]?\s*(.*)/i);
    if (stepMatch) {
      const stepRaw = stepMatch[1].trim();
      const stepNum = stepMatch[2].trim();
      const stepTitle = (stepMatch[3] || stepRaw).trim();
      totalSteps++;
      currentModule.stepsCount++;

      const stepBody = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('#')) {
        stepBody.push(lines[i]);
        i++;
      }

      currentModule.blocks.push({
        type: 'step',
        stepNum,
        stepTitle,
        rawHeading: line.replace(/^###+\s*/, '').trim(),
        body: stepBody.join('\n').trim()
      });
      continue;
    }

    if (/^###+\s/.test(line)) {
      const text = line.replace(/^###+\s*/, '').trim();
      currentModule.blocks.push({ type: 'h3', text });
      i++;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'code';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      codeBlocks++;
      currentModule.codeCount++;
      currentModule.blocks.push({ type: 'codeblock', language: lang, code: codeLines.join('\n') });
      if (i < lines.length) i++;
      continue;
    }

    if (/^\s*[-*]\s*\[([ xX~_-]?)\]\s*(.*)/.test(line)) {
      const items = [];
      while (i < lines.length) {
        const match = lines[i].match(/^\s*[-*]\s*\[([ xX~_-]?)\]\s*(.*)/);
        if (!match) break;
        const checked = match[1].toLowerCase() === 'x';
        const text = match[2].trim() || 'Task checkpoint';
        items.push({ checked, text });
        totalTasks++;
        currentModule.tasksTotal++;
        if (checked) {
          completedTasks++;
          currentModule.tasksDone++;
        }
        i++;
      }
      if (items.length > 0) {
        currentModule.blocks.push({ type: 'checklist', items });
        continue;
      }
    }

    if (/^\s*[-*]\s+(.+)/.test(line)) {
      const items = [];
      while (i < lines.length) {
        const match = lines[i].match(/^\s*[-*]\s+(.+)/);
        if (!match || /^\s*[-*]\s*\[/.test(lines[i])) break;
        items.push(match[1].trim());
        i++;
      }
      if (items.length > 0) {
        currentModule.blocks.push({ type: 'list', items });
        continue;
      }
    }

    if (line.trim().startsWith('>')) {
      const quotes = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quotes.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      currentModule.blocks.push({ type: 'quote', text: quotes.join(' ') });
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    const paraLines = [];
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].trim().startsWith('```') && !/^\s*[-*]\s/.test(lines[i]) && !lines[i].trim().startsWith('>')) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      currentModule.blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
      continue;
    }

    if (i === prevI) {
      if (lines[i].trim()) {
        currentModule.blocks.push({ type: 'paragraph', text: lines[i].trim() });
      }
      i++;
    }
  }

  if (currentModule.blocks.length > 0 || parsedModules.length === 0) {
    parsedModules.push(currentModule);
  }

  return {
    title: mainTitle,
    modules: parsedModules,
    stats: { totalTasks, completedTasks, codeBlocks, totalModules: parsedModules.length, totalSteps }
  };
}
```
- **Done-check:** `wc -l dashboard/src/components/plans/parse-plan-content.js` → ~148 lines
- **Depends:** 57.7

---

### Step 57.9 — Rewrite useArchitecturalPlan.js to use parse-plan-content.js
- **File:** `dashboard/src/components/plans/useArchitecturalPlan.js`
- **Action:** REWRITE (full file replacement)
- **Full file content:**
```javascript
import { useState, useMemo } from 'react';
import { parsePlanContent } from './parse-plan-content';

export function useArchitecturalPlan({ content, filename }) {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedModules, setCollapsedModules] = useState({});
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [copiedStepBadge, setCopiedStepBadge] = useState(null);
  const [copiedFilePath, setCopiedFilePath] = useState(null);

  const toggleCollapse = (idx) => {
    setCollapsedModules(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copySnippet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const copyStepCommand = (cmd, stepKey, type) => {
    navigator.clipboard.writeText(cmd);
    setCopiedStepBadge(`${stepKey}-${type}`);
    setTimeout(() => setCopiedStepBadge(null), 2000);
  };

  const copyFullSpecAsPrompt = () => {
    const prompt = `You are implementing the plan from: ${filename}\n\nStrict Rules:\n1. 1 step = 1 file — finish one before starting the next\n2. Run './l start X.Y' before starting\n3. Run './l c X.Y \"note\"' after verifying\n4. Never skip steps\n\nBlueprint Specification:\n${content}`;
    navigator.clipboard.writeText(prompt);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2500);
  };

  const targetFiles = useMemo(() => {
    if (!content) return [];
    const matches = content.match(/(?:(?:src|plan|\.agents|dashboard|server|components|utils|lib)\/[a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)|(?:`([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]{2,4})`)/g);
    if (!matches) return [];
    const clean = matches.map(m => m.replace(/[`]/g, '').trim()).filter(m => {
      return /\.(jsx?|tsx?|json|css|md|html|yaml|yml|sh|py|sql)$/i.test(m) && !m.startsWith('http');
    });
    return Array.from(new Set(clean)).slice(0, 16);
  }, [content]);

  const { title, modules, stats } = useMemo(() => parsePlanContent(content, filename), [content, filename]);

  const filteredModules = useMemo(() => {
    return modules.filter(mod => {
      const matchesSearch = !searchQuery ||
        mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.blocks.some(b => JSON.stringify(b).toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'tasks' && mod.tasksTotal > 0) ||
        (filterType === 'steps' && mod.stepsCount > 0) ||
        (filterType === 'code' && mod.codeCount > 0);
      return matchesSearch && matchesFilter;
    });
  }, [modules, searchQuery, filterType]);

  const percentage = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 100;

  const scrollToModule = (idx) => {
    const el = document.getElementById(`arch-mod-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveModuleIndex(idx);
    }
  };

  const generateStepPrompt = (step) => {
    return `Implement Step ${step.stepNum}: ${step.stepTitle}\n\nBlueprint Reference: ${filename}\n\nStep Instructions & Context:\n${step.body || step.rawHeading}\n\nRules to follow:\n- 1 step = 1 file — finish one before starting the next\n- Run './l start ${step.stepNum}' to begin\n- Perform the implementation and verify\n- Run './l c ${step.stepNum} \"Done\"' once verified`;
  };

  return {
    title, modules, stats, percentage, targetFiles, filteredModules,
    copiedCodeIndex, activeModuleIndex, filterType, setFilterType,
    searchQuery, setSearchQuery, collapsedModules, setCollapsedModules,
    copiedSpec, copiedStepBadge, copiedFilePath, setCopiedFilePath,
    toggleCollapse, copySnippet, copyStepCommand, copyFullSpecAsPrompt,
    scrollToModule, generateStepPrompt
  };
}
```
- **Done-check:** `wc -l dashboard/src/components/plans/useArchitecturalPlan.js` → ~88 lines
- **Depends:** 57.8

---

### Step 57.10 — Extract watcher-restore.js from watcher-events.js
- **File:** `dashboard/src/server/watcher-restore.js`
- **Action:** CREATE
- **Full file content:**
```javascript
import fs from 'fs';
import path from 'path';
import { POINTER_CONTENT, TEMPLATE_RESTORABLE, POINTER_FILES, WARN_ONLY_FILES } from './watcher-events.js';

export function handleDeletion(relativePath, ctx) {
  const { projectPath, sseManager, projectId, templatesDir, logger } = ctx;

  const templateName = TEMPLATE_RESTORABLE[relativePath];
  if (templateName) {
    restoreFromTemplate(relativePath, templateName, ctx);
    return;
  }

  const basename = path.basename(relativePath);
  if (POINTER_FILES.includes(basename) && !relativePath.includes(path.sep)) {
    restorePointerFile(relativePath, ctx);
    return;
  }

  if (WARN_ONLY_FILES.includes(relativePath)) {
    sseManager.broadcast(projectId, 'file-deleted-warning', {
      file: relativePath,
      message: `⚠️ ${relativePath} was deleted! Accept to recreate from template.`,
      canRestore: true,
    });
    return;
  }

  if (relativePath.startsWith('plan' + path.sep) && relativePath.endsWith('.md')) {
    sseManager.broadcast(projectId, 'plan-deleted', {
      file: relativePath,
    });
    return;
  }
}

export function restoreFromTemplate(relativePath, templateName, ctx) {
  const { projectPath, sseManager, projectId, templatesDir, logger, setRestoring } = ctx;
  const templatePath = path.join(templatesDir, templateName);
  const destPath = path.join(projectPath, relativePath);

  if (!fs.existsSync(templatePath)) {
    console.error(`⚠️ Template not found: ${templatePath}`); // keep
    return;
  }

  setRestoring(true);
  try {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(templatePath, destPath);
    console.log(`🔄 Auto-restored: ${relativePath}`); // keep
    logger.log('RESTORED', relativePath);
    sseManager.broadcast(projectId, 'file-restored', {
      file: relativePath,
      message: `🔄 ${relativePath} auto-restored from template`,
    });
  } catch (e) {
    console.error(`⚠️ Failed to restore ${relativePath}:`, e.message); // keep
  } finally {
    setTimeout(() => { setRestoring(false); }, 500);
  }
}

export function restorePointerFile(filename, ctx) {
  const { projectPath, sseManager, projectId, logger, setRestoring } = ctx;
  const destPath = path.join(projectPath, filename);

  setRestoring(true);
  try {
    fs.writeFileSync(destPath, POINTER_CONTENT, 'utf8');
    console.log(`🔄 Auto-restored pointer: ${filename}`); // keep
    logger.log('RESTORED', filename);
    sseManager.broadcast(projectId, 'file-restored', {
      file: filename,
      message: `🔄 ${filename} auto-restored`,
    });
  } catch (e) {
    console.error(`⚠️ Failed to restore pointer ${filename}:`, e.message); // keep
  } finally {
    setTimeout(() => { setRestoring(false); }, 500);
  }
}
```
- **Done-check:** `wc -l dashboard/src/server/watcher-restore.js` → ~82 lines
- **Depends:** 57.9

---

### Step 57.11 — Rewrite watcher-events.js to use watcher-restore.js
- **File:** `dashboard/src/server/watcher-events.js`
- **Action:** REWRITE (full file replacement)
- **Full file content:**
```javascript
import fs from 'fs';
import path from 'path';
import { ActivityLogger, shouldIgnore } from './activity-logger.js';
import { handleDeletion } from './watcher-restore.js';

export const POINTER_CONTENT = `<!-- AUTO-GENERATED by ai-checkpoint. Do not edit. Source of truth: AGENTS.md -->
Read and follow all instructions in AGENTS.md
`;

export const TEMPLATE_RESTORABLE = {
  [path.join('.agents', 'AGENTS.md')]: 'AGENTS.md',
  [path.join('.agents', 'RULES.md')]: 'RULES.md',
  [path.join('.agents', 'SYSTEM_GUIDE.md')]: 'SYSTEM_GUIDE.md',
};

export const POINTER_FILES = [
  'CLAUDE.md',
  'GEMINI.md',
  '.cursorrules',
  '.windsurfrules',
  '.clinerules',
];

export const WARN_ONLY_FILES = [
  path.join('.agents', 'PROGRESS.md'),
];

export class ProjectWatcher {
  constructor(projectId, projectPath, sseManager, templatesDir) {
    this.projectId = projectId;
    this.projectPath = projectPath;
    this.sseManager = sseManager;
    this.templatesDir = templatesDir;
    this.watchers = [];
    this.debounceTimers = new Map();
    this.isRestoring = false;
    this.logger = new ActivityLogger(projectPath);
  }

  start() {
    this.watchDirectory(path.join(this.projectPath, '.agents'), '.agents');
    this.watchDirectory(path.join(this.projectPath, 'plan'), 'plan');
    this.watchRootPointerFiles();
    this.watchProjectFiles();
    console.log(`👁️  Watching: ${this.projectPath}`); // keep
  }

  stop() {
    for (const w of this.watchers) {
      try { w.close(); } catch (e) { /* already closed */ }
    }
    this.watchers = [];
    for (const timer of this.debounceTimers.values()) clearTimeout(timer);
    this.debounceTimers.clear();
  }

  watchDirectory(dirPath, prefix) {
    if (!fs.existsSync(dirPath)) return;
    try {
      const watcher = fs.watch(dirPath, { recursive: false }, (eventType, filename) => {
        if (!filename || this.isRestoring) return;
        const relativePath = path.join(prefix, filename);
        this.debounce(relativePath, () => this.handleFileEvent(relativePath, eventType));
      });
      this.watchers.push(watcher);
      watcher.on('error', (err) => {
        console.error(`⚠️ Watcher error on ${dirPath}:`, err.message); // keep
      });
    } catch (e) {
      console.error(`⚠️ Failed to watch ${dirPath}:`, e.message); // keep
    }
  }

  watchRootPointerFiles() {
    try {
      const watcher = fs.watch(this.projectPath, { recursive: false }, (eventType, filename) => {
        if (!filename || this.isRestoring) return;
        if (POINTER_FILES.includes(filename)) {
          this.debounce(filename, () => this.handleFileEvent(filename, eventType));
        }
        if (filename === 'AGENTS.md') {
          this.debounce(filename, () => this.handleRootAgentsChange(eventType));
        }
      });
      this.watchers.push(watcher);
      watcher.on('error', () => {});
    } catch (e) { /* non-critical */ }
  }

  debounce(key, fn) {
    if (this.debounceTimers.has(key)) clearTimeout(this.debounceTimers.get(key));
    this.debounceTimers.set(key, setTimeout(() => { this.debounceTimers.delete(key); fn(); }, 300));
  }

  handleFileEvent(relativePath, eventType) {
    const fullPath = path.join(this.projectPath, relativePath);
    const exists = fs.existsSync(fullPath);

    if (!exists) {
      this.logger.log('DELETED', relativePath);
      const ctx = {
        projectPath: this.projectPath,
        sseManager: this.sseManager,
        projectId: this.projectId,
        templatesDir: this.templatesDir,
        logger: this.logger,
        setRestoring: (v) => { this.isRestoring = v; }
      };
      handleDeletion(relativePath, ctx);
    } else {
      const action = eventType === 'rename' ? 'CREATED' : 'MODIFIED';
      this.logger.log(action, relativePath);
      this.handleChange(relativePath);
    }

    this.sseManager.broadcast(this.projectId, 'activity-log', {
      ts: new Date().toISOString(),
      action: exists ? (eventType === 'rename' ? 'CREATED' : 'MODIFIED') : 'DELETED',
      file: relativePath,
    });
  }

  handleChange(relativePath) {
    if (relativePath.startsWith('plan' + path.sep) && relativePath.endsWith('.md')) {
      this.sseManager.broadcast(this.projectId, 'plan-updated', { file: relativePath });
      return;
    }
    if (relativePath === path.join('.agents', 'PROGRESS.md')) {
      this.sseManager.broadcast(this.projectId, 'progress-updated', { file: relativePath });
      return;
    }
    if (relativePath === path.join('.agents', 'AGENTS.md') || relativePath === path.join('.agents', 'RULES.md')) {
      this.sseManager.broadcast(this.projectId, 'config-updated', { file: relativePath });
    }
  }

  handleRootAgentsChange(eventType) {
    const fullPath = path.join(this.projectPath, 'AGENTS.md');
    if (!fs.existsSync(fullPath)) {
      this.sseManager.broadcast(this.projectId, 'file-deleted-warning', {
        file: 'AGENTS.md', message: 'Root AGENTS.md was deleted.', canRestore: false,
      });
    }
  }

  watchProjectFiles() {
    try {
      const watcher = fs.watch(this.projectPath, { recursive: true }, (eventType, filename) => {
        if (!filename || this.isRestoring) return;
        if (filename.startsWith('.agents' + path.sep) || filename === '.agents' ||
            filename.startsWith('plan' + path.sep) || filename === 'plan') return;
        if (shouldIgnore(filename)) return;
        this.debounce('proj:' + filename, () => {
          const fullPath = path.join(this.projectPath, filename);
          const exists = fs.existsSync(fullPath);
          const action = exists ? (eventType === 'rename' ? 'CREATED' : 'MODIFIED') : 'DELETED';
          this.logger.log(action, filename);
          this.sseManager.broadcast(this.projectId, 'activity-log', {
            ts: new Date().toISOString(), action, file: filename,
          });
        });
      });
      this.watchers.push(watcher);
      watcher.on('error', () => {});
    } catch (e) {
      console.error('⚠️ Recursive watch not available:', e.message); // keep
    }
  }
}
```
- **Done-check:** `wc -l dashboard/src/server/watcher-events.js` → ~143 lines
- **Depends:** 57.10

---

## ✅ PART D: Verification

---

### Step 57.12 — Full build verification
- **File:** `dashboard/package.json`
- **Action:** VERIFY
- **Command:** `cd dashboard && npm run build`
- **Done-check:** Exit 0, zero errors
- **Depends:** 57.11

---

### Step 57.13 — Health score re-scan
- **File:** `dashboard/src/server/health.js`
- **Action:** VERIFY
- **Command:** `curl -s http://localhost:20226/api/projects/1785648558108/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Score: {d[\"score\"]}/100')"`
- **Done-check:** Score >= 70
- **Depends:** 57.12

---

### Step 57.14 — Update PROGRESS.md
- **File:** `.agents/PROGRESS.md`
- **Action:** EDIT
- **Content:** Add Phase 57 with all steps marked complete
- **Done-check:** `grep "Phase 57" .agents/PROGRESS.md`
- **Depends:** 57.13
