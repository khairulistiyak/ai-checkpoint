# Phase 31 — Plans Center Full Page

> ⚠️ **AI MODEL INSTRUCTIONS**: Execute steps 1→7 in EXACT order.
> Do NOT skip. Do NOT change any code. Copy-paste EXACTLY as shown.
> Each step tells you: which file, what line numbers, what to find, what to replace.

---

## Overview

- **Goal**: Replace `PlanModal.jsx` (overlay) and `GeneratePlanModal.jsx` (overlay) with one full-page `PlansCenter.jsx` that has 3 tabs: Progress, Plan Files, Generate.
- **Files to CREATE**: 1 file (`PlansCenter.jsx`)
- **Files to MODIFY**: 4 files (`projects.js`, `api.js`, `App.jsx`, `ProjectGrid.jsx`, `PlanCard.jsx`)
- **Files to DELETE**: 2 files (`PlanModal.jsx`, `GeneratePlanModal.jsx`)

---

## STEP 1 — Add backend endpoint to read plan file content

### File: `/Volumes/SSD/0.1/ai-checkpoint/dashboard/src/server/projects.js`
### Action: INSERT new code between line 151 and line 153
### How: Find `router.use('/', checkpointsRouter);` on line 151. Add the new code AFTER that line and BEFORE `export default router;` on line 153.

**FIND this (line 151–153):**
```javascript
router.use('/', checkpointsRouter);

export default router;
```

**REPLACE WITH:**
```javascript
router.use('/', checkpointsRouter);

router.get('/:id/plan-file/:filename', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const filename = req.params.filename;
  if (!/^[a-zA-Z0-9_.-]+\.md$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  const filePath = path.join(project.path, 'plan', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Plan file not found' });
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.json({ content, filename });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read file' });
  }
});

export default router;
```

---

## STEP 2 — Add frontend API function

### File: `/Volumes/SSD/0.1/ai-checkpoint/dashboard/src/utils/api.js`
### Action: ADD new function at the very end of the file (after line 153)

**APPEND this code at the bottom of the file:**
```javascript

export async function fetchPlanFileContent(id, filename) {
  const res = await fetch(`${BASE_URL}/projects/${id}/plan-file/${encodeURIComponent(filename)}`);
  if (!res.ok) throw new Error('Failed to fetch plan file');
  return res.json();
}
```

---

## STEP 3 — Create PlansCenter.jsx (the new page)

### File: `/Volumes/SSD/0.1/ai-checkpoint/dashboard/src/components/PlansCenter.jsx`
### Action: CREATE this new file. Copy the ENTIRE code block below.

```jsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Rocket, Target, Activity, Zap, Layers, FileText,
  Search, CheckCircle2, Loader2, Circle, AlertTriangle,
  FolderOpen, Sparkles, X, Calendar, Eye
} from 'lucide-react';
import PhaseView from './PhaseView';
import AiTierSelector from './AiTierSelector';
import { GlassButton } from './ui/GlassButton';
import { InputField } from './ui/InputField';
import { useToast } from './ToastProvider';
import * as api from '../utils/api';

/* ─────────────────────────────────────────────
   SUB-COMPONENT 1: Compact Metrics Strip
   ───────────────────────────────────────────── */
function MetricsStrip({ project }) {
  const progress = project?.progress;
  if (!progress || !progress.overall) return null;
  const { percentage, completed, total } = progress.overall;
  const remaining = total - completed;
  const activePhases = progress.phases ? progress.phases.filter(p => p.percentage > 0 && p.percentage < 100).length : 0;
  const planFiles = project?.planStats?.totalFiles || 0;

  const items = [
    { label: 'Completion', value: `${percentage}%`, icon: Target, glow: true },
    { label: 'Steps Done', value: completed, icon: Activity, glow: false },
    { label: 'Remaining', value: remaining, icon: Zap, glow: false },
    { label: 'Active Phases', value: activePhases, icon: Layers, glow: false },
    { label: 'Plan Files', value: planFiles, icon: FileText, glow: false },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 px-6 py-5">
      {items.map((m, i) => {
        const Icon = m.icon;
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-4 flex flex-col items-start gap-1 group hover:-translate-y-1 transition-transform relative overflow-hidden"
          >
            <div className={`absolute -right-8 -bottom-8 w-28 h-28 rounded-full blur-[35px] pointer-events-none group-hover:scale-150 transition-transform duration-500 ${m.glow ? 'bg-cyber-accent/10' : 'bg-white/[0.03]'}`} />
            <div className={`w-7 h-7 rounded-full flex items-center justify-center relative z-10 ${m.glow ? 'bg-cyber-accent/15' : 'bg-white/5'}`}>
              <Icon className={`w-3.5 h-3.5 ${m.glow ? 'text-cyber-accent' : 'text-cyber-text-secondary'}`} />
            </div>
            <div className="text-2xl font-black text-cyber-text-primary mt-1 relative z-10">{m.value}</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-cyber-text-secondary relative z-10">{m.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENT 2: File Preview Drawer
   ───────────────────────────────────────────── */
function FilePreviewDrawer({ projectId, filename, onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filename) return;
    setLoading(true);
    api.fetchPlanFileContent(projectId, filename)
      .then(res => setContent(res.content || ''))
      .catch(() => setContent('// Error loading file'))
      .finally(() => setLoading(false));
  }, [projectId, filename]);

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full lg:w-[45%] border-l border-cyber-card-border/30 bg-[#0b0c10] flex flex-col overflow-hidden shrink-0"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-cyber-card-border/20 bg-black/30">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyber-text-secondary" />
          <span className="text-[11px] font-mono text-cyber-text-secondary">{filename}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-wider">Preview</span>
          </span>
          <button onClick={onClose} className="p-1 rounded hover:bg-cyber-card-border/30 text-cyber-text-muted hover:text-cyber-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center gap-2 text-cyber-text-muted text-xs"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : (
          <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">{content}</pre>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENT 3: Plan Files Tab
   ───────────────────────────────────────────── */
function PlanFilesTab({ project, onSwitchToGenerate }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const files = project?.planStats?.files || [];

  const fmtDate = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
    catch { return ''; }
  };

  if (files.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyber-card/50 border border-cyber-card-border flex items-center justify-center mb-4">
          <FileText className="w-7 h-7 text-cyber-text-muted" />
        </div>
        <p className="text-sm text-cyber-text-secondary mb-1">No plan files found</p>
        <p className="text-xs text-cyber-text-muted mb-6">Generate your first plan to get started.</p>
        <GlassButton variant="primary" onClick={onSwitchToGenerate} className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Generate Plan
        </GlassButton>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
      <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 ${selectedFile ? 'hidden lg:block' : ''}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {files.map((file, idx) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -3 }}
              onClick={() => setSelectedFile(file.name)}
              className={`glass-card p-5 cursor-pointer group flex flex-col gap-3 ${selectedFile === file.name ? 'border-cyber-accent/50 bg-cyber-accent/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyber-accent/5 border border-cyber-accent/20 flex items-center justify-center group-hover:bg-cyber-accent/10 transition-colors">
                  <FileText className="w-4 h-4 text-cyber-accent/70 group-hover:text-cyber-accent transition-colors" />
                </div>
                <p className="text-sm font-mono font-bold text-cyber-text-primary truncate flex-1 min-w-0">{file.name}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-mono bg-cyber-card/60 border border-cyber-card-border px-2 py-0.5 rounded text-cyber-text-secondary">{file.steps} steps</span>
                {fmtDate(file.createdAt) && (
                  <span className="flex items-center gap-1 text-[10px] text-cyber-text-muted font-mono">
                    <Calendar className="w-3 h-3" /> {fmtDate(file.createdAt)}
                  </span>
                )}
              </div>
              <GlassButton variant="primary" size="sm" className="mt-auto flex items-center gap-1.5 self-start">
                <Eye className="w-3 h-3" /> View File
              </GlassButton>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selectedFile && (
          <FilePreviewDrawer projectId={project.id} filename={selectedFile} onClose={() => setSelectedFile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENT 4: Plan Generator Tab
   ───────────────────────────────────────────── */
function PlanGeneratorTab({ project, onRefresh, onSwitchToFiles }) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    if (project?.id) {
      api.fetchAiTier(project.id).then(res => { if (res.tier) setTier(res.tier); }).catch(() => {});
    }
  }, [project?.id]);

  useEffect(() => {
    const pName = name || 'my-feature';
    const pDesc = description || 'Description here.';
    const suffix = tier === 'small' ? 'Small (Max 5 steps)' : tier === 'high' ? 'High (Unlimited)' : 'Medium (Max 10 steps)';
    setPreviewContent(`# Plan: ${pName}\n\n> ${pDesc}\n> (AI Tier: ${suffix})\n\n---\n\n## Step 1.1 — Create initial file\n- **File:** src/index.js\n- **Action:** CREATE\n- **Done-check:** test -f src/index.js\n- **Depends:** None\n\n## Step 1.2 — Add core logic\n- **File:** src/index.js\n- **Action:** MODIFY\n- **Done-check:** grep "core logic"\n- **Depends:** 1.1`);
  }, [name, description, tier]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !/^[a-zA-Z0-9-]{1,50}$/.test(name)) {
      showToast('Name: 1-50 chars, letters/numbers/dashes only.', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.generatePlan(project.id, { name, tier, description });
      showToast(`Plan plan/${name}.md generated!`, 'success');
      if (onRefresh) onRefresh();
      setTimeout(() => onSwitchToFiles(), 400);
    } catch (err) {
      showToast(err.message || 'Failed to generate plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Left: Config */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 overflow-y-auto custom-scrollbar border-r border-cyber-card-border/20 bg-cyber-card/5">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyber-card-border/20">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-cyber-dark/50 rounded-md border border-cyber-card-border/30">
            <Sparkles className="w-3.5 h-3.5 text-cyber-accent" />
            <span className="text-[10px] font-mono text-cyber-text-muted">./agent/generate-plan.sh</span>
          </div>
        </div>
        <h3 className="text-sm font-bold text-cyber-text-primary mb-6 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyber-accent/10 border border-cyber-accent/30 flex items-center justify-center">
            <span className="text-cyber-accent font-mono text-xs">1</span>
          </div>
          Plan Configuration
        </h3>
        <div className="space-y-6">
          <InputField label="Plan Name" value={name} onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))} placeholder="e.g. add-auth-system" required />
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-cyber-text-secondary px-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this plan achieves..."
              className="w-full bg-cyber-card/30 border border-cyber-card-border/50 rounded-xl px-4 py-3 text-xs text-cyber-text-primary placeholder-cyber-text-muted focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent/30 focus:shadow-[0_0_15px_rgba(var(--cyber-accent-rgb),0.15)] transition-all h-24 resize-none hover:bg-cyber-card/50 hover:border-cyber-card-border/80 custom-scrollbar"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-cyber-text-secondary px-1">AI Reasoning Capability</label>
            <AiTierSelector selectedTier={tier} onChange={setTier} />
          </div>
        </div>
      </div>
      {/* Right: Preview */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#0b0c10] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-accent/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-cyber-card-border/20 bg-black/20">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyber-text-secondary" />
            <span className="text-[11px] text-cyber-text-secondary font-mono">plan/{name || 'my-feature'}.md</span>
          </div>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-wider">Live Preview</span>
          </span>
        </div>
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar relative z-10">
          <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">{previewContent}</pre>
        </div>
        <div className="p-5 border-t border-cyber-card-border/20 bg-black/40 flex justify-end gap-3 relative z-20">
          <GlassButton type="submit" disabled={loading || !name} variant="primary" className="px-6 flex items-center gap-2 font-bold">
            {loading ? 'Generating...' : <><Sparkles className="w-4 h-4" /> Generate Plan</>}
          </GlassButton>
        </div>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT: PlansCenter (the full page)
   ───────────────────────────────────────────── */
export default function PlansCenter({ project, onBack, onRefresh, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'progress');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter phases for Progress tab
  const filteredPhases = useMemo(() => {
    if (!project?.progress?.phases) return [];
    return project.progress.phases
      .map(phase => ({
        ...phase,
        steps: phase.steps.filter(step => {
          const matchStatus = statusFilter === 'all' || step.status === statusFilter;
          const matchSearch = !searchQuery || step.title.toLowerCase().includes(searchQuery.toLowerCase()) || step.number.includes(searchQuery);
          return matchStatus && matchSearch;
        })
      }))
      .filter(phase => statusFilter === 'all' ? true : phase.steps.length > 0);
  }, [project?.progress?.phases, statusFilter, searchQuery]);

  const totalSteps = project?.progress?.overall?.total || 0;
  const shownSteps = filteredPhases.reduce((sum, p) => sum + p.steps.length, 0);

  if (!project) return null;

  const tabs = [
    { id: 'progress', label: 'Progress', icon: Activity },
    { id: 'files', label: 'Plan Files', icon: FolderOpen },
    { id: 'generate', label: 'Generate', icon: Sparkles },
  ];

  const filters = [
    { id: 'all', label: 'All', icon: null },
    { id: 'done', label: 'Done', icon: CheckCircle2 },
    { id: 'running', label: 'Active', icon: Loader2 },
    { id: 'pending', label: 'Pending', icon: Circle },
    { id: 'blocked', label: 'Blocked', icon: AlertTriangle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="h-full w-full flex flex-col overflow-hidden"
    >
      {/* ── HEADER ── */}
      <div className="px-6 py-4 border-b border-cyber-card-border/50 bg-cyber-card/20 relative shrink-0">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-accent/40 to-transparent" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <GlassButton variant="ghost" onClick={onBack} className="flex items-center gap-1.5 !px-2.5">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline text-xs">Back</span>
            </GlassButton>
            <h1 className="text-base sm:text-lg font-bold text-cyber-text-primary flex items-center gap-2">
              <Rocket className="w-5 h-5 text-cyber-accent shrink-0" />
              Implementation Plans
            </h1>
          </div>
          <span className="hidden sm:flex items-center px-3 py-1 bg-cyber-card/50 border border-cyber-card-border rounded-lg text-[11px] font-mono text-cyber-text-secondary">
            {project.name}
          </span>
        </div>
      </div>

      {/* ── METRICS ── */}
      <MetricsStrip project={project} />

      {/* ── TOOLBAR ── */}
      <div className="px-6 py-3 border-b border-cyber-card-border/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 bg-cyber-dark/50">
        <div className="flex items-center gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <GlassButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} size="sm" className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </GlassButton>
            );
          })}
        </div>
        {activeTab === 'progress' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-40">
              <InputField placeholder="Search steps..." icon={Search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex items-center gap-1">
              {filters.map(f => {
                const FIcon = f.icon;
                return (
                  <GlassButton key={f.id} active={statusFilter === f.id} onClick={() => setStatusFilter(f.id)} size="xs" className="flex items-center gap-1">
                    {FIcon && <FIcon className="w-3 h-3" />} {f.label}
                  </GlassButton>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'progress' && (
            <motion.div key="tab-progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {(statusFilter !== 'all' || searchQuery) && (
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-cyber-text-secondary">Showing <span className="text-cyber-text-primary font-bold">{shownSteps}</span> of {totalSteps} steps</p>
                  <GlassButton size="xs" variant="ghost" onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}>Clear Filters</GlassButton>
                </div>
              )}
              <div className="max-w-4xl mx-auto relative">
                <div className="absolute left-[39px] top-4 bottom-10 w-0.5 bg-gradient-to-b from-cyber-accent/50 via-cyber-accent/20 to-transparent z-0 hidden md:block" />
                <div className="space-y-4">
                  {filteredPhases.length > 0 ? (
                    filteredPhases.map((phase, idx) => (
                      <PhaseView key={phase.number} phase={phase} isActive={phase.percentage > 0 && phase.percentage < 100} index={idx} projectId={project.id} hasPlanFiles={project.hasPlanFiles} onRefresh={onRefresh} />
                    ))
                  ) : (
                    <div className="text-center p-12 text-cyber-text-muted italic bg-cyber-card/50 rounded-xl border border-cyber-card-border">
                      {statusFilter !== 'all' || searchQuery ? 'No steps match your filters.' : 'No phases found in PROGRESS.md.'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'files' && (
            <motion.div key="tab-files" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 overflow-hidden flex flex-col">
              <PlanFilesTab project={project} onSwitchToGenerate={() => setActiveTab('generate')} />
            </motion.div>
          )}
          {activeTab === 'generate' && (
            <motion.div key="tab-generate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 overflow-hidden flex flex-col">
              <PlanGeneratorTab project={project} onRefresh={onRefresh} onSwitchToFiles={() => setActiveTab('files')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
```

---

## STEP 4 — Modify App.jsx (6 small changes)

### File: `/Volumes/SSD/0.1/ai-checkpoint/dashboard/src/App.jsx`

### 4A — Fix imports (lines 12–14)

**FIND (line 12):**
```javascript
import PlanModal from './components/PlanModal';
```
**REPLACE WITH:**
```javascript
import PlansCenter from './components/PlansCenter';
```

**FIND (line 14):**
```javascript
import GeneratePlanModal from './components/GeneratePlanModal';
```
**DELETE this entire line.** Remove it completely.

### 4B — Remove old state variables (lines 28–29)

**FIND these 2 lines:**
```javascript
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isGeneratePlanOpen, setIsGeneratePlanOpen] = useState(false);
```
**DELETE both lines.** Remove them completely.

### 4C — Fix keyboard shortcut handler (lines 50–62)

**FIND this ENTIRE block (lines 50–62):**
```javascript
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') { e.preventDefault(); setSelectedId(prev => prev === 'library' ? null : 'library'); }
      else if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsCommandPaletteOpen(true); }
      else if (e.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false); else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isPlanModalOpen) setIsPlanModalOpen(false); else if (isGeneratePlanOpen) setIsGeneratePlanOpen(false);
        else if (selectedId === 'library') setSelectedId(null); else if (configProject) setConfigProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, isSettingsOpen, isPlanModalOpen, configProject]);
```

**REPLACE entire block WITH:**
```javascript
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') { e.preventDefault(); setSelectedId(prev => prev === 'library' ? null : 'library'); }
      else if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsCommandPaletteOpen(true); }
      else if (e.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (typeof selectedId === 'string' && selectedId.startsWith('plans-')) {
          const projId = selectedId.split('-')[1];
          setSelectedId(projId || null);
        }
        else if (selectedId === 'library') setSelectedId(null);
        else if (configProject) setConfigProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, isSettingsOpen, configProject, selectedId]);
```

### 4D — Add PlansCenter route in AnimatePresence (lines 107–115)

**FIND (lines 107–115):**
```javascript
            <AnimatePresence mode="wait">
              {selectedId === 'library' ? (
                <motion.div
                  key="library" initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ duration: 0.4, type: 'spring' }} className="h-full w-full"
                >
                  <ComponentLibrary asPage={true} />
                </motion.div>
              ) : selectedProject ? (
```

**REPLACE WITH:**
```javascript
            <AnimatePresence mode="wait">
              {typeof selectedId === 'string' && selectedId.startsWith('plans-') ? (
                <motion.div
                  key="plans" initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ duration: 0.4, type: 'spring' }} className="h-full w-full"
                >
                  <PlansCenter
                    project={projects.find(p => selectedId.includes(p.id))}
                    initialTab={selectedId.split('-').pop()}
                    onBack={() => {
                      const proj = projects.find(p => selectedId.includes(p.id));
                      setSelectedId(proj ? proj.id : null);
                    }}
                    onRefresh={refresh}
                  />
                </motion.div>
              ) : selectedId === 'library' ? (
                <motion.div
                  key="library" initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ duration: 0.4, type: 'spring' }} className="h-full w-full"
                >
                  <ComponentLibrary asPage={true} />
                </motion.div>
              ) : selectedProject ? (
```

### 4E — Update ProjectGrid props (lines 122–127)

**FIND:**
```javascript
                  <ProjectGrid
                    selectedProject={selectedProject} installing={installing}
                    onRemove={() => setConfirmRemove(true)} onOpenConfig={() => setConfigProject(selectedProject.id)}
                    onOpenPlan={() => setIsPlanModalOpen(true)} onInstall={handleInstallProject} refresh={refresh}
                    onGeneratePlan={() => setIsGeneratePlanOpen(true)}
                  />
```

**REPLACE WITH:**
```javascript
                  <ProjectGrid
                    selectedProject={selectedProject} installing={installing}
                    onRemove={() => setConfirmRemove(true)} onOpenConfig={() => setConfigProject(selectedProject.id)}
                    onInstall={handleInstallProject} refresh={refresh}
                    onOpenPlans={(tab) => setSelectedId('plans-' + selectedProject.id + '-' + (tab || 'progress'))}
                  />
```

### 4F — Delete old modal renders (lines 137–138)

**FIND these 2 lines:**
```javascript
      <AnimatePresence>{isPlanModalOpen && selectedProject && <PlanModal project={selectedProject} onClose={() => setIsPlanModalOpen(false)} onRefresh={refresh} />}</AnimatePresence>
      <AnimatePresence>{isGeneratePlanOpen && selectedProject && <GeneratePlanModal isOpen={isGeneratePlanOpen} project={selectedProject} onClose={() => setIsGeneratePlanOpen(false)} onSuccess={refresh} />}</AnimatePresence>
```

**DELETE both lines.** Remove them completely.

---

## STEP 5 — Modify ProjectGrid.jsx

### File: `/Volumes/SSD/0.1/ai-checkpoint/dashboard/src/components/ProjectGrid.jsx`

### 5A — Update function signature (line 10)

**FIND:**
```javascript
export default function ProjectGrid({ selectedProject, loading, installing, onRemove, onOpenConfig, onOpenPlan, onGeneratePlan, onInstall, refresh }) {
```

**REPLACE WITH:**
```javascript
export default function ProjectGrid({ selectedProject, loading, installing, onRemove, onOpenConfig, onOpenPlans, onInstall, refresh }) {
```

### 5B — Update PlanCard prop (line 29)

**FIND:**
```javascript
            <PlanCard project={selectedProject} onOpenPlan={onOpenPlan} />
```

**REPLACE WITH:**
```javascript
            <PlanCard project={selectedProject} onOpenPlan={() => onOpenPlans('progress')} />
```

### 5C — Update Generate Plan button (lines 30–38)

**FIND:**
```javascript
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGeneratePlan}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-accent-500/30 bg-accent-500/10 hover:bg-accent-500/20 text-accent-300 hover:text-white transition-all text-xs font-bold font-mono tracking-wider uppercase shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-accent-400 group-hover:text-accent-300" />
              Generate Plan
            </motion.button>
```

**REPLACE WITH:**
```javascript
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenPlans('generate')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-cyber-accent/30 bg-cyber-accent/10 hover:bg-cyber-accent/20 text-cyber-accent hover:text-white transition-all text-xs font-bold font-mono tracking-wider uppercase shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyber-accent" />
              Generate Plan
            </motion.button>
```

---

## STEP 6 — Update PlanCard.jsx button color

### File: `/Volumes/SSD/0.1/ai-checkpoint/dashboard/src/components/PlanCard.jsx`

**FIND (line 63):**
```javascript
          <button className="px-3.5 py-1.5 rounded-lg bg-accent-500/10 border border-accent-500/20 group-hover:bg-accent-500/20 group-hover:border-accent-500/40 text-[10px] font-bold text-accent-300 group-hover:text-white uppercase tracking-wider font-mono flex items-center gap-1 transition-all duration-300 pointer-events-none">
```

**REPLACE WITH:**
```javascript
          <button className="px-3.5 py-1.5 rounded-lg bg-cyber-accent/10 border border-cyber-accent/20 group-hover:bg-cyber-accent/20 group-hover:border-cyber-accent/40 text-[10px] font-bold text-cyber-accent group-hover:text-white uppercase tracking-wider font-mono flex items-center gap-1 transition-all duration-300 pointer-events-none">
```

---

## STEP 7 — Delete old modal files

### Action: DELETE these 2 files

1. `/Volumes/SSD/0.1/ai-checkpoint/dashboard/src/components/PlanModal.jsx` — DELETE
2. `/Volumes/SSD/0.1/ai-checkpoint/dashboard/src/components/GeneratePlanModal.jsx` — DELETE

These files are no longer imported by any component after the changes above.

---

## ✅ Done — Verification Checklist

Run `npm run dev` and verify:

1. [ ] No errors in terminal or browser console
2. [ ] Click PlanCard on project overview → PlansCenter opens (Progress tab)
3. [ ] Click "Generate Plan" button → PlansCenter opens (Generate tab)
4. [ ] Progress tab: filter pills (All/Done/Active/Pending/Blocked) work
5. [ ] Progress tab: search box filters steps by title
6. [ ] Progress tab: Start/Complete buttons on steps still work
7. [ ] Plan Files tab: file cards show for each plan/*.md file
8. [ ] Plan Files tab: clicking "View File" opens preview drawer
9. [ ] Generate tab: fill form → generate → auto-switches to Files tab
10. [ ] Press ESC → returns to project overview

---

## 📋 Step Tracker (for CLI tracking)

### Step 31.1 — Add plan-file read endpoint
- **File:** `dashboard/src/server/projects.js`
- **Action:** EDIT
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** None

### Step 31.2 — Add fetchPlanFileContent API
- **File:** `dashboard/src/utils/api.js`
- **Action:** EDIT
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 31.1

### Step 31.3 — Create PlansCenter page
- **File:** `dashboard/src/components/PlansCenter.jsx`
- **Action:** CREATE
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 31.2

### Step 31.4 — Wire PlansCenter into App
- **File:** `dashboard/src/App.jsx`
- **Action:** EDIT
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 31.3

### Step 31.5 — Update ProjectGrid plans props
- **File:** `dashboard/src/components/ProjectGrid.jsx`
- **Action:** EDIT
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 31.4

### Step 31.6 — Update PlanCard button color
- **File:** `dashboard/src/components/PlanCard.jsx`
- **Action:** EDIT
- **Done-check:** `cd dashboard && npm run build` → exit 0
- **Depends:** 31.5

### Step 31.7 — Remove old modal files
- **File:** `dashboard/src/components/PlansCenter.jsx`
- **Action:** DELETE
- **Done-check:** `test ! -f dashboard/src/components/PlanModal.jsx` → exit 0
- **Depends:** 31.6
