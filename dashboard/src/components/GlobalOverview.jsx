import React from 'react';
import { Activity, Folder, CheckCircle2, Award } from 'lucide-react';

export default function GlobalOverview({ projects }) {
  const total = projects.length;
  const installed = projects.filter(p => p.isInstalled).length;
  let totalSteps = 0;
  let doneSteps = 0;

  projects.forEach(p => {
    if (p.isInstalled && p.progress && p.progress.overall) {
      totalSteps += p.progress.overall.total || 0;
      doneSteps += p.progress.overall.completed || 0;
    }
  });

  const percent = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);

  return (
    <div className="w-full max-w-7xl mx-auto bg-[#121214] border border-white/[0.08] hover:border-white/[0.15] rounded-3xl p-6 sm:p-7 shadow-sm transition-all">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        {/* 1. Total Workspaces */}
        <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4 first:pt-0 first:px-0">
          <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-2xl shrink-0">
            <Folder className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider font-bold">
              Total Workspaces
            </div>
            <div className="text-2xl font-bold text-white font-outfit mt-0.5">
              {total} <span className="text-xs text-zinc-400 font-mono font-normal">Active</span>
            </div>
          </div>
        </div>

        {/* 2. Verified Pipelines */}
        <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
          <div className="p-3.5 bg-white/[0.07] border border-white/15 rounded-2xl shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider font-bold">
              Verified Pipelines
            </div>
            <div className="text-2xl font-bold text-white font-outfit mt-0.5">
              {installed} <span className="text-xs text-zinc-400 font-mono font-normal">Ready</span>
            </div>
          </div>
        </div>

        {/* 3. Global Health Index */}
        <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
          <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-2xl shrink-0">
            <Award className="w-5 h-5 text-white/80" />
          </div>
          <div className="w-full">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider font-bold">
              Global Health
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-white font-outfit">{percent}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-white/80 transition-all duration-500 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Verified Tasks */}
        <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:px-4">
          <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-2xl shrink-0">
            <Activity className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider font-bold">
              Verified Tasks
            </div>
            <div className="text-2xl font-bold text-white font-outfit mt-0.5">
              {doneSteps} <span className="text-xs text-zinc-400 font-mono font-normal">/ {totalSteps}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
