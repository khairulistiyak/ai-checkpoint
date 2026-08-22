import React, { useState } from 'react';
import { Rocket, Target, Activity, Layers, FileText } from 'lucide-react';
import GitVisualizer from './GitVisualizer';
import ActivityLog from './ActivityLog';
import CockpitHealthOverview from './cockpit/CockpitHealthOverview';
import IntelligenceModal from './intelligence/IntelligenceModal';

export default function CockpitTab({
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
  onSelectTab
}) {
  const [isIntelligenceModalOpen, setIsIntelligenceModalOpen] = useState(false);
  const unsyncedSteps = selectedProject?.unsyncedSteps || 0;
  const hasNoSteps = totalPlanSteps === 0 && allPhases.length === 0;

  return (
    <div className="flex flex-col gap-3">
      {hasNoSteps && (
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-outfit">Create your first plan file</h3>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                Add a markdown plan file (e.g. <code className="text-sky-300">plan/phase-1.md</code>) to get started with execution tracking.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab ? onSelectTab('files') : handleOpenArchitect()}
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-outfit transition-all shrink-0"
          >
            Open Plan Blueprints →
          </button>
        </div>
      )}
      {/* Top 4 Compact Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-[#121214]/90 border border-white/[0.08] hover:border-white/15 rounded-2xl p-3.5 flex flex-col justify-between gap-1.5 shadow-sm transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="font-medium">Completion</span>
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-sky-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-outfit text-white tracking-tight">{overall.percentage}%</div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${overall.percentage}%` }} />
          </div>
        </div>

        <div className="bg-[#121214]/90 border border-white/[0.08] hover:border-white/15 rounded-2xl p-3.5 flex flex-col justify-between gap-1.5 shadow-sm transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="font-medium">Steps Done</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-outfit text-white tracking-tight">
            {overall.completed} <span className="text-xs font-mono text-zinc-500 font-normal">/ {overall.total}</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500 truncate">{remaining} steps remaining</div>
        </div>

        <div className="bg-[#121214]/90 border border-white/[0.08] hover:border-white/15 rounded-2xl p-3.5 flex flex-col justify-between gap-1.5 shadow-sm transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="font-medium">Phases</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-outfit text-white tracking-tight">
            {allPhases.length} <span className="text-xs font-mono text-zinc-500 font-normal">Phases</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500 truncate">
            {activePhases} active • {allPhases.filter(p => p.percentage === 100).length} done
          </div>
        </div>

        <div
          onClick={() => onSelectTab ? onSelectTab('files') : handleOpenArchitect()}
          className="bg-[#121214]/90 border border-white/[0.08] hover:border-sky-500/30 hover:bg-sky-500/5 rounded-2xl p-3.5 flex flex-col justify-between gap-1.5 shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 group-hover:text-white text-xs font-mono">
            <span className="flex items-center gap-1.5 font-bold">
              <span>Blueprints</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">CAD</span>
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-outfit text-white tracking-tight">
            {planStats?.files?.length || 0} <span className="text-xs font-mono text-zinc-500 font-normal">Files</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500 group-hover:text-zinc-300 truncate">
            {totalPlanSteps} planned steps • Open →
          </div>
        </div>
      </div>

      {unsyncedSteps > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-amber-400 text-sm">⚠</span>
          <div>
            <span className="text-xs font-bold text-amber-300 font-outfit">
              {unsyncedSteps} plan step{unsyncedSteps > 1 ? 's' : ''} not synced to Roadmap & Steps
            </span>
            <p className="text-[11px] text-amber-400/70 font-mono mt-0.5">
              Run <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300">./l sync</code> or save plan to update execution ledger
            </p>
          </div>
        </div>
      )}

      {/* Embedded Live Health & Quality Fortress */}
      <CockpitHealthOverview projectId={selectedProject.id} onOpenIntelligence={() => setIsIntelligenceModalOpen(true)} />

      {/* Git Snapshots & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
        <div className="bg-[#121214]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-3.5 sm:p-4 flex flex-col shadow-sm min-h-[25rem]">
          <div className="flex items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-white/[0.08] shrink-0">
            <h2 className="text-xs font-bold text-white flex items-center gap-2 font-outfit uppercase tracking-wider">
              <Rocket className="w-3.5 h-3.5 text-sky-400" />
              <span>Git Snapshots & Checkpoints</span>
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">Live Rollback Tree</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <GitVisualizer projectId={selectedProject.id} onRefresh={refresh} />
          </div>
        </div>

        <div className="flex flex-col min-h-[25rem]">
          <ActivityLog projectId={selectedProject.id} liveEntry={liveActivityEntry} />
        </div>
      </div>

      <IntelligenceModal 
        isOpen={isIntelligenceModalOpen} 
        onClose={() => setIsIntelligenceModalOpen(false)} 
        project={selectedProject} 
      />
    </div>
  );
}
