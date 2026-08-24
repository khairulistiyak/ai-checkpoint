# Phase 138: Intelligence Hub Smart Insights & Actionable Issues Visual Overhaul

> **Objective:** Overhaul the visual aesthetics of the Intelligence Hub inner components (`SmartInsights.jsx`, `IssueFilterTabs.jsx`, `ActionableIssuesList.jsx`, and `ActionableIssueCard.jsx`) to complete the transition to the "Linear Minimalist Dark Studio / Eye-Comfort Matte Dark" design system. Replace lingering indigo/purple glows with clean frosted matte surfaces, unified active pills, and refined typography. Zero regressions.

---

## 📋 Execution Steps

### Step 138.1 — Overhaul SmartInsights Component (`dashboard/src/components/intelligence/SmartInsights.jsx`)
- **File**: `dashboard/src/components/intelligence/SmartInsights.jsx`
- **Action**: EDIT
- **Content**: Replace saturated indigo/purple/pink gradient backgrounds and neon blur orbs with an ultra-clean, frosted dark glass card with subtle border glow, clean emerald/zinc pulse indicator, and elegant typography.

Replace the entire file with:
```jsx
import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SmartInsights({ grade, scores, issues }) {
  const insights = useMemo(() => {
    let text = "";
    
    if (grade === 'A+' || grade === 'A') {
      text += "Your project is in exceptional shape, exhibiting World Top 1 standards. ";
    } else if (grade === 'B') {
      text += "Your project is performing well but has room for premium optimization. ";
    } else {
      text += "Your project requires attention to meet modern quality standards. ";
    }

    let weakest = null;
    let lowestScore = 100;
    Object.entries(scores).forEach(([key, val]) => {
      if (val < lowestScore) {
        lowestScore = val;
        weakest = key;
      }
    });

    if (lowestScore < 90 && weakest) {
      const formattedWeakest = weakest.charAt(0).toUpperCase() + weakest.slice(1);
      text += `Currently, ${formattedWeakest} is your lowest metric (${lowestScore}%). `;
    }

    if (issues.length === 0) {
      text += "No actionable issues were found! You are flawless.";
    } else if (issues.length === 1) {
      text += "Fixing the single remaining issue below will maximize your score.";
    } else {
      text += `Focus on resolving the ${issues.length} actionable issues listed below to boost your grade.`;
    }

    return text;
  }, [grade, scores, issues]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] p-5 shadow-sm transition-all"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex gap-3.5 items-start">
        <div className="shrink-0 mt-0.5">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 shadow-sm">
            <Sparkles className="w-4 h-4 text-zinc-300" />
          </div>
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
              AI Smart Insights
            </h3>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-zinc-400 leading-relaxed text-xs font-mono">
            {insights}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 138.2 — Harmonize IssueFilterTabs Active Pill (`dashboard/src/components/intelligence/IssueFilterTabs.jsx`)
- **File**: `dashboard/src/components/intelligence/IssueFilterTabs.jsx`
- **Action**: EDIT
- **Content**: Replace heavy indigo active tab pill with clean, frosted white active capsule (`bg-white/[0.08] border border-white/15`).

Replace the entire file with:
```jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function IssueFilterTabs({ categories = [], activeTab, setActiveTab }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl backdrop-blur-md">
      {categories.map((category) => {
        const isActive = activeTab === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`relative px-3 py-1.5 text-xs font-mono font-medium rounded-lg whitespace-nowrap transition-colors duration-150 flex items-center gap-2 z-10 cursor-pointer ${
              isActive ? 'text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilterTab"
                className="absolute inset-0 bg-white/[0.08] border border-white/15 rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{category.label}</span>
            {category.count > 0 && (
              <span className={`relative z-10 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold tabular-nums ${
                isActive ? 'bg-white/15 text-zinc-100' : 'bg-white/[0.04] text-zinc-500'
              }`}>
                {category.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 138.1

---

### Step 138.3 — Refine ActionableIssueCard Design (`dashboard/src/components/intelligence/ActionableIssueCard.jsx`)
- **File**: `dashboard/src/components/intelligence/ActionableIssueCard.jsx`
- **Action**: EDIT
- **Content**: Update badge color palette to subtle matte tones, refine card corner radius to `rounded-xl`, and improve action button styles.

Replace the entire file with:
```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, FileCode } from 'lucide-react';

const BADGE_COLORS = {
  critical: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  security: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  rule0: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  performance: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  dynamic: 'bg-zinc-500/10 text-zinc-300 border border-zinc-500/20',
  responsive: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  a11y: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  hygiene: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  syntax: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  complexity: 'bg-zinc-500/10 text-zinc-300 border border-zinc-500/20',
  structure: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
};

export default function ActionableIssueCard({
  issue,
  idx,
  isCopied,
  onCopyPrompt,
  onOpenIde,
}) {
  const badgeKey = (issue.severity || issue.type || issue.category || 'info').toLowerCase();
  const badgeColor = BADGE_COLORS[badgeKey] || 'bg-white/[0.04] text-zinc-400 border border-white/[0.08]';
  const fileShort = (issue.file || '').replace(/\\/g, '/').split('/').slice(-3).join('/');
  const message = issue.message || issue.error || issue.msg || 'Diagnostic issue detected';

  return (
    <motion.div
      key={`${issue.type || 'issue'}-${idx}`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.015 }}
      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group"
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase shrink-0 mt-0.5 ${badgeColor}`}>
          {issue.severity || issue.type || 'info'}
        </span>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold font-mono text-zinc-200 truncate">
              {fileShort || 'Project root'}
            </span>
            {issue.line > 0 && (
              <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded">
                L{issue.line}
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        <button
          onClick={() => onCopyPrompt(issue, idx)}
          className="px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-400 hover:text-zinc-100 text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Copy issue details and fix prompt"
        >
          {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-zinc-400" />}
          <span>{isCopied ? 'Copied!' : 'Prompt'}</span>
        </button>
        {issue.file && (
          <button
            onClick={() => onOpenIde(issue.file, issue.line)}
            className="px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-400 hover:text-zinc-100 text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Jump to file in IDE"
          >
            <FileCode size={12} className="text-zinc-400" />
            <span>IDE</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 138.2

---

### Step 138.4 — Polish ActionableIssuesList Container (`dashboard/src/components/intelligence/ActionableIssuesList.jsx`)
- **File**: `dashboard/src/components/intelligence/ActionableIssuesList.jsx`
- **Action**: EDIT
- **Content**: Polish the list container to use `bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] rounded-2xl p-5`, refine the "Copy All Prompts" button, and ensure line count stays well under 150 lines.

Replace the entire file with:
```jsx
import React, { useState, useMemo } from 'react';
import { Copy, Check, CheckCheck } from 'lucide-react';
import IssueFilterTabs from './IssueFilterTabs';
import ActionableIssueCard from './ActionableIssueCard';
import { useToast } from '../ToastProvider';
import { buildSurgicalFixPrompt, buildBulkIssuesPrompt } from '../../utils/prompt-builder';

const DEFAULT_CATEGORIES = [
  { id: 'responsive', label: 'Responsive' },
  { id: 'dynamic', label: 'Dynamic' },
  { id: 'performance', label: 'Performance' },
  { id: 'a11y', label: 'A11y' },
  { id: 'security', label: 'Security' },
];

export default function ActionableIssuesList({ issues = [], categories = DEFAULT_CATEGORIES, projectId, onOpenInIde, className = '' }) {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { showToast } = useToast();

  const filterCategories = useMemo(() => {
    const base = [{ id: 'all', label: 'All', count: issues.length }];
    const cats = categories.map(cat => ({ ...cat, count: issues.filter(i => (i.type === cat.id || i.category === cat.id)).length }));
    return [...base, ...cats.filter(c => c.count > 0)];
  }, [issues, categories]);

  const filteredIssues = useMemo(() => {
    if (activeTab === 'all') return issues;
    return issues.filter(i => (i.type === activeTab || i.category === activeTab));
  }, [issues, activeTab]);

  const handleCopyPrompt = (issue, index) => {
    if (navigator.clipboard) {
      const fullText = buildSurgicalFixPrompt({
        file: issue.file || 'General',
        line: issue.line || 'N/A',
        severity: issue.severity || issue.type || 'info',
        type: issue.type || issue.category || 'diagnostic',
        message: issue.message || issue.error || issue.msg || 'Diagnostic issue detected',
        guidance: issue.guidance || ''
      });
      navigator.clipboard.writeText(fullText);
      setCopiedId(index);
      showToast("Diagnostic prompt copied!", "success");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyAllPrompts = () => {
    if (navigator.clipboard) {
      const fullPrompt = buildBulkIssuesPrompt({ category: activeTab, issues: filteredIssues });
      navigator.clipboard.writeText(fullPrompt);
      setCopiedAll(true);
      showToast(`Copied ${filteredIssues.length} prompts!`, "success");
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleOpenTargetIde = async (filePath, line = 1) => {
    if (!filePath) return showToast("No target file specified", "warning");
    if (onOpenInIde) return onOpenInIde(filePath, line);
    try {
      const fileName = filePath.split('/').pop() || filePath;
      showToast(`Opening ${fileName} in IDE...`, "info");
      const res = await fetch('/api/open-in-ide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filePath, line, projectId }) }).then(r => r.json()).catch(() => null);
      if (!res?.opened && res?.url) window.location.href = res.url;
    } catch {
      window.location.href = `vscode://file/${filePath}${line ? `:${line}` : ''}`;
    }
  };

  return (
    <div className={`bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden ${className}`}>
      <div className="relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.04]">
          <IssueFilterTabs categories={filterCategories} activeTab={activeTab} setActiveTab={setActiveTab} />
          {filteredIssues.length > 0 && (
            <button
              onClick={handleCopyAllPrompts}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-zinc-100 text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
            >
              {copiedAll ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-zinc-400" />}
              <span>{copiedAll ? 'Copied All!' : 'Copy Prompts'}</span>
            </button>
          )}
        </div>

        {filteredIssues.length === 0 ? (
          <div className="py-14 text-center space-y-2.5 bg-white/[0.01] rounded-xl border border-white/[0.04]">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-white font-mono">No Issues Detected</h3>
            <p className="text-xs font-mono text-zinc-500 max-w-sm mx-auto">
              All intelligence diagnostics and code quality checks passed.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[37.5rem] overflow-y-auto custom-scrollbar pr-1.5 pb-1">
            {filteredIssues.map((issue, idx) => (
              <ActionableIssueCard
                key={`${issue.type || 'issue'}-${idx}`}
                issue={issue}
                idx={idx}
                isCopied={copiedId === idx}
                onCopyPrompt={handleCopyPrompt}
                onOpenIde={handleOpenTargetIde}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 138.3

---

### Step 138.5 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run all tests.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 138.4

---

### Step 138.6 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 138.5
