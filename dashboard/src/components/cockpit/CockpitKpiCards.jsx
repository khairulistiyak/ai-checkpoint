import React from 'react';
import { Target, Activity, Layers, FileText } from 'lucide-react';

export default function CockpitKpiCards({ overall, remaining, allPhases, activePhases, planStats, totalPlanSteps, onOpenArchitect }) {
  return (
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
        onClick={onOpenArchitect}
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
  );
}
