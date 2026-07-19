import React from 'react';
import ProgressRing from './ProgressRing';
import ExportButton from './ExportButton';
import { Terminal, FolderOpen, Settings, Zap, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectCard({ project, onRemove, onOpenConfig }) {
  const { progress } = project;
  const overall = progress?.overall || { percentage: 0, completed: 0, total: 0 };
  const isDone = overall.percentage === 100;

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-[#0a0f1c]/70 backdrop-blur-xl border border-white/[0.05] hover:border-purple-500/50 rounded-2xl p-8 flex flex-col md:flex-row gap-10 items-center md:items-start group relative overflow-hidden shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)] transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex-shrink-0 relative z-10">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full scale-110 group-hover:bg-purple-500/40 transition-colors"
        ></motion.div>
        <div className="relative">
          <ProgressRing
            percentage={overall.percentage}
            color={isDone ? '#10B981' : 'url(#progress-gradient)'}
            size={160}
            strokeWidth={12}
          />
          {/* Gradient definition for SVG */}
          <svg width="0" height="0">
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="flex-1 space-y-6 w-full relative z-10">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight break-all">{project.name}</h2>
              {isDone && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-xs font-bold uppercase shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">Complete</span>}
            </div>
            <p className="text-sm text-slate-400 flex items-center gap-2 mt-2 group-hover:text-slate-300 transition-colors break-all">
              <FolderOpen className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="font-mono text-xs bg-white/[0.03] px-2 py-1 rounded border border-white/[0.05]">{project.path}</span>
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <ExportButton project={project} />
            <motion.button whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }} className="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-slate-300 transition-all border border-white/[0.05]" title="Open in Terminal">
              <Terminal className="w-5 h-5" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onOpenConfig} className="p-2.5 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl text-purple-400 transition-all border border-purple-500/30" title="Edit Config">
              <Settings className="w-5 h-5" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }} onClick={onRemove} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-all border border-red-500/20 hover:border-red-500/50" title="Remove Project">
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <motion.div whileHover={{ y: -4, scale: 1.05 }} className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05] group/stat hover:border-white/[0.1] transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover/stat:text-slate-300 transition-colors relative z-10">Total Steps</div>
            <div className="text-3xl font-black text-white relative z-10">{overall.total}</div>
          </motion.div>
          <motion.div whileHover={{ y: -4, scale: 1.05 }} className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05] group/stat hover:border-emerald-500/30 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover/stat:text-emerald-400 transition-colors relative z-10">Completed</div>
            <div className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] relative z-10">{overall.completed}</div>
          </motion.div>
          <motion.div whileHover={{ y: -4, scale: 1.05 }} className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05] group/stat hover:border-amber-500/30 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover/stat:text-amber-400 transition-colors relative z-10">Pending</div>
            <div className="text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] relative z-10">{overall.total - overall.completed}</div>
          </motion.div>
          <motion.div whileHover={{ y: -4, scale: 1.05 }} className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05] group/stat hover:border-purple-500/30 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity"></div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover/stat:text-purple-400 transition-colors relative z-10">Phases</div>
            <div className="text-3xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)] relative z-10">{progress?.phases?.length || 0}</div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
