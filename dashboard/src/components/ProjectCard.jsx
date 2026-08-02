import React, { useState, useEffect } from 'react';
import ProgressRing from './ProgressRing';
import ExportButton from './ExportButton';
import { Terminal, FolderOpen, Settings, Trash2, ShieldCheck, ShieldX } from 'lucide-react';
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
      className="bg-[#0c101a] border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start transition-all"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        <ProgressRing
          percentage={overall.percentage}
          color="#38bdf8"
          size={44}
          strokeWidth={4}
        />
      </div>

      <div className="flex-1 w-full space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight font-outfit">{project.name}</h2>
              {isDone && (
                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold tracking-wider">
                  Done
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 flex items-center gap-2 mt-1.5">
              <FolderOpen className="w-3.5 h-3.5 shrink-0 text-white/40" />
              <span className="font-mono text-xs break-all sm:break-normal truncate block max-w-[200px] sm:max-w-md md:max-w-lg lg:max-w-xl">{project.path}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            <ExportButton project={project} />
            <button
              onClick={() => { navigator.clipboard.writeText(`cd ${project.path}`); }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
              title="Copy cd command"
            >
              <Terminal className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenConfig}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
              title="Edit Config"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onRemove}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all"
              title="Remove Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {health && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {health.checks.map(c => (
              <span key={c.name} className={`text-[10px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${c.passed
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
