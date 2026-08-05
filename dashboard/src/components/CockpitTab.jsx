import React from 'react';
import { Rocket, Target, Activity, Layers, FileText } from 'lucide-react';
import GitVisualizer from './GitVisualizer';
import ActivityLog from './ActivityLog';

export default function CockpitTab({
  selectedProject,
  overall,
  allPhases,
  activePhases,
  remaining,
  planStats,
  totalPlanSteps,
  handleOpenArchitect,
  refresh,
  liveActivityEntry
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-cyber-card/90 border border-cyber-card-border rounded-xl p-3 flex flex-col justify-between gap-1.5 shadow-sm">
          <div className="flex items-center justify-between text-cyber-text-secondary text-xs font-mono">
            <span>Completion</span>
            <div className="w-6 h-6 rounded-lg bg-cyber-accent/10 border border-cyber-accent/20 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-cyber-accent" />
            </div>
          </div>
          <div className="text-xl font-bold font-outfit text-cyber-text-primary">{overall.percentage}%</div>
          <div className="w-full bg-cyber-dark h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyber-accent to-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${overall.percentage}%` }} />
          </div>
        </div>

        <div className="bg-cyber-card/90 border border-cyber-card-border rounded-xl p-3 flex flex-col justify-between gap-1.5 shadow-sm">
          <div className="flex items-center justify-between text-cyber-text-secondary text-xs font-mono">
            <span>Steps Done</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-outfit text-cyber-text-primary">
            {overall.completed} <span className="text-xs font-mono text-cyber-text-muted">/ {overall.total}</span>
          </div>
          <div className="text-[11px] font-mono text-cyber-text-muted truncate">{remaining} steps remaining</div>
        </div>

        <div className="bg-cyber-card/90 border border-cyber-card-border rounded-xl p-3 flex flex-col justify-between gap-1.5 shadow-sm">
          <div className="flex items-center justify-between text-cyber-text-secondary text-xs font-mono">
            <span>Phases</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-outfit text-cyber-text-primary">
            {allPhases.length} <span className="text-xs font-mono text-cyber-text-muted">Total</span>
          </div>
          <div className="text-[11px] font-mono text-cyber-text-muted truncate">
            {activePhases} active • {allPhases.filter(p => p.percentage === 100).length} done
          </div>
        </div>

        <div
          onClick={() => handleOpenArchitect()}
          className="bg-cyber-card/90 border border-cyber-card-border rounded-xl p-3 flex flex-col justify-between gap-1.5 shadow-sm hover:border-cyber-accent/30 hover:bg-cyber-accent/5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-cyber-text-secondary group-hover:text-cyber-text-primary text-xs font-mono">
            <span className="flex items-center gap-1.5 font-bold">
              <span>Blueprints</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyber-accent/10 text-cyber-accent font-mono">CAD</span>
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-outfit text-cyber-text-primary">
            {planStats?.files?.length || 0} <span className="text-xs font-mono text-cyber-text-muted">Files</span>
          </div>
          <div className="text-[11px] font-mono text-cyber-text-muted group-hover:text-cyber-text-secondary truncate">
            {totalPlanSteps} planned steps • Open →
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 items-stretch">
        <div className="bg-cyber-card/90 backdrop-blur-xl border border-cyber-card-border rounded-2xl p-3.5 sm:p-4 flex flex-col shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-cyber-card-border shrink-0">
            <h2 className="text-sm font-bold text-cyber-text-primary flex items-center gap-2 font-outfit">
              <Rocket className="w-3.5 h-3.5 text-cyber-text-primary" />
              <span>Git Snapshots & Checkpoints</span>
            </h2>
            <span className="text-[10px] font-mono text-cyber-text-secondary">Live Rollback Tree</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <GitVisualizer projectId={selectedProject.id} onRefresh={refresh} />
          </div>
        </div>

        <div className="flex flex-col min-h-[400px]">
          <ActivityLog projectId={selectedProject.id} liveEntry={liveActivityEntry} />
        </div>
      </div>
    </div>
  );
}
