# Phase 63: Embed Health & Quality Fortress in Cockpit Overview

> Cockpit Overview ট্যাবে সম্পূর্ণ Health & Quality Fortress (Score gauge, 6 pillars breakdown, core checklist, issue explorer) সরাসরি প্রদর্শন করা যাতে প্রজেক্টে ঢোকার সাথে সাথেই ইউজার এক নজরে সব বুঝতে পারে।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 63: Cockpit Health & Quality Overview

### Step 63.1 — Create CockpitHealthOverview component (`dashboard/src/components/cockpit/CockpitHealthOverview.jsx`)
- **File:** `dashboard/src/components/cockpit/CockpitHealthOverview.jsx`
- **Action:** CREATE
- **Depends:** None

**সমস্যা:** Cockpit Overview ট্যাবে হেলথ ও কোয়ালিটি ড্যাশবোর্ড সরাসরি প্রদর্শিত হতো না।

**কী করতে হবে:**
নতুন `CockpitHealthOverview.jsx` কম্পোনেন্ট তৈরি করো যা `useHealthCommandCenter` হুক ব্যবহার করে লাইভ হেলথ স্কোর, পিলার গ্রিড, কোর চেকলিস্ট এবং ইস্যু এক্সপ্লোরার রেন্ডার করবে।

```jsx
import React, { useState } from 'react';
import { Shield, RefreshCw, AlertTriangle, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../ToastProvider';
import HealthScoreGauge from '../health/HealthScoreGauge';
import HealthPillarGrid from '../health/HealthPillarGrid';
import HealthCoreChecklist from '../health/HealthCoreChecklist';
import HealthIssueExplorer from '../health/HealthIssueExplorer';
import { useHealthCommandCenter } from '../health/useHealthCommandCenter';

export default function CockpitHealthOverview({ projectId }) {
  const { showToast } = useToast();
  const [isIssuesExpanded, setIsIssuesExpanded] = useState(false);
  const {
    health, loading, copiedReport, error, activeCategory, setActiveCategory,
    searchQuery, setSearchQuery, fetchHealth, handleCopyDiagnosticReport,
    handleOpenInIde, score, healthScore, qualityScore, scoreColor, breakdown,
    issues, checks, filteredIssues, categoryCounts
  } = useHealthCommandCenter({ projectId, showToast });

  return (
    <div className="bg-cyber-card/90 backdrop-blur-xl border border-cyber-card-border rounded-2xl p-3.5 sm:p-5 shadow-sm space-y-4">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyber-card-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" style={{ color: scoreColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white font-outfit tracking-tight">Health & Quality Overview</h2>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-300">Live Fortress</span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">AST integrity, Rule 0 guard, security auditing & code hygiene.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyDiagnosticReport}
            disabled={!health || loading}
            className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
            title="Copy structured diagnostic prompt for AI to fix issues"
          >
            {copiedReport ? <Check size={12} className="text-purple-300" /> : <Sparkles size={12} className="text-purple-400" />}
            <span>{copiedReport ? 'Copied!' : 'Fix Prompt'}</span>
          </button>

          <button
            onClick={fetchHealth}
            disabled={loading}
            className="bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Scanning...' : 'Re-scan'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2.5">
          <AlertTriangle size={14} className="shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {health && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <HealthScoreGauge
              score={score}
              scoreColor={scoreColor}
              healthScore={healthScore}
              qualityScore={qualityScore}
              filesScanned={health.filesScanned}
              passed={health.passed}
            />
            <HealthPillarGrid breakdown={breakdown} />
          </div>

          <HealthCoreChecklist checks={checks} />

          {issues.length > 0 && (
            <div className="pt-1">
              <button
                onClick={() => setIsIssuesExpanded(prev => !prev)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] text-xs font-mono text-zinc-300 transition-all cursor-pointer"
              >
                <span className="font-bold flex items-center gap-2">
                  <span>Detected Diagnostics & Issues ({issues.length})</span>
                  {issues.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                      {categoryCounts.security > 0 ? `${categoryCounts.security} security` : `${issues.length} items`}
                    </span>
                  )}
                </span>
                {isIssuesExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>

              {isIssuesExpanded && (
                <div className="mt-3">
                  <HealthIssueExplorer
                    issues={issues}
                    filteredIssues={filteredIssues}
                    categoryCounts={categoryCounts}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onOpenInIde={handleOpenInIde}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- **Done-check:** `test -f dashboard/src/components/cockpit/CockpitHealthOverview.jsx`

---

### Step 63.2 — Embed CockpitHealthOverview in CockpitTab (`dashboard/src/components/CockpitTab.jsx`)
- **File:** `dashboard/src/components/CockpitTab.jsx`
- **Action:** MODIFY
- **Depends:** Step 63.1

**সমস্যা:** `CockpitTab.jsx`-এ হেলথ ওভারভিউ রেন্ডার করা নেই।

**কী করতে হবে:**
1. `CockpitHealthOverview` ইমপোর্ট করো:
   ```jsx
   import CockpitHealthOverview from './cockpit/CockpitHealthOverview';
   ```
2. Unsynced steps warning-এর নিচে এবং Git/Activity গ্রিডের উপরে `<CockpitHealthOverview projectId={selectedProject.id} />` বসাও।
3. ফাইলের মোট লাইন সংখ্যা যেন ১৫০-এর নিচে থাকে।

- **Done-check:** `cd dashboard && npm run build`

---

### Step 63.3 — Run full verification suite (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 63.1, Step 63.2

**কী করতে হবে:**
```bash
./l v
./l health
./l quality
cd dashboard && npm run build
```

- **Done-check:** exit code 0 for all validation commands
