import React from 'react';
import { Target, CheckCircle2, Clock, FolderOpen, Zap } from 'lucide-react';

export default function MetricsStrip({ project }) {
  const progress = project?.progress;
  if (!progress || !progress.overall) return null;

  const { percentage, completed, total } = progress.overall;
  const remaining = total - completed;
  const activePhases = progress.phases
    ? progress.phases.filter((p) => p.percentage > 0 && p.percentage < 100)
        .length
    : 0;
  const planFiles = project?.planStats?.totalFiles || 0;

  return (
    <div className="px-6 py-3 bg-[#121214] border-b border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
      {/* Overall Progress Bar & Text */}
      <div className="flex items-center gap-4 min-w-[240px]">
        <div className="flex items-center gap-2 text-white font-bold">
          <Target className="w-4 h-4 text-zinc-400" />
          <span>PROGRESS</span>
          <span className="text-white">{percentage}%</span>
        </div>
        <div className="w-36 sm:w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              percentage === 100
                ? 'bg-workflow-success'
                : 'bg-workflow-running'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-zinc-400">
          {completed}/{total} Steps
        </span>
      </div>

      {/* Ergonomic Workflow Stats Pills (Eye-Comfort Muted Accents!) */}
      <div className="flex items-center gap-4 text-zinc-400">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-workflow-success" />
          <span className="text-white font-bold">{completed}</span>
          <span>Done</span>
        </div>
        <span className="text-white/20">•</span>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-workflow-running" />
          <span className="text-white font-bold">{activePhases}</span>
          <span>Active Phase{activePhases !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-white/20">•</span>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-workflow-warning" />
          <span className="text-white font-bold">{remaining}</span>
          <span>Remaining</span>
        </div>
        <span className="text-white/20">•</span>
        <div className="flex items-center gap-1.5">
          <FolderOpen className="w-3.5 h-3.5 text-workflow-ai" />
          <span className="text-white font-bold">{planFiles}</span>
          <span>Plan Files</span>
        </div>
      </div>
    </div>
  );
}
