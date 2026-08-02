import React from 'react';
import { Rocket, Loader2, PlaySquare, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotInitializedView({ installing, onInstall, onRemove }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#121214] border border-white/10 rounded-3xl p-10 text-center shadow-md flex flex-col items-center justify-center space-y-6"
      >
        <div className="w-16 h-16 bg-white/5 border border-white/15 rounded-2xl flex items-center justify-center">
          <Rocket className="w-8 h-8 text-white/60" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white font-outfit tracking-tight">
            Workspace Not Initialized
          </h2>
          <p className="text-xs font-mono text-white/50 max-w-md mx-auto leading-relaxed">
            This directory does not yet contain an active AI-Checkpoint structure. Initialize it below to start tracking step-by-step progress.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onInstall}
            disabled={installing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all text-xs font-mono font-bold uppercase tracking-wider shadow-sm cursor-pointer"
          >
            {installing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlaySquare className="w-4 h-4" />}
            <span>Initialize Workspace</span>
          </button>
          <button
            onClick={onRemove}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all text-xs font-mono uppercase tracking-wider cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
