import React from 'react';
import ProjectCard from './ProjectCard';
import GitVisualizer from './GitVisualizer';
import NotInitializedView from './NotInitializedView';
import { Rocket, Sparkles, Target, Activity, Zap, Layers, FileText, ArrowRight } from 'lucide-react';
import ActivityLog from './ActivityLog';
import { motion } from 'framer-motion';

export default function ProjectGrid({
  selectedProject,
  loading,
  installing,
  onRemove,
  onOpenConfig,
  onOpenPlans,
  onInstall,
  refresh,
  liveActivityEntry,
}) {
  if (loading || !selectedProject) {
    return (
      <div className="flex flex-col gap-4 min-h-full animate-pulse">
        <div className="h-32 bg-white/5 rounded-3xl border border-white/10" />
        <div className="h-24 bg-white/5 rounded-3xl border border-white/10" />
        <div className="flex-1 min-h-[350px] bg-white/5 rounded-3xl border border-white/10" />
      </div>
    );
  }

  const { progress } = selectedProject;
  const overall = progress?.overall || { percentage: 0, completed: 0, total: 0 };
  const remaining = Math.max(0, overall.total - overall.completed);
  const activePhases = progress?.phases ? progress.phases.filter((p) => p.percentage > 0 && p.percentage < 100).length : 0;
  const totalPlanSteps = selectedProject?.planStats?.totalSteps || 0;
  const plannedSteps = Math.max(0, totalPlanSteps - overall.total);

  const metrics = [
    { label: 'Completion', value: `${overall.percentage}%`, icon: Target },
    { label: 'Steps Done', value: overall.completed, icon: Activity },
    { label: 'Remaining', value: remaining, icon: Zap },
    { label: 'Active Phases', value: activePhases, icon: Layers },
    { label: 'Planned Steps', value: plannedSteps, icon: FileText },
  ];

  return (
    <div className="flex flex-col gap-4 min-h-full w-full">
      {/* 1. Full-Width Executive Workspace Header */}
      <ProjectCard
        project={selectedProject}
        onRemove={onRemove}
        onOpenConfig={onOpenConfig}
      />

      {selectedProject.isInstalled ? (
        <>
          {/* 2. Compact Executive Control & Metrics Ribbon (No excessive gaps!) */}
          <div className="bg-[#121214] border border-white/10 rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 shadow-sm">
            {/* Left: Compact Segmented Metrics Control Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1">
              {metrics.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.label}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 min-w-0"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg sm:text-xl font-bold text-white font-outfit tracking-tight truncate">
                        {m.value}
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/50 truncate">
                        {m.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Architectural Plan Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 lg:border-l lg:border-white/10 lg:pl-6">
              <button
                onClick={() => onOpenPlans('progress')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition-all text-xs font-mono uppercase tracking-wider cursor-pointer shadow-sm"
              >
                <span>Open Plans & Execution</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenPlans('generate')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all text-xs font-mono uppercase tracking-wider font-bold cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>+ Generate Plan</span>
              </button>
            </div>
          </div>

          {/* 3. Full-Height Git Checkpoint Log (Seamless Studio Console) */}
          <div className="flex-1 min-h-[420px] flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
              className="bg-[#121214] border border-white/10 rounded-3xl p-6 relative flex flex-col flex-1 group overflow-hidden transition-all shadow-md"
            >
              <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10 relative z-10">
                <h2 className="text-base font-bold text-white flex items-center gap-2.5 font-outfit">
                  <Rocket className="w-4 h-4 text-white" />
                  <span>Git History & Checkpoints</span>
                </h2>
                <span className="text-xs font-mono text-white/50">
                  Live Snapshot Stream
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 relative z-10">
                <GitVisualizer projectId={selectedProject.id} onRefresh={refresh} />
              </div>
            </motion.div>
          </div>

          {/* 4. Activity Log Panel */}
          <ActivityLog projectId={selectedProject.id} liveEntry={liveActivityEntry} />
        </>
      ) : (
        <NotInitializedView installing={installing} onInstall={onInstall} onRemove={onRemove} />
      )}
    </div>
  );
}
