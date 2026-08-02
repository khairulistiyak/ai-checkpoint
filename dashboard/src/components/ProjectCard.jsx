import React, { useState, useEffect } from 'react';
import ProgressRing from './ProgressRing';
import ExportButton from './ExportButton';
import { Terminal, FolderOpen, Settings, Trash2, ShieldCheck, ShieldX, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import * as api from '../utils/api';

export default function ProjectCard({ project, onRemove, onOpenConfig }) {
  const { progress } = project;
  const [health, setHealth] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (project.isInstalled) {
      api.fetchProjectHealth(project.id).then(setHealth).catch(() => {});
    }
  }, [project.id, project.isInstalled]);
  const overall = progress?.overall || { percentage: 0, completed: 0, total: 0 };
  const isDone = overall.percentage === 100;

  const handleCopyPath = () => {
    if (project.path && navigator.clipboard) {
      navigator.clipboard.writeText(project.path);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      className="bg-[#121214] border border-white/10 hover:border-white/20 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 transition-all shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <ProgressRing
              percentage={overall.percentage}
              color="#ffffff"
              size={42}
              strokeWidth={3.5}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-outfit truncate">
                {project.name}
              </h1>
              {isDone && (
                <span className="bg-white/10 text-white border border-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider">
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono text-white/50">
              <FolderOpen className="w-3.5 h-3.5 shrink-0 text-white/40" />
              <span className="truncate max-w-[240px] sm:max-w-md md:max-w-lg">{project.path}</span>
              <button
                onClick={handleCopyPath}
                title="Copy Workspace Path"
                className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <ExportButton project={project} />
          <button
            onClick={() => { navigator.clipboard.writeText(`cd ${project.path}`); }}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Copy cd command"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenConfig}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Edit Config"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer"
            title="Remove Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {health && (
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 font-bold mr-1">
            Checkpoints:
          </span>
          {health.checks.map(c => (
            <span key={c.name} className={`text-[11px] font-mono px-3 py-1 rounded-full border flex items-center gap-1.5 ${c.passed
              ? 'bg-white/10 text-white border-white/20 font-bold'
              : 'bg-red-500/10 text-red-400 border-red-500/20 font-bold'
            }`}>
              {c.passed ? <ShieldCheck className="w-3.5 h-3.5 text-white" /> : <ShieldX className="w-3.5 h-3.5" />}
              {c.name}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
