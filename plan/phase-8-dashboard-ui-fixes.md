# Phase 8 — Dashboard UI/UX Fixes

> Fix broken theme system, remove fake data, improve design consistency.

---

## Step 8.1 — Fix theme CSS variables in index.css
- **File:** `dashboard/src/index.css`
- **Action:** EDIT
- **Content:** Add the following CSS AFTER the closing `}` of `@layer base` block (after line 31):
  ```css
  /* Theme: Emerald & Mint */
  body.theme-emerald {
    --primary-400: #34d399;
    --primary-500: #10b981;
    --primary-600: #059669;
    --primary-900: #064e3b;
    --accent-300: #6ee7b7;
    --accent-400: #34d399;
    --accent-500: #10b981;
    --accent-600: #059669;
    --accent-950: #022c22;
  }

  /* Theme: Ocean Blue */
  body.theme-blue {
    --primary-400: #60a5fa;
    --primary-500: #3b82f6;
    --primary-600: #2563eb;
    --primary-900: #1e3a8a;
    --accent-300: #93c5fd;
    --accent-400: #60a5fa;
    --accent-500: #3b82f6;
    --accent-600: #2563eb;
    --accent-950: #172554;
  }
  ```
- **Done-check:** `grep -c "theme-emerald" dashboard/src/index.css && grep -c "theme-blue" dashboard/src/index.css` → prints 1, 1
- **Depends:** None

---

## Step 8.2 — Fix MetricsDashboard fake data
- **File:** `dashboard/src/components/MetricsDashboard.jsx`
- **Action:** EDIT
- **Content:** Replace the entire file with:
  ```jsx
  import React from 'react';
  import { Activity, Zap, Target, Layers } from 'lucide-react';
  import { motion } from 'framer-motion';

  export default function MetricsDashboard({ progress }) {
    if (!progress || !progress.overall) return null;

    const { percentage, completed, total } = progress.overall;
    const remaining = total - completed;
    const activePhases = progress.phases ? progress.phases.filter(p => p.percentage > 0 && p.percentage < 100).length : 0;

    const metrics = [
      { label: 'Completion', value: `${percentage}%`, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'bg-emerald-500/20' },
      { label: 'Steps Done', value: completed, icon: Activity, color: 'text-primary-400', bg: 'bg-primary-500/10', glow: 'bg-primary-500/20' },
      { label: 'Remaining', value: remaining, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'bg-amber-500/20' },
      { label: 'Active Phases', value: activePhases, icon: Layers, color: 'text-accent-400', bg: 'bg-accent-500/10', glow: 'bg-accent-500/20' },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={m.label}
              className="glass-card p-5 flex flex-col items-start justify-center gap-1 group hover:-translate-y-1 transition-transform relative overflow-hidden"
            >
              <div className={`absolute -right-10 -bottom-10 w-32 h-32 ${m.glow} blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-500 z-0`} />
              <div className="flex items-center justify-between w-full relative z-10">
                <div className={`w-8 h-8 rounded-full ${m.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </div>
              <div className="text-3xl font-black text-white mt-2 relative z-10">{m.value}</div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400 relative z-10">{m.label}</div>

              {/* Progress bar instead of fake sparkline */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.03]">
                <motion.div
                  className={`h-full ${m.color.replace('text-', 'bg-')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }
  ```
- **Done-check:** `grep -c "Math.random" dashboard/src/components/MetricsDashboard.jsx && grep -c "Optimal" dashboard/src/components/MetricsDashboard.jsx && grep -c "Active Phases" dashboard/src/components/MetricsDashboard.jsx` → prints 0, 0, 1
- **Depends:** None

---

## Step 8.3 — Fix ProgressRing dynamic font size
- **File:** `dashboard/src/components/ProgressRing.jsx`
- **Action:** EDIT
- **Content:** Find this line:
  ```jsx
  <span className="text-2xl font-bold">{percentage}%</span>
  ```
  Replace with:
  ```jsx
  <span className="font-bold" style={{ fontSize: Math.max(size * 0.22, 10) }}>{percentage}%</span>
  ```
- **Done-check:** `grep -q "Math.max" dashboard/src/components/ProgressRing.jsx && echo OK` → prints OK
- **Depends:** None

---

## Step 8.4 — Fix Terminal button in ProjectCard
- **File:** `dashboard/src/components/ProjectCard.jsx`
- **Action:** EDIT
- **Content:** Find this line:
  ```jsx
  <button className="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-slate-300 transition-all border border-white/[0.05]" title="Open in Terminal">
  ```
  Replace with:
  ```jsx
  <button onClick={() => { navigator.clipboard.writeText(`cd ${project.path}`); }} className="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-slate-300 transition-all border border-white/[0.05]" title="Copy cd command">
  ```
- **Done-check:** `grep -q "navigator.clipboard" dashboard/src/components/ProjectCard.jsx && echo OK` → prints OK
- **Depends:** None

---

## Step 8.5 — Fix ExportButton styling consistency
- **File:** `dashboard/src/components/ExportButton.jsx`
- **Action:** EDIT
- **Content:** Find this line:
  ```jsx
  className="p-2 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-slate-900 group relative"
  ```
  Replace with:
  ```jsx
  className="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-slate-300 transition-all border border-white/[0.05] group relative"
  ```
- **Done-check:** `grep -q "bg-white/\[0.05\]" dashboard/src/components/ExportButton.jsx && echo OK` → prints OK
- **Depends:** None

---

## Step 8.6 — Add network error banner to App.jsx
- **File:** `dashboard/src/App.jsx`
- **Action:** EDIT
- **Content:** Find this line in the return statement (around line 88):
  ```jsx
  <div className="h-screen w-screen overflow-hidden flex flex-col font-sans relative">
  ```
  Add this IMMEDIATELY after that opening div:
  ```jsx
      {error && (
        <div className="mx-4 md:mx-6 mt-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-sm text-red-300">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
          Server connection error. Auto-retrying...
        </div>
      )}
  ```
- **Done-check:** `grep -c "Server connection error" dashboard/src/App.jsx` → prints 1
- **Depends:** None
