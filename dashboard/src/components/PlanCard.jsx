import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlanCard({ project, onOpenPlan }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onOpenPlan}
      className="glass-card p-6 cursor-pointer group flex flex-col shadow-lg overflow-hidden border-white/[0.05] hover:border-accent-500/50 h-full flex-1"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
      <motion.div
        className="absolute -right-10 -top-10 w-32 h-32 bg-accent-500/20 blur-[40px] rounded-full group-hover:bg-accent-500/30 transition-colors"
      />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-lg font-bold text-white flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <FileText className="w-4 h-4 text-accent-400 group-hover:text-accent-300 transition-colors drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" />
          </motion.div>
          Implementation Plan
        </h2>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-all group-hover:translate-x-2" />
      </div>

      <p className="text-xs text-slate-400 mb-6 flex-1 relative z-10 leading-relaxed group-hover:text-slate-300 transition-colors">
        View the detailed step-by-step implementation plan, track current phase progress, and mark tasks as complete.
      </p>

      <div className="flex items-center justify-between mt-auto relative z-10 pt-4 border-t border-white/[0.05] group-hover:border-accent-500/30 transition-colors">
        <span className="text-xs font-mono text-slate-500 group-hover:text-accent-400/70 transition-colors">
          {project.progress?.phases?.length || 0} Phases
        </span>
        <motion.button
          whileHover={{ x: 2 }}
          className="text-[10px] font-bold text-accent-400 group-hover:text-accent-300 uppercase tracking-wider font-mono flex items-center gap-1"
        >
          Open Plan <span className="text-[14px]">→</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
