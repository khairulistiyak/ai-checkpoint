import React from 'react';
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import GlobalOverview from './GlobalOverview';

export default function EmptySelectionView({ onAddProject, projects }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center w-full px-4"
    >
      {projects && projects.length > 0 && <GlobalOverview projects={projects} />}
      <div className="relative mt-8">
        <div className="w-24 h-24 bg-[#121214] border border-white/10 rounded-3xl flex items-center justify-center mb-6 relative z-10 shadow-sm">
          <PlusCircle className="w-10 h-10 text-zinc-400" />
        </div>
      </div>
      <h2 className="text-2xl font-black text-white mb-2 tracking-tight font-outfit">
        No Project Selected
      </h2>
      <p className="text-zinc-400 max-w-md text-sm font-mono leading-relaxed mb-8">
        Select a project from the sidebar to inspect its execution ledger, or initialize a new workspace.
      </p>
      <button
        onClick={onAddProject}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ededef] hover:bg-white text-zinc-950 font-bold font-mono uppercase tracking-wider text-xs transition-all shadow-sm cursor-pointer"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Add New Project</span>
      </button>
    </motion.div>
  );
}
