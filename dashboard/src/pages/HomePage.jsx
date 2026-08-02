import React from 'react';
import { PlusCircle, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import GlobalOverview from '../components/GlobalOverview';

export default function HomePage({ projects, onAddProject }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center w-full"
    >
      {projects && projects.length > 0 && <GlobalOverview projects={projects} />}

      <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <FolderOpen className="w-8 h-8 text-white/40" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2 font-outfit tracking-tight">
        Select or Add a Project
      </h2>
      <p className="text-white/50 max-w-md text-sm leading-relaxed mb-8">
        Choose a project from the sidebar to inspect its health, check checkpoints, or manage implementation plans.
      </p>

      <button
        onClick={onAddProject}
        className="px-6 py-3 rounded-xl bg-sky-500/10 border border-sky-400/30 hover:bg-sky-500/20 text-sky-400 hover:text-white transition-all font-mono uppercase text-xs tracking-wider font-bold flex items-center gap-2"
      >
        <PlusCircle className="w-4 h-4" />
        Add New Project
      </button>
    </motion.div>
  );
}
