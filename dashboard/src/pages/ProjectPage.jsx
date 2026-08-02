import React from 'react';
import { motion } from 'framer-motion';
import ProjectGrid from '../components/ProjectGrid';
import { FolderX } from 'lucide-react';

export default function ProjectPage({
  project,
  installing,
  onRemove,
  onOpenConfig,
  onOpenPlans,
  onInstall,
  refresh,
  liveActivityEntry
}) {
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <FolderX className="w-8 h-8 text-white/40" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 font-outfit">Project Not Found</h2>
        <p className="text-white/50 text-sm max-w-sm">
          The requested project ID does not exist in this workspace. Please select a valid project from the sidebar.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar pb-2"
    >
      <ProjectGrid
        selectedProject={project}
        installing={installing}
        onRemove={onRemove}
        onOpenConfig={onOpenConfig}
        onInstall={onInstall}
        refresh={refresh}
        onOpenPlans={onOpenPlans}
        liveActivityEntry={liveActivityEntry}
      />
    </motion.div>
  );
}
