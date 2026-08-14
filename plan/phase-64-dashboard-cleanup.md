# Phase 64: Dashboard Duplication Cleanup & Tab Consolidation

> ড্যাশবোর্ডের অপ্রয়োজনীয় ৫টি ডুপ্লিকেশন ও পুনরাবৃত্তি দূর করে একটি পরিষ্কার, সুপার-ফাস্ট ও প্রিমিয়াম ৪-ট্যাব আর্কিটেকচার তৈরি করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 64: Dashboard Duplication Cleanup & Tab Consolidation

### Step 64.1 — Consolidate ProjectTabBar into 4 clean tabs (`dashboard/src/components/ProjectTabBar.jsx`)
- **File:** `dashboard/src/components/ProjectTabBar.jsx`
- **Action:** MODIFY
- **Depends:** None

**সমস্যা:** ড্যাশবোর্ডে ৬টি ট্যাব রয়েছে যেখানে Tab 6 এবং Tab 5 মূলত Tab 1 এবং Tab 4-এর সাথে ডুপ্লিকেট হচ্ছে।

**কী করতে হবে:**
ট্যাব লিস্ট ৪টি মূল ট্যাবে রূপান্তর করো:
1. `cockpit` ("Cockpit Overview", hotkey: '1')
2. `roadmap` ("Roadmap & Steps", hotkey: '2')
3. `files` ("Plan Blueprints", hotkey: '3')
4. `commands` ("Workflows & CLI", hotkey: '4')

```jsx
import React, { useEffect } from 'react';
import { Activity, ListTodo, FileCode, Terminal } from 'lucide-react';
import ProjectTabItem from './project/ProjectTabItem';

export default function ProjectTabBar({
  activeTab,
  setActiveTab,
  overall = { percentage: 0, completed: 0, total: 0 },
  planStats
}) {
  const tabs = [
    {
      id: 'cockpit',
      label: 'Cockpit Overview',
      icon: Activity,
      hotkey: '1',
      accentColor: '#38bdf8',
      glowBorder: 'border-sky-500/40',
      activeText: 'text-sky-300',
      badge: `${overall.percentage}%`,
      badgeStyle: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    },
    {
      id: 'roadmap',
      label: 'Roadmap & Steps',
      icon: ListTodo,
      hotkey: '2',
      accentColor: '#818cf8',
      glowBorder: 'border-indigo-500/40',
      activeText: 'text-indigo-300',
      badge: `${overall.completed}/${overall.total}`,
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'files',
      label: 'Plan Blueprints',
      icon: FileCode,
      hotkey: '3',
      accentColor: '#60a5fa',
      glowBorder: 'border-blue-500/40',
      activeText: 'text-blue-300',
      badge: planStats?.files?.length || 0,
      badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
      id: 'commands',
      label: 'Workflows & CLI',
      icon: Terminal,
      hotkey: '4',
      accentColor: '#fbbf24',
      glowBorder: 'border-amber-500/40',
      activeText: 'text-amber-300',
      badge: '⚡ CLI',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= tabs.length) {
        const targetTab = tabs[num - 1];
        if (targetTab) setActiveTab(targetTab.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, setActiveTab]);

  return (
    <div className="relative w-full z-20">
      <div className="bg-[#0e0e11]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex items-center justify-between gap-2 shadow-xl relative overflow-hidden">
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar p-0.5 min-w-0 relative w-full scroll-smooth [-webkit-overflow-scrolling:touch]">
          <div className="flex items-center gap-1.5 sm:gap-2 w-full min-w-max pr-6 sm:pr-0 pb-1 sm:pb-0">
            {tabs.map((tab) => (
              <ProjectTabItem
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0e0e11] to-transparent pointer-events-none sm:hidden z-10" />
      </div>
    </div>
  );
}
```

- **Done-check:** `test -f dashboard/src/components/ProjectTabBar.jsx`

---

### Step 64.2 — Update ProjectTabsContent routing (`dashboard/src/components/ProjectTabsContent.jsx`)
- **File:** `dashboard/src/components/ProjectTabsContent.jsx`
- **Action:** MODIFY
- **Depends:** Step 64.1

**সমস্যা:** `ProjectTabsContent.jsx`-এ বাদ যাওয়া ট্যাবগুলোর রাউটিং রয়ে গেছে।

**কী করতে হবে:**
ট্যাব কন্টেন্টকে ৪টি পরিষ্কার রুটে আপডেট করো: `cockpit`, `roadmap`, `files`, `commands`।

```jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CockpitTab from './CockpitTab';
import PlanProgressTab from './plans/PlanProgressTab';
import PlanFilesTab from './plans/PlanFilesTab';
import ProjectRunPanel from './runs/ProjectRunPanel';

export default function ProjectTabsContent({
  activeTab,
  selectedProject,
  overall,
  allPhases,
  activePhases,
  remaining,
  planStats,
  totalPlanSteps,
  handleOpenArchitect,
  refresh,
  liveActivityEntry,
  filteredPhases,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  selectedPhaseNumber,
  setSelectedPhaseNumber,
  onOpenConfig,
  setActiveTab
}) {
  return (
    <AnimatePresence mode="wait">
      {activeTab === 'cockpit' && (
        <motion.div key="cockpit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          <CockpitTab
            selectedProject={selectedProject}
            overall={overall}
            allPhases={allPhases}
            activePhases={activePhases}
            remaining={remaining}
            planStats={planStats}
            totalPlanSteps={totalPlanSteps}
            handleOpenArchitect={handleOpenArchitect}
            refresh={refresh}
            liveActivityEntry={liveActivityEntry}
            onSelectTab={setActiveTab}
          />
        </motion.div>
      )}
      {activeTab === 'roadmap' && (
        <motion.div key="roadmap" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="bg-cyber-card/90 backdrop-blur-xl border border-cyber-card-border rounded-2xl p-3 sm:p-4 shadow-sm min-h-[450px]">
          <PlanProgressTab project={selectedProject} allPhases={allPhases} filteredPhases={filteredPhases} statusFilter={statusFilter} setStatusFilter={setStatusFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedPhaseNumber={selectedPhaseNumber} setSelectedPhaseNumber={setSelectedPhaseNumber} onRefresh={refresh} />
        </motion.div>
      )}
      {activeTab === 'files' && (
        <motion.div key="files" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="bg-cyber-card/90 backdrop-blur-xl border border-cyber-card-border rounded-2xl p-3 sm:p-4 shadow-sm min-h-[450px]">
          <PlanFilesTab project={selectedProject} />
        </motion.div>
      )}
      {activeTab === 'commands' && (
        <motion.div key="commands" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="bg-cyber-card/90 backdrop-blur-xl border border-cyber-card-border rounded-2xl p-2 sm:p-4 shadow-sm min-h-[450px] flex flex-col">
          <ProjectRunPanel project={selectedProject} onOpenConfig={onOpenConfig} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- **Done-check:** `test -f dashboard/src/components/ProjectTabsContent.jsx`

---

### Step 64.3 — Consolidate ProjectRunPanel with Workflow Rules (`dashboard/src/components/runs/ProjectRunPanel.jsx`)
- **File:** `dashboard/src/components/runs/ProjectRunPanel.jsx`
- **Action:** MODIFY
- **Depends:** Step 64.2

**সমস্যা:** `ProjectRunPanel.jsx`-এ অতিরিক্ত বড় পাথ বক্স রয়েছে এবং CLI রুলস আলাদা ট্যাবে ছিল।

**কী করতে হবে:**
কমান্ড প্যানেলের ভেতর সরাসরি গোল্ডেন রুলস ও শর্টকাট একীভূত করো।

```jsx
import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, BookOpen, ShieldCheck, Terminal } from 'lucide-react';
import { fetchProjectRunConfig } from '../../utils/api';
import RunCommandCard from './RunCommandCard';

const CATEGORIES = [
  { id: 'all', label: 'All Commands' },
  { id: 'dev', label: 'Dev Server' },
  { id: 'test', label: 'Testing' },
  { id: 'build', label: 'Build' },
  { id: 'lint', label: 'Lint & Verify' },
  { id: 'checkpoint', label: 'Ledger' }
];

export default function ProjectRunPanel({ project, onOpenConfig }) {
  const [runConfig, setRunConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const loadConfig = async () => {
    if (!project?.id) return;
    try {
      setLoading(true);
      const data = await fetchProjectRunConfig(project.id);
      setRunConfig(data);
    } catch (e) {
      console.error('Failed to load run config:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConfig(); }, [project?.id]);

  const allCmds = [...(runConfig?.commands || []), ...(runConfig?.customCommands || [])];
  const filtered = allCmds.filter(c => {
    const matchCat = category === 'all' || c.category === category;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.cmd.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] overflow-y-auto p-3 sm:p-5 gap-4">
      {/* Golden Rules & Conventions Strip */}
      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-300">
          <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold text-white">Workflow Rules:</span>
          <span className="text-zinc-400">1 step = 1 file (&le;150 lines) &bull; Zero token waste &bull; Strict incremental execution</span>
        </div>
        {onOpenConfig && (
          <button
            onClick={onOpenConfig}
            className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-200 transition-all cursor-pointer shrink-0"
          >
            Edit Config
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                category === cat.id ? 'bg-white/15 text-white border border-white/30 font-bold' : 'text-zinc-400 hover:text-white bg-white/[0.03] border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search CLI commands..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/20"
            />
          </div>
          <button
            onClick={loadConfig}
            title="Refresh commands"
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Command Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading project run environment...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-zinc-500 border border-white/5 rounded-2xl bg-white/[0.02]">
          No commands found for category: {category}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map(c => (
            <RunCommandCard key={c.id} cmd={c} projectPath={project?.path} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- **Done-check:** `test -f dashboard/src/components/runs/ProjectRunPanel.jsx`

---

### Step 64.4 — Streamline ProjectCard top banner (`dashboard/src/components/ProjectCard.jsx`)
- **File:** `dashboard/src/components/ProjectCard.jsx`
- **Action:** MODIFY
- **Depends:** Step 64.1

**সমস্যা:** `ProjectCard.jsx`-এ অতিরিক্ত ড্রপডাউন ছিল যা নিচের হেলথ সেকশনের তথ্যের পুনরাবৃত্তি করত।

**কী করতে হবে:**
টপ ব্যানারকে ক্লিন ও ফাস্ট করো।

```jsx
import React, { useState } from "react";
import ProgressRing from "./ProgressRing";
import ProjectCardActions from "./project/ProjectCardActions";
import { Terminal, FolderOpen, Copy, Check, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "./ToastProvider";

export default function ProjectCard({
  project,
  onRemove,
  onOpenConfig,
  onOpenArchitect,
}) {
  const { showToast } = useToast();
  const { progress } = project;
  const [copied, setCopied] = useState(false);
  const [copiedCd, setCopiedCd] = useState(false);

  const overall = progress?.overall || { percentage: 0, completed: 0, total: 0 };
  const isDone = overall.percentage === 100;

  const handleCopyPath = () => {
    if (project.path && navigator.clipboard) {
      navigator.clipboard.writeText(project.path);
      setCopied(true);
      showToast("Project path copied!", "info");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCd = () => {
    if (project.path && navigator.clipboard) {
      navigator.clipboard.writeText(`cd "${project.path}"`);
      setCopiedCd(true);
      showToast("cd command copied to clipboard!", "info");
      setTimeout(() => setCopiedCd(false), 2000);
    }
  };

  const handleQuickCheckpoint = () => {
    if (navigator.clipboard) {
      const msg = `checkpoint: ${new Date().toISOString().replace("T", " ").slice(0, 16)}`;
      navigator.clipboard.writeText(`./l cp save "${msg}"`);
      showToast("Copied: ./l cp save command", "success");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-[#0e0e11]/90 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-4 flex flex-col gap-3 transition-all shadow-xl relative overflow-hidden shrink-0"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/15 flex items-center justify-center shadow-lg relative group backdrop-blur-md">
              <ProgressRing percentage={overall.percentage} size={36} strokeWidth={3.5} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-sm" title="Live File Watcher Active">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight font-outfit truncate">{project.name}</h1>
              
              {isDone ? (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm">
                  <Check className="w-3 h-3" />
                  <span>100% Done</span>
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>In Progress</span>
                </span>
              )}

              <span className="bg-white/[0.04] text-zinc-300 border border-white/10 px-2.5 py-0.5 rounded-full text-xs font-mono">
                {overall.completed} / {overall.total} Steps
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1.5 text-xs font-mono text-zinc-400 flex-wrap">
              <div className="flex items-center gap-2 bg-black/50 px-2.5 py-1 rounded-lg border border-white/10 min-w-0 max-w-full">
                <FolderOpen className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                <span className="truncate max-w-[220px] sm:max-w-xs md:max-w-md lg:max-w-lg text-xs text-zinc-300 font-mono">{project.path}</span>
                
                <button
                  onClick={handleCopyPath}
                  title="Copy full path"
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-0.5"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>

                <div className="w-[1px] h-3 bg-white/10 shrink-0" />

                <button
                  onClick={handleCopyCd}
                  title="Copy `cd` command"
                  className="px-1.5 py-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Terminal className="w-3 h-3 text-zinc-400" />
                  <span>{copiedCd ? "copied" : "cd"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <ProjectCardActions
          project={project}
          onOpenArchitect={onOpenArchitect}
          handleQuickCheckpoint={handleQuickCheckpoint}
          onOpenConfig={onOpenConfig}
          onRemove={onRemove}
        />
      </div>
    </motion.div>
  );
}
```

- **Done-check:** `test -f dashboard/src/components/ProjectCard.jsx`

---

### Step 64.5 — Update ProjectGrid and CockpitTab Tab Switching (`dashboard/src/components/ProjectGrid.jsx`)
- **File:** `dashboard/src/components/ProjectGrid.jsx`
- **Action:** MODIFY
- **Depends:** Step 64.2

**সমস্যা:** `ProjectGrid.jsx`-এ `setActiveTab` প্রপ `ProjectTabsContent`-এ পাস করতে হবে।

**কী করতে হবে:**
`ProjectTabsContent`-এ `setActiveTab={setActiveTab}` প্রপ পাস করো।

- **Done-check:** `cd dashboard && npm run build`

---

### Step 64.6 — Run full verification suite (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 64.1, Step 64.2, Step 64.3, Step 64.4, Step 64.5

**কী করতে হবে:**
```bash
./l v
./l health
./l quality
cd dashboard && npm run build
```

- **Done-check:** exit code 0 for all validation commands
