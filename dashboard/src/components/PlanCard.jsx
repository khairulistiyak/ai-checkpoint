import React from 'react';
import { FileText, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlanCard({ project, onOpenPlan }) {
  const getCreatedDateStr = () => {
    const files = project.planStats?.files;
    if (!files || files.length === 0) return '';
    const dates = files
      .map((f) => (f.createdAt ? new Date(f.createdAt).getTime() : Infinity))
      .filter((t) => t !== Infinity);
    if (dates.length === 0) return '';
    const earliest = new Date(Math.min(...dates));
    return earliest.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onOpenPlan}
      className="relative p-6 cursor-pointer group flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#121214] hover:bg-[#16171c] hover:border-white/20 transition-all duration-300 overflow-hidden h-full flex-1 shadow-lg"
    >
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/10 group-hover:bg-white/[0.08] group-hover:border-white/20 transition-colors">
              <FileText className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-white font-outfit tracking-tight">
              Implementation Plan
            </span>
          </h2>
          <div className="w-7 h-7 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:bg-white/[0.08] group-hover:border-white/20 transition-all duration-300 group-hover:translate-x-0.5">
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-6 group-hover:text-zinc-300 transition-colors">
          View step-by-step architectural plans, track phase progress, and
          execute atomic step checklists.
        </p>

        <div className="mt-auto pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider select-none">
              {project.planStats?.totalFiles || 0} Plans ·{' '}
              {project.planStats?.totalSteps || 0} Steps
            </div>
            {getCreatedDateStr() && (
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                <Calendar className="w-3 h-3 text-zinc-500" />
                <span>Created: {getCreatedDateStr()}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/20 group-hover:bg-white text-[10px] font-bold text-white group-hover:text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-1 transition-all duration-300 pointer-events-none"
          >
            <span>Open Plan</span>
            <span className="text-[11px] transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
