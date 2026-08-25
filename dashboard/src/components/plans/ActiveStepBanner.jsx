import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2 } from 'lucide-react';

export default function ActiveStepBanner({
  activeStep = null, nextStep = null, totalCompleted = 0, totalSteps = 0
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeStep) { setElapsed(0); return; }
    const timer = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, [activeStep?.step || activeStep?.id || activeStep?.number || null]);

  const formatElapsed = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  const isAllComplete = totalSteps > 0 && totalCompleted >= totalSteps;

  if (activeStep) {
    return (
      <div className="mx-4 mt-3 sm:mx-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(245,158,11,0.08)] shrink-0 transition-all">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md shrink-0">
                Active Step {activeStep.step || activeStep.id || activeStep.number}
              </span>
              <span className="text-xs font-medium text-white truncate font-outfit">
                {activeStep.title || activeStep.name}
              </span>
            </div>
            {activeStep.file && (
              <div className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                Target: <span className="text-amber-200/90">{activeStep.file}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold tabular-nums">
            <Timer className="w-3 h-3 text-amber-400" />
            <span>{formatElapsed(elapsed)}</span>
          </div>
          <span className="text-[10px] font-mono text-amber-300 font-bold uppercase px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30">
            WORKING
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-3 sm:mx-5 p-2.5 sm:px-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] flex items-center justify-between gap-3 shrink-0 transition-all">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className={`w-2 h-2 rounded-full shrink-0 ${isAllComplete ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-sky-400'}`} />
        <div className="min-w-0 flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-300 font-medium truncate">
            {isAllComplete ? (
              <span className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                All milestones verified & completed ({totalCompleted}/{totalSteps} steps)
              </span>
            ) : nextStep ? (
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="text-sky-400 font-bold font-mono">Next: Step {nextStep.number}</span>
                <span className="text-zinc-500">•</span>
                <span className="truncate">{nextStep.title}</span>
              </span>
            ) : (
              <span className="text-zinc-400">Execution Engine Standby • Ready for commands</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 font-mono">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
          isAllComplete
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : 'text-zinc-400 bg-white/[0.03] border-white/[0.06]'
        }`}>
          {isAllComplete ? 'COMPLETE' : 'STANDBY'}
        </span>
      </div>
    </div>
  );
}
