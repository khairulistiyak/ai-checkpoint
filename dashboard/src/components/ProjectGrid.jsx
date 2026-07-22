import React from 'react';
import ProjectCard from './ProjectCard';
import PlanCard from './PlanCard';
import MetricsDashboard from './MetricsDashboard';
import GitVisualizer from './GitVisualizer';
import NotInitializedView from './NotInitializedView';
import { Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectGrid({ selectedProject, installing, onRemove, onOpenConfig, onOpenPlan, onInstall, refresh }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 min-h-full auto-rows-max">
      <div className="xl:col-span-8 flex flex-col">
        <ProjectCard project={selectedProject} onRemove={onRemove} onOpenConfig={onOpenConfig} />
      </div>
      {selectedProject.isInstalled ? (
        <>
          <div className="xl:col-span-4 flex flex-col h-full">
            <PlanCard project={selectedProject} onOpenPlan={onOpenPlan} />
          </div>
          <div className="xl:col-span-12 flex flex-col">
            <MetricsDashboard progress={selectedProject.progress} />
          </div>
          <div className="xl:col-span-12 flex flex-col min-h-[350px] xl:min-h-[400px]">
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
