import React from 'react';
import { Layers } from 'lucide-react';

export default function PlanFilesHeader({ filesCount, totalStepsAcrossFiles }) {
  return (
    <div className="rounded-2xl bg-[#121214] border border-white/10 p-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-white/5 text-white/70 px-2 py-0.5 rounded border border-white/10 font-bold">
              REPOSITORY
            </span>
            <span className="text-[11px] font-mono text-zinc-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              LIVE BLUEPRINTS
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5 font-outfit">
            Architectural Plan Specifications
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-6 text-xs font-mono">
        <div className="flex flex-col items-end">
          <span className="text-white/40 text-[10px] uppercase">Specifications</span>
          <span className="text-white font-medium">{filesCount} Blueprints</span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col items-end">
          <span className="text-white/40 text-[10px] uppercase">Atomic Steps</span>
          <span className="text-white font-bold">{totalStepsAcrossFiles} Tasks</span>
        </div>
      </div>
    </div>
  );
}
