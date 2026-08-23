import React from 'react';

export default function ActiveStepBanner({ activeStep }) {
  if (!activeStep) return null;

  return (
    <div className="mx-4 mt-3 sm:mx-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 animate-pulse shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md">
              Active Step {activeStep.id || activeStep.number}
            </span>
            <span className="text-xs font-medium text-white truncate">
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
      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase px-2 py-1 rounded-lg bg-amber-500/20 shrink-0">
        ⚡ In Progress
      </span>
    </div>
  );
}
