import React from 'react';
import { FileText, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlanCard({ project, onOpenPlan }) {
  const getCreatedDateStr = () => {
    const files = project.planStats?.files;
    if (!files || files.length === 0) return '';
    const dates = files.map(f => f.createdAt ? new Date(f.createdAt).getTime() : Infinity).filter(t => t !== Infinity);
    if (dates.length === 0) return '';
    const earliest = new Date(Math.min(...dates));
    return earliest.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onOpenPlan}
      className="relative p-6 cursor-pointer group flex flex-col justify-between rounded-2xl border border-white/[0.05] bg-slate-900/20 backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 overflow-hidden h-full flex-1"
    >
      {/* Subtle Background Glows (very low opacity) */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />

      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.02] rounded-full blur-[40px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/[0.08] group-hover:bg-white/[0.06] group-hover:border-white/[0.15] transition-colors">
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
            </div>
            <span className="text-slate-200 group-hover:text-white transition-colors duration-350">
              Implementation Plan
            </span>
          </h2>
          <div className="w-7 h-7 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.06] group-hover:border-white/[0.12] transition-all duration-350 group-hover:translate-x-1">
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed mb-6 group-hover:text-slate-300 transition-colors duration-350">
          View the detailed step-by-step implementation plan, track current phase progress, and mark tasks as complete.
        </p>

        {/* Info & Footer */}
        <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-slate-400 select-none">
              {project.planStats?.totalFiles || 0} Plans · {project.planStats?.totalSteps || 0} Steps
            </div>
            {getCreatedDateStr() && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Created: {getCreatedDateStr()}</span>
              </div>
            )}
          </div>
          <button className="px-3.5 py-1.5 rounded-lg bg-sky-500/10 border border-sky-400/20 group-hover:bg-sky-500/20 group-hover:border-sky-400/40 text-[10px] font-bold text-sky-400 group-hover:text-white uppercase tracking-wider font-mono flex items-center gap-1 transition-all duration-300 pointer-events-none">
            Open Plan <span className="text-[11px] transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
