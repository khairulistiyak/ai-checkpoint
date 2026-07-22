import React, { useState, useEffect } from 'react';
import ProgressRing from './ProgressRing';
import ExportButton from './ExportButton';
import { Terminal, FolderOpen, Settings, Zap, Trash2, ShieldCheck, ShieldX } from 'lucide-react';
import { motion } from 'framer-motion';
import * as api from '../utils/api';

export default function ProjectCard({ project, onRemove, onOpenConfig }) {
  const { progress } = project;
  const [health, setHealth] = useState(null);

  useEffect(() => {
    if (project.isInstalled) {
      api.fetchProjectHealth(project.id).then(setHealth).catch(() => {});
    }
  }, [project.id, project.isInstalled]);
  const overall = progress?.overall || { percentage: 0, completed: 0, total: 0 };
  const isDone = overall.percentage === 100;

  return (
    <motion.div
      className="glass-card p-6 flex flex-col md:flex-row gap-6 items-start"
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
              {isDone && <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.2)]">Done</span>}
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1.5">
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">{project.path}</span>
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <ExportButton project={project} />
            <button onClick={() => { navigator.clipboard.writeText(`cd ${project.path}`); }} className="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-slate-300 transition-all border border-white/[0.05]" title="Copy cd command">
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

        {health && (
          <div className="flex items-center gap-2 flex-wrap">
            {health.checks.map(c => (
              <span key={c.name} className={`text-[10px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 ${c.passed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {c.passed ? <ShieldCheck className="w-3 h-3" /> : <ShieldX className="w-3 h-3" />}
                {c.name}
              </span>
            ))}
          </div>
        )}

      </div>
    </motion.div>
  );
}
