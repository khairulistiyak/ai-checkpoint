import React from 'react';
import ProjectCard from './ProjectCard';
import PlanCard from './PlanCard';
import MetricsDashboard from './MetricsDashboard';
import GitVisualizer from './GitVisualizer';
import NotInitializedView from './NotInitializedView';
import { Rocket, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ProjectGrid renders the primary workspace for a selected project.
 * Clicking PlanCard or Generate Plan calls onOpenPlans(tab), which triggers Hash Route navigation.
 */
export default function ProjectGrid({ selectedProject, loading, installing, onRemove, onOpenConfig, onOpenPlans, onInstall, refresh }) {
  if (loading || !selectedProject) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 min-h-full auto-rows-max animate-pulse">
        <div className="lg:col-span-7 xl:col-span-8 h-48 bg-white/5 rounded-2xl border border-white/10" />
        <div className="lg:col-span-5 xl:col-span-4 h-48 bg-white/5 rounded-2xl border border-white/10" />
        <div className="lg:col-span-12 h-64 bg-white/5 rounded-2xl border border-white/10" />
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
            <PlanCard project={selectedProject} onOpenPlan={() => onOpenPlans('progress')} />
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenPlans('generate')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-sky-400/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-white transition-all text-xs font-bold font-mono tracking-wider uppercase cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              Generate Plan
            </motion.button>
          </div>
          <div className="lg:col-span-12 xl:col-span-12 flex flex-col">
            <MetricsDashboard progress={selectedProject.progress} project={selectedProject} />
          </div>
          <div className="lg:col-span-12 xl:col-span-12 flex flex-col min-h-[350px] xl:min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
              className="bg-[#0c101a] border border-white/10 hover:border-white/20 rounded-2xl p-6 relative flex flex-col flex-1 group overflow-hidden transition-all"
            >
              <h2 className="text-base font-bold text-white flex items-center gap-3 mb-4 relative z-10 font-outfit">
                <Rocket className="w-4 h-4 text-sky-400" /> Git History & Checkpoints
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
