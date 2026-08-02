import React, { useState } from 'react';
import { Folder, ArrowRight, CheckCircle2, AlertCircle, Cpu, Copy, Check } from 'lucide-react';
import { useHashRoute } from '../../hooks/useHashRoute';

export default function HomeProjectCard({ project }) {
  const { navigate } = useHashRoute();
  const [copied, setCopied] = useState(false);

  let totalSteps = 0;
  let doneSteps = 0;

  if (project.isInstalled && project.progress && project.progress.overall) {
    totalSteps = project.progress.overall.total || 0;
    doneSteps = project.progress.overall.completed || 0;
  }

  const percent = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);

  const handleOpenProject = () => {
    navigate(`#/project/${project.id}`);
  };

  const handleOpenPlans = (e) => {
    e.stopPropagation();
    navigate(`#/project/${project.id}/plans/progress`);
  };

  const handleCopyPath = (e) => {
    e.stopPropagation();
    if (project.path && navigator.clipboard) {
      navigator.clipboard.writeText(project.path);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={handleOpenProject}
      className="bg-[#121214] hover:bg-[#161619] border border-white/10 hover:border-white/30 rounded-3xl p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer group text-left relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/15 text-white group-hover:bg-white/10 transition-colors shrink-0">
            <Folder className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white font-outfit tracking-tight truncate">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs font-mono text-white/50 truncate" title={project.path}>
                {project.path}
              </p>
              <button
                onClick={handleCopyPath}
                title="Copy Workspace Path"
                className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {project.isInstalled ? (
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              VERIFIED
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 font-mono text-[10px] font-bold uppercase tracking-wider">
              PENDING
            </span>
          )}
        </div>
      </div>

      {/* Health & Verification Section */}
      <div className="py-1">
        {project.isInstalled ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white/70 uppercase tracking-wider font-bold">
                Health Index
              </span>
              <span className="text-white font-bold">
                {percent}% <span className="text-white/40">({doneSteps}/{totalSteps})</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white/60 font-mono">
            <AlertCircle className="w-4 h-4 text-white/50 shrink-0" />
            <span>Workspace ready for AI agent setup & checkpoints.</span>
          </div>
        )}
      </div>

      {/* Action Footbar */}
      <div className="flex items-center gap-2.5 pt-2 border-t border-white/10">
        <button
          onClick={handleOpenProject}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition-all text-xs font-mono uppercase tracking-wider shadow-sm cursor-pointer"
        >
          <span>Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {project.isInstalled && (
          <button
            onClick={handleOpenPlans}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all text-xs font-mono uppercase tracking-wider cursor-pointer"
            title="Open Plans & Execution"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Plans</span>
          </button>
        )}
      </div>
    </div>
  );
}
