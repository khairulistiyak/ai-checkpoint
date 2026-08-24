import React from 'react';
import { Target, CheckCircle2, Layers, Compass, ArrowUpRight } from 'lucide-react';

export default function CockpitKpiCards({
  overall,
  remaining,
  allPhases,
  planStats,
  totalPlanSteps,
  onOpenArchitect,
}) {
  const completedPhases = (allPhases || []).filter((p) => p.percentage === 100).length;
  const isAllDone = overall?.percentage === 100;
  const blueprintFilesCount = planStats?.files?.length || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Progress */}
      <div className="bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-3 flex flex-col justify-between gap-2 transition-all">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
          <span className="font-medium">Progress</span>
          <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center text-zinc-400">
            <Target className="w-3 h-3" />
          </div>
        </div>
        <div className="text-lg font-bold font-outfit text-zinc-100 tracking-tight tabular-nums">
          {overall?.percentage || 0}%
        </div>
        <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isAllDone ? 'bg-emerald-400/80' : 'bg-zinc-300'
            }`}
            style={{ width: `${overall?.percentage || 0}%` }}
          />
        </div>
      </div>

      {/* 2. Steps */}
      <div className="bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-3 flex flex-col justify-between gap-2 transition-all">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
          <span className="font-medium">Steps</span>
          <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center text-zinc-400">
            <CheckCircle2 className="w-3 h-3" />
          </div>
        </div>
        <div className="text-lg font-bold font-outfit text-zinc-100 tracking-tight tabular-nums flex items-baseline gap-1">
          <span>{overall?.completed || 0}</span>
          <span className="text-xs font-mono text-zinc-500 font-normal">/ {overall?.total || 0}</span>
        </div>
        <div className="text-[11px] font-mono text-zinc-500 truncate">
          {remaining > 0 ? `${remaining} remaining` : 'All steps verified'}
        </div>
      </div>

      {/* 3. Phases */}
      <div className="bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-3 flex flex-col justify-between gap-2 transition-all">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
          <span className="font-medium">Phases</span>
          <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center text-zinc-400">
            <Layers className="w-3 h-3" />
          </div>
        </div>
        <div className="text-lg font-bold font-outfit text-zinc-100 tracking-tight tabular-nums flex items-baseline gap-1">
          <span>{allPhases?.length || 0}</span>
          <span className="text-xs font-mono text-zinc-500 font-normal">Phases</span>
        </div>
        <div className="text-[11px] font-mono text-zinc-500 truncate">
          {completedPhases} of {allPhases?.length || 0} completed
        </div>
      </div>

      {/* 4. Blueprints */}
      <div
        onClick={onOpenArchitect}
        className="bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.02] rounded-xl p-3 flex flex-col justify-between gap-2 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-zinc-400 group-hover:text-zinc-300 text-xs font-mono">
          <span className="font-medium">Blueprints</span>
          <div className="w-5 h-5 rounded-md bg-white/[0.04] group-hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
            <Compass className="w-3 h-3" />
          </div>
        </div>
        <div className="text-lg font-bold font-outfit text-zinc-100 tracking-tight tabular-nums flex items-baseline gap-1">
          <span>{blueprintFilesCount}</span>
          <span className="text-xs font-mono text-zinc-500 font-normal">Files</span>
        </div>
        <div className="text-[11px] font-mono text-zinc-500 group-hover:text-zinc-400 flex items-center justify-between transition-colors">
          <span>{totalPlanSteps || 0} planned steps</span>
          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}
