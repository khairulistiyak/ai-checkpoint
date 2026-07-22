import React from 'react';
import { Rocket, Loader2, PlaySquare, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotInitializedView({ installing, onInstall, onRemove }) {
  return (
    <div className="xl:col-span-12 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-16 text-center glass-card border-dashed border-white/20"
      >
        <div className="w-20 h-20 bg-slate-800/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <Rocket className="w-10 h-10 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-200 mb-3 text-glow">Project Not Initialized</h2>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
          This directory doesn't have an initialized ai-checkpoint structure.
          You can initialize it right here to start tracking progress.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onInstall}
            disabled={installing}
            className="btn-primary flex items-center gap-2 text-sm px-6 py-2"
          >
            {installing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlaySquare className="w-4 h-4" />}
            Initialize Project Here
          </button>
          <button
            onClick={onRemove}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 px-4 py-2 rounded-xl transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" /> Remove
          </button>
        </div>
      </motion.div>
    </div>
  );
}
