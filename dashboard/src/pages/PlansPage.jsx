import React from 'react';
import { motion } from 'framer-motion';
import PlansCenter from '../components/PlansCenter';
import { FileX, ArrowLeft } from 'lucide-react';

export default function PlansPage({ project, tab, onBack, onRefresh }) {
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <FileX className="w-8 h-8 text-white/40" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 font-outfit">Project Not Found</h2>
        <p className="text-white/50 text-sm max-w-sm mb-6">
          Cannot load Implementation Plans because the requested project ID was not found.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-mono uppercase tracking-wider flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <motion.div
      key={`plans-${project.id}-${tab}`}
      initial={{ opacity: 0, scale: 0.99, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.99, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="h-full w-full"
    >
      <PlansCenter
        project={project}
        initialTab={tab || 'progress'}
        onBack={onBack}
        onRefresh={onRefresh}
      />
    </motion.div>
  );
}
