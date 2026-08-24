import React from 'react';
import { Target, Activity, Layers, Compass, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function CockpitKpiCards({
  overall,
  remaining,
  allPhases,
  activePhases,
  planStats,
  totalPlanSteps,
  onOpenArchitect,
}) {
  const completedPhases = (allPhases || []).filter((p) => p.percentage === 100).length;
  const isAllDone = overall?.percentage === 100;
  const blueprintFilesCount = planStats?.files?.length || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Overall Completion Progress */}
      <div className="bg-[#0b0b0e]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-lg transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Progress
            </span>
          </div>
          {isAllDone ? (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified</span>
            </span>
          ) : (
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>

        <div>
          <div className="text-2xl font-bold font-outfit text-white tracking-tight tabular-nums flex items-baseline gap-1.5">
            <span>{overall?.percentage || 0}%</span>
          </div>
          <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mt-2.5">
            <div
              className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overall?.percentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Step Ledger */}
      <div className="bg-[#0b0b0e]/80 backdrop-blur-xl border border-white/[0.08] hover:border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-lg transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Step Ledger
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded-full">
            {remaining > 0 ? `${remaining} rem` : '0 rem'}
          </span>
        </div>

        <div>
          <div className="text-2xl font-bold font-outfit text-white tracking-tight tabular-nums flex items-baseline gap-1">
            <span>{overall?.completed || 0}</span>
            <span className="text-sm font-mono text-zinc-500 font-normal">/ {overall?.total || 0}</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{overall?.completed || 0} executed steps</span>
          </div>
        </div>
      </div>

      {/* 3. Phases */}
      <div className="bg-[#0b0b0e]/80 backdrop-blur-xl border border-white/[0.08] hover:border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-lg transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Phases
            </span>
          </div>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
            {completedPhases} done
          </span>
        </div>

        <div>
          <div className="text-2xl font-bold font-outfit text-white tracking-tight tabular-nums flex items-baseline gap-1">
            <span>{allPhases?.length || 0}</span>
            <span className="text-sm font-mono text-zinc-500 font-normal">milestones</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>{activePhases || 0} active • {completedPhases} complete</span>
          </div>
        </div>
      </div>

      {/* 4. Blueprints */}
      <div
        onClick={onOpenArchitect}
        className="bg-[#0b0b0e]/80 backdrop-blur-xl border border-white/[0.08] hover:border-sky-500/40 hover:bg-sky-500/[0.03] rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-lg transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 group-hover:text-white font-semibold">
              Blueprints
            </span>
          </div>
          <div className="flex items-center gap-0.5 text-zinc-400 group-hover:text-sky-300 text-[11px] font-mono transition-colors">
            <span>Inspect</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold font-outfit text-white tracking-tight tabular-nums flex items-baseline gap-1">
            <span>{blueprintFilesCount}</span>
            <span className="text-sm font-mono text-zinc-500 font-normal">specs</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-300 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{totalPlanSteps || 0} mapped steps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
