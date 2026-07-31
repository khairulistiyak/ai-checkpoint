import React from 'react';
import ProjectCard from './ProjectCard';
import PlanCard from './PlanCard';
import MetricsDashboard from './MetricsDashboard';
import GitVisualizer from './GitVisualizer';
import NotInitializedView from './NotInitializedView';
import { Rocket, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectGrid({ selectedProject, loading, installing, onRemove, onOpenConfig, onOpenPlan, onGeneratePlan, onInstall, refresh }) {
  if (loading || !selectedProject) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-h-full auto-rows-max animate-pulse">
        <div className="lg:col-span-7 xl:col-span-8 h-48 bg-slate-800/40 rounded-2xl border border-white/[0.05]" />
        <div className="lg:col-span-5 xl:col-span-4 h-48 bg-slate-800/40 rounded-2xl border border-white/[0.05]" />
        <div className="lg:col-span-12 h-64 bg-slate-800/40 rounded-2xl border border-white/[0.05]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-h-full auto-rows-max">
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
        <ProjectCard project={selectedProject} onRemove={onRemove} onOpenConfig={onOpenConfig} />
      </div>
      {selectedProject.isInstalled ? (
        <>
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 h-full">
            <PlanCard project={selectedProject} onOpenPlan={onOpenPlan} />
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGeneratePlan}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-accent-500/30 bg-accent-500/10 hover:bg-accent-500/20 text-accent-300 hover:text-white transition-all text-xs font-bold font-mono tracking-wider uppercase shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-accent-400 group-hover:text-accent-300" />
              Generate Plan
            </motion.button>
          </div>
          <div className="lg:col-span-12 xl:col-span-12 flex flex-col">
            <MetricsDashboard progress={selectedProject.progress} project={selectedProject} />
          </div>
          <div className="lg:col-span-12 xl:col-span-12 flex flex-col min-h-[350px] xl:min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="glass-card p-6 relative flex flex-col flex-1 group overflow-hidden border-white/[0.05] hover:border-primary-500/50"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-3 mb-4 relative z-10">
                <Rocket className="w-4 h-4 text-indigo-400" /> Git History
              </h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 relative z-10">
                <GitVisualizer projectId={selectedProject.id} onRefresh={refresh} />
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <NotInitializedView installing={installing} onInstall={onInstall} onRemove={onRemove} />
      )}
    </div>
  );
}
