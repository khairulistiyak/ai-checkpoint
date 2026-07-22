import React from 'react';
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptySelectionView({ onAddProject }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-[70vh] text-center"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary-500 blur-[80px] opacity-20 rounded-full"></div>
        <div className="w-32 h-32 bg-slate-800/40 backdrop-blur-md border border-white/[0.05] rounded-full flex items-center justify-center mb-8 relative z-10 shadow-2xl">
          <PlusCircle className="w-12 h-12 text-slate-400" />
        </div>
      </div>
      <h2 className="text-3xl font-black text-white mb-4 tracking-tight">No Project Selected</h2>
      <p className="text-slate-400 max-w-md text-lg leading-relaxed mb-10">
        Select a project from the sidebar to view its gorgeous progress tracking, or add a new one.
      </p>
      <button
        onClick={onAddProject}
        className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
      >
        <PlusCircle className="w-5 h-5" />
        Add Project
      </button>
    </motion.div>
  );
}
