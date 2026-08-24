import React from 'react';
import { Target, Layers, FileCode2, CheckCircle2, Zap } from 'lucide-react';

export default function CockpitProgressCard({
  overall,
  remaining = 0,
  allPhases = [],
  activePhases = [],
  planStats = { totalPlans: 0, totalPlannedSteps: 0 },
  totalPlanSteps = 0,
  activeStep = null,
  onOpenArchitect
}) {
  const totalPhases = allPhases.length;
  const completedPhases = allPhases.filter(p => p.status === 'completed' || p.status === 'done').length;
  const fallbackTotalSteps = allPhases.reduce((acc, p) => acc + (p.steps?.length || 0), 0);
  const totalSteps = overall?.total || fallbackTotalSteps || totalPlanSteps || 0;
  const completedSteps = overall?.completed ?? Math.max(0, totalSteps - remaining);
  
  const rawPct = typeof overall === 'number' 
    ? overall 
    : (overall?.percentage ?? (totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0));
  const pct = Math.min(100, Math.max(0, isNaN(rawPct) ? 0 : Math.round(rawPct)));

  return (
    <div className="bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-4 flex flex-col justify-between h-full min-h-[14rem] shadow-sm transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
            <Target className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <span className="text-xs font-mono font-medium text-zinc-400">Roadmap Progress</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-100">
          <span className="text-base text-emerald-400 tabular-nums">{pct}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="mt-2 mb-1.5 relative z-10">
        <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden border border-white/[0.04]">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(52,211,153,0.3)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-1">
          <span>{pct === 100 ? 'Milestones complete' : `${remaining} step${remaining === 1 ? '' : 's'} remaining`}</span>
          <span className="text-zinc-400 tabular-nums">{completedSteps}/{totalSteps} steps</span>
        </div>
      </div>

      {/* Active Step HUD or Zen State Pill */}
      <div className="my-1 relative z-10">
        {activeStep ? (
          <div className="bg-amber-500/[0.06] border border-amber-500/25 rounded-xl p-2.5 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[9px] font-mono font-bold uppercase text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded shrink-0">
                  Step {activeStep.id || activeStep.number}
                </span>
                <span className="text-[11px] font-medium text-zinc-200 truncate font-outfit">
                  {activeStep.title || activeStep.name}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400 font-bold uppercase shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Live
              </span>
            </div>
            {activeStep.file && (
              <div className="text-[9.5px] font-mono text-zinc-400 truncate">
                Target: <span className="text-amber-300/90">{activeStep.file}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-zinc-300 font-outfit text-xs">
                {pct === 100 ? 'All Milestones Complete' : 'Execution Ledger Synced'}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">
              {pct === 100 ? 'READY' : 'STANDBY'}
            </span>
          </div>
        )}
      </div>

      {/* Micro-Metrics Breakdown */}
      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/[0.04] relative z-10 text-xs font-mono">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
            <Layers className="w-3 h-3 text-zinc-400" />
            <span>Phases</span>
          </div>
          <div className="text-zinc-200 font-semibold text-xs mt-0.5 tabular-nums">
            {completedPhases}/{totalPhases} <span className="text-[9px] text-zinc-500 font-normal">done</span>
          </div>
        </div>

        <div
          onClick={onOpenArchitect}
          className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] rounded-lg p-1.5 flex flex-col justify-center cursor-pointer transition-all group/bp"
          title="Open Plan Blueprints"
        >
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <div className="flex items-center gap-1.5">
              <FileCode2 className="w-3 h-3 text-zinc-400 group-hover/bp:text-zinc-200" />
              <span>Blueprints</span>
            </div>
            <span className="text-[9px] text-zinc-500 group-hover/bp:text-zinc-300">→</span>
          </div>
          <div className="text-zinc-200 font-semibold text-xs mt-0.5 tabular-nums">
            {planStats?.totalPlans || 0} <span className="text-[9px] text-zinc-500 font-normal">plans</span>
          </div>
        </div>
      </div>
    </div>
  );
}
