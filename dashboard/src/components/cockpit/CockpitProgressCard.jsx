import React, { useState, useEffect } from 'react';
import { Target, Timer } from 'lucide-react';
import { isStepActive } from '../../utils/date-formatter';

export default function CockpitProgressCard({
  overall, remaining = 0, allPhases = [], activePhases = [], planStats = null, totalPlanSteps = 0, activeStep = null, onOpenArchitect
}) {
  const totalPlans = planStats?.totalFiles ?? planStats?.files?.length ?? planStats?.fileNames?.length ?? allPhases.length ?? 0;
  const totalPhases = allPhases.length || totalPlans;
  const fallbackTotalSteps = allPhases.reduce((acc, p) => acc + (p.steps?.length || p.total || 0), 0);
  const totalSteps = overall?.total || fallbackTotalSteps || totalPlanSteps || 0;
  
  const rawPct = typeof overall === 'number' ? overall : (overall?.percentage ?? (totalSteps > 0 ? Math.round(((overall?.completed || 0) / totalSteps) * 100) : 0));
  const pct = Math.min(100, Math.max(0, isNaN(rawPct) ? 0 : Math.round(rawPct)));
  const hasRunningStep = Boolean(activeStep || allPhases.some(p => p.steps?.some(s => isStepActive(s))));
  const isTrulyComplete = !hasRunningStep && pct === 100 && totalSteps > 0 && remaining === 0;
  const displayPct = hasRunningStep ? (pct >= 100 ? 99 : pct) : pct;

  const completedSteps = overall?.completed ?? (isTrulyComplete ? totalSteps : Math.max(0, totalSteps - remaining));
  const parsedCompletedPhases = allPhases.filter(p => p.status === 'completed' || p.status === 'done' || (typeof p.percentage === 'number' && p.percentage >= 100) || (p.completed && p.total && p.completed >= p.total)).length;
  const completedPhases = (isTrulyComplete && totalPhases > 0) ? totalPhases : parsedCompletedPhases;

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!activeStep) { setElapsed(0); return; }
    const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [activeStep?.id || activeStep?.number || null]);

  const formatElapsed = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  const cardBorder = hasRunningStep ? 'border-amber-500/35 bg-[#0e0e11]/95 shadow-[0_0_20px_rgba(245,158,11,0.06)]' : 'border-white/[0.06] hover:border-white/[0.12]';
  const barGradient = hasRunningStep ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : isTrulyComplete ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]' : 'bg-gradient-to-r from-zinc-300 to-zinc-100 shadow-[0_0_12px_rgba(255,255,255,0.2)]';
  const pctGradient = hasRunningStep ? 'bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-400' : isTrulyComplete ? 'bg-gradient-to-b from-emerald-200 via-emerald-300 to-teal-400' : 'bg-gradient-to-b from-white via-zinc-100 to-zinc-400';

  return (
    <div className={`bg-[#0e0e11]/80 backdrop-blur-md border rounded-2xl p-4 flex flex-col justify-between h-full min-h-[14rem] shadow-sm transition-all group relative overflow-hidden ${cardBorder}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
            <Target className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <span className="text-xs font-mono font-medium text-zinc-400">Roadmap Progress</span>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${hasRunningStep ? 'bg-amber-500/10 border border-amber-500/30' : isTrulyComplete ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.02] border border-white/[0.05]'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${hasRunningStep ? 'bg-amber-400 animate-ping' : isTrulyComplete ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-zinc-400'}`} />
          <span className={`text-[10px] font-mono uppercase font-semibold ${hasRunningStep ? 'text-amber-300 font-bold' : isTrulyComplete ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
            {hasRunningStep ? 'WORKING' : isTrulyComplete ? 'COMPLETE' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Center Hero Progress & Milestone HUD */}
      <div className="my-auto py-1 flex flex-col items-center justify-center relative z-10 w-full text-center">
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex items-baseline">
            <span className={`text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text tabular-nums drop-shadow-[0_2px_8px_rgba(255,255,255,0.06)] ${pctGradient}`}>
              {displayPct}
            </span>
            <span className="text-base font-mono font-semibold text-zinc-500 ml-0.5">%</span>
          </div>

          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold uppercase tracking-wider shadow-sm ${hasRunningStep ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : isTrulyComplete ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-white/[0.03] border border-white/[0.08] text-zinc-300'}`}>
            {hasRunningStep ? 'In Progress' : isTrulyComplete ? 'Completed' : 'Milestone'}
          </div>
        </div>

        <div className="w-full max-w-[15rem] bg-white/[0.04] h-1.5 rounded-full overflow-hidden border border-white/[0.04] my-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
          <div className={`h-full rounded-full transition-all duration-700 ease-out ${barGradient}`} style={{ width: `${displayPct}%` }} />
        </div>

        {/* Context or Active Step Micro-HUD with Stopwatch */}
        {activeStep ? (
          <div className="w-full max-w-[17.5rem] px-2.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] flex items-center justify-between gap-2 shadow-sm transition-all">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0">Step {activeStep.id || activeStep.number}</span>
                <span className="text-zinc-600 text-[10px]">•</span>
                <span className="text-[11px] font-mono text-zinc-300 truncate" title={activeStep.title || activeStep.name}>{activeStep.title || activeStep.name}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-zinc-400 shrink-0 tabular-nums shadow-sm" title="Elapsed step time">
              <Timer className="w-2.5 h-2.5 text-amber-400/90" />
              <span className="text-[10px] font-mono font-medium text-zinc-300">{formatElapsed(elapsed)}</span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-center gap-1.5">
            <span className="text-zinc-300 font-medium">{isTrulyComplete ? 'All milestones achieved' : `${remaining} step${remaining === 1 ? '' : 's'} remaining`}</span>
            {!isTrulyComplete && (<><span className="text-zinc-600">•</span><span className="text-zinc-500">Ready</span></>)}
          </div>
        )}
      </div>

      {/* 3-Cell Symmetrical Metric Matrix (Steps Done, Phases, Blueprints) */}
      <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-white/[0.04] text-center relative z-10 font-mono">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
          <div className="text-zinc-200 font-semibold text-xs tabular-nums">{completedSteps}</div>
          <div className="text-[9px] text-zinc-500 uppercase font-medium">Steps Done</div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
          <div className="text-zinc-200 font-semibold text-xs tabular-nums">{completedPhases}/{totalPhases}</div>
          <div className="text-[9px] text-zinc-500 uppercase font-medium">Phases</div>
        </div>

        <div onClick={onOpenArchitect} className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] rounded-lg p-1.5 flex flex-col justify-center cursor-pointer transition-all group/bp" title="Open Plan Blueprints">
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
