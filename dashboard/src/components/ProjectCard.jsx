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
    <div className="glass-card p-8 flex flex-col md:flex-row gap-10 items-center md:items-start group border-t-2 border-t-accent-500/30">
      <div className="flex-shrink-0 relative">
        <div className="absolute inset-0 bg-accent-500/20 blur-2xl rounded-full scale-110 group-hover:bg-accent-500/30 transition-colors"></div>
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
                <stop offset="100%" stopColor="#D946EF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      <div className="flex-1 space-y-6 w-full">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight break-all">{project.name}</h2>
              {isDone && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded-full text-xs font-bold uppercase shrink-0">Complete</span>}
            </div>
            <p className="text-sm text-slate-400 flex items-center gap-2 mt-2 group-hover:text-slate-300 transition-colors break-all">
              <FolderOpen className="w-4 h-4 text-accent-400 shrink-0" />
              <span className="font-mono text-xs bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700/50">{project.path}</span>
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <ExportButton project={project} />
            <button className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-slate-300 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-slate-600" title="Open in Terminal">
              <Terminal className="w-5 h-5" />
            </button>
            <button onClick={onOpenConfig} className="p-2.5 bg-primary-600/20 hover:bg-primary-600/40 rounded-xl text-primary-300 transition-all border border-primary-500/30 hover:border-primary-500/60" title="Edit Config">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={onRemove} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-all border border-red-500/20 hover:border-red-500/50" title="Remove Project">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <motion.div whileHover={{ y: -2 }} className="bg-slate-900/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 shadow-inner group/stat">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover/stat:text-slate-300 transition-colors">Total Steps</div>
            <div className="text-3xl font-black text-white">{overall.total}</div>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} className="bg-slate-900/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 shadow-inner group/stat">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover/stat:text-emerald-400 transition-colors">Completed</div>
            <div className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">{overall.completed}</div>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} className="bg-slate-900/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 shadow-inner group/stat">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover/stat:text-amber-400 transition-colors">Pending</div>
            <div className="text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">{overall.total - overall.completed}</div>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} className="bg-slate-900/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 shadow-inner group/stat">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover/stat:text-accent-400 transition-colors">Phases</div>
            <div className="text-3xl font-black text-accent-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">{progress?.phases?.length || 0}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
