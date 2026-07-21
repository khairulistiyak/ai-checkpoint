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
      className="bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
        <ProgressRing
          percentage={overall.percentage}
          color="#ffffff"
          size={40}
          strokeWidth={4}
        />
      </div>

      <div className="flex-1 w-full space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-semibold text-white tracking-tight">{project.name}</h2>
              {isDone && <span className="bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">Done</span>}
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1.5">
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">{project.path}</span>
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <ExportButton project={project} />
            <button className="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-slate-300 transition-all border border-white/[0.05]" title="Open in Terminal">
              <Terminal className="w-4 h-4" />
            </button>
            <button onClick={onOpenConfig} className="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-slate-300 transition-all border border-white/[0.05]" title="Edit Config">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={onRemove} className="p-2.5 bg-white/[0.05] hover:bg-red-500/20 hover:text-red-400 rounded-xl text-slate-300 transition-all border border-white/[0.05]" title="Remove Project">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Steps</div>
            <div className="text-2xl font-black text-white">{overall.total}</div>
          </div>
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Completed</div>
            <div className="text-2xl font-black text-white">{overall.completed}</div>
          </div>
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Pending</div>
            <div className="text-2xl font-black text-white">{overall.total - overall.completed}</div>
          </div>
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Phases</div>
            <div className="text-2xl font-black text-white">{progress?.phases?.length || 0}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
