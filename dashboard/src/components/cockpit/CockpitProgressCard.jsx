import React from 'react';
import { Target, Zap } from 'lucide-react';

export default function CockpitProgressCard({
  overall,
  remaining = 0,
  allPhases = [],
  activePhases = [],
  planStats = null,
  totalPlanSteps = 0,
  activeStep = null,
  onOpenArchitect
}) {
  const totalPlans = planStats?.totalFiles ?? planStats?.files?.length ?? planStats?.fileNames?.length ?? allPhases.length ?? 0;
  const totalPhases = allPhases.length || totalPlans;
  
  const fallbackTotalSteps = allPhases.reduce((acc, p) => acc + (p.steps?.length || p.total || 0), 0);
  const totalSteps = overall?.total || fallbackTotalSteps || totalPlanSteps || 0;
  
  const rawPct = typeof overall === 'number' 
    ? overall 
    : (overall?.percentage ?? (totalSteps > 0 ? Math.round(((overall?.completed || 0) / totalSteps) * 100) : 0));
  const pct = Math.min(100, Math.max(0, isNaN(rawPct) ? 0 : Math.round(rawPct)));

  const completedSteps = overall?.completed ?? (pct === 100 ? totalSteps : Math.max(0, totalSteps - remaining));

  const parsedCompletedPhases = allPhases.filter(p => (
    p.status === 'completed' || 
    p.status === 'done' || 
    (typeof p.percentage === 'number' && p.percentage >= 100) ||
    (p.completed && p.total && p.completed >= p.total)
  )).length;

  const completedPhases = (pct === 100 && totalPhases > 0) ? totalPhases : parsedCompletedPhases;

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

        {/* Header Status Tag */}
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.02] border border-white/[0.05]">
          <span className={`w-1.5 h-1.5 rounded-full ${pct === 100 ? 'bg-zinc-300 shadow-[0_0_6px_rgba(255,255,255,0.4)]' : (activeStep ? 'bg-amber-400 animate-ping' : 'bg-zinc-400')}`} />
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
            {pct === 100 ? 'COMPLETE' : (activeStep ? 'ACTIVE' : 'STANDBY')}
          </span>
        </div>
      </div>

      {/* Center Hero Progress & Active HUD */}
      <div className="my-auto py-2 flex flex-col items-center justify-center relative z-10 w-full">
        {/* Large Percentage */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-zinc-100 tabular-nums">
            {pct}%
          </span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-medium">
            {pct === 100 ? 'done' : 'progress'}
          </span>
        </div>

        {/* Sleek Progress Track */}
        <div className="w-full max-w-[16rem] bg-white/[0.04] h-1.5 rounded-full overflow-hidden border border-white/[0.04] mt-2 mb-1.5">
          <div
            className="bg-zinc-200 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(255,255,255,0.12)]"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Context or Active Step Micro-HUD */}
        {activeStep ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 max-w-full">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0">
              Step {activeStep.id || activeStep.number}
            </span>
            <span className="text-[11px] font-medium text-zinc-300 truncate font-outfit">
              {activeStep.title || activeStep.name}
            </span>
          </div>
        ) : (
          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
            <span className="text-zinc-300 tabular-nums font-semibold">{completedSteps}/{totalSteps}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-500">{pct === 100 ? 'Milestones reached' : `${remaining} left`}</span>
          </div>
        )}
      </div>

      {/* 3-Cell Symmetrical Metric Matrix (Steps, Phases, Blueprints) */}
      <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-white/[0.04] text-center relative z-10 font-mono">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
          <div className="text-zinc-200 font-semibold text-xs tabular-nums">{completedSteps}/{totalSteps}</div>
          <div className="text-[9px] text-zinc-500 uppercase font-medium">Steps</div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
          <div className="text-zinc-200 font-semibold text-xs tabular-nums">{completedPhases}/{totalPhases}</div>
          <div className="text-[9px] text-zinc-500 uppercase font-medium">Phases</div>
        </div>

        <div
          onClick={onOpenArchitect}
          className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] rounded-lg p-1.5 flex flex-col justify-center cursor-pointer transition-all group/bp"
          title="Open Plan Blueprints"
        >
          <div className="text-zinc-200 group-hover/bp:text-white font-semibold text-xs tabular-nums flex items-center justify-center gap-0.5">
            <span>{totalPlans}</span>
            <span className="text-[9px] text-zinc-500 group-hover/bp:text-zinc-300">→</span>
          </div>
          <div className="text-[9px] text-zinc-500 group-hover/bp:text-zinc-400 uppercase font-medium">Plans</div>
        </div>
      </div>
    </div>
  );
}
