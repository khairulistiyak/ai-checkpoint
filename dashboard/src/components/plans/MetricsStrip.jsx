import React from 'react';
import { Target, CheckCircle2, Clock, FolderOpen, Zap } from 'lucide-react';

export default function MetricsStrip({ project }) {
  const progress = project?.progress;
  if (!progress || !progress.overall) return null;

  const { percentage, completed, total } = progress.overall;
  const remaining = total - completed;
  const activePhases = progress.phases ? progress.phases.filter(p => p.percentage > 0 && p.percentage < 100).length : 0;
  const planFiles = project?.planStats?.totalFiles || 0;

  return (
    <div className="px-6 py-2.5 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
      {/* Overall Progress Bar & Text */}
      <div className="flex items-center gap-4 min-w-[240px]">
        <div className="flex items-center gap-2 text-cyber-text-primary font-bold">
          <Target className="w-4 h-4 text-cyber-accent" />
          <span>PROGRESS</span>
          <span className="text-cyber-accent">{percentage}%</span>
        </div>
        <div className="w-36 sm:w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-700" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-cyber-text-secondary">
          {completed}/{total} Steps
        </span>
      </div>

      {/* Clean Compact Stats Pills */}
      <div className="flex items-center gap-4 text-cyber-text-secondary">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-white font-medium">{completed}</span>
          <span>Done</span>
        </div>
        <span className="text-white/20">•</span>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-white font-medium">{activePhases}</span>
          <span>Active Phase{activePhases !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-white/20">•</span>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-white font-medium">{remaining}</span>
          <span>Remaining</span>
        </div>
        <span className="text-white/20">•</span>
        <div className="flex items-center gap-1.5">
          <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-white font-medium">{planFiles}</span>
          <span>Plan Files</span>
        </div>
      </div>
    </div>
  );
}
