import React from 'react';
import { Target, Layers, FileCode2, CheckCircle2 } from 'lucide-react';

export default function CockpitProgressCard({
  overall = 0,
  remaining = 0,
  allPhases = [],
  activePhases = [],
  planStats = { totalPlans: 0, totalPlannedSteps: 0 },
  totalPlanSteps = 0,
  onOpenArchitect
}) {
  const totalPhases = allPhases.length;
  const completedPhases = allPhases.filter(p => p.status === 'completed' || p.status === 'done').length;
  const totalSteps = allPhases.reduce((acc, p) => acc + (p.steps?.length || 0), 0);
  const completedSteps = totalSteps - remaining;
  const pct = Math.min(100, Math.max(0, Math.round(overall)));

  return (
    <div className="bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-4 flex flex-col justify-between h-full min-h-[14rem] shadow-sm transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono font-medium text-zinc-400">Roadmap Progress</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-100">
          <span className="text-base text-emerald-400">{pct}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="my-3 relative z-10">
        <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden border border-white/[0.04]">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(52,211,153,0.3)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-1.5">
          <span>{pct === 100 ? 'All milestones reached' : `${remaining} step${remaining === 1 ? '' : 's'} remaining`}</span>
          <span className="text-zinc-400">{completedSteps}/{totalSteps} steps</span>
        </div>
      </div>

      {/* Micro-Metrics Breakdown */}
      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/[0.04] relative z-10 text-xs font-mono">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <Layers className="w-3 h-3 text-zinc-400" />
            <span>Phases</span>
          </div>
          <div className="text-zinc-200 font-semibold text-xs mt-0.5">
            {completedPhases}/{totalPhases} <span className="text-[10px] text-zinc-500 font-normal">done</span>
          </div>
        </div>

        <div
          onClick={onOpenArchitect}
          className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] rounded-xl p-2 flex flex-col justify-center cursor-pointer transition-all group/bp"
          title="Open Plan Blueprints"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <FileCode2 className="w-3 h-3 text-zinc-400 group-hover/bp:text-zinc-200" />
              <span>Blueprints</span>
            </div>
            <span className="text-[10px] text-zinc-500 group-hover/bp:text-zinc-300">→</span>
          </div>
          <div className="text-zinc-200 font-semibold text-xs mt-0.5">
            {planStats.totalPlans} <span className="text-[10px] text-zinc-500 font-normal">plans</span>
          </div>
        </div>
      </div>
    </div>
  );
}
