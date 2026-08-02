import React, { useState } from 'react';
import {
  Folder,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Copy,
  Check,
} from 'lucide-react';
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

  const percent =
    totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);

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
      className="bg-[#121214] hover:bg-[#16171c] border border-white/[0.08] hover:border-white/20 rounded-3xl p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer group text-left relative overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white group-hover:bg-white/[0.08] transition-colors shrink-0">
            <Folder className="w-5 h-5 text-white/80" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white font-outfit tracking-tight truncate">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p
                className="text-xs font-mono text-zinc-500 truncate"
                title={project.path}
              >
                {project.path}
              </p>
              <button
                onClick={handleCopyPath}
                title="Copy Workspace Path"
                className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors shrink-0 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-workflow-success" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {project.isInstalled ? (
            <span className="px-3 py-1 rounded-full bg-workflow-success/10 border border-workflow-success/25 text-workflow-success font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-workflow-success" />
              VERIFIED
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-wider">
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
              <span className="text-zinc-400 uppercase tracking-wider font-bold">
                Health Index
              </span>
              <span className="text-white font-bold">
                {percent}%{' '}
                <span className="text-zinc-500">
                  ({doneSteps}/{totalSteps})
                </span>
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  percent === 100
                    ? 'bg-workflow-success'
                    : 'bg-workflow-running'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <AlertCircle className="w-4 h-4 text-workflow-warning shrink-0" />
            <span className="text-xs font-mono text-zinc-400">
              Not initialized. Click to initialize AI Checkpoint.
            </span>
          </div>
        )}
      </div>

      {/* Footer Action Strip */}
      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
          <Cpu className="w-3.5 h-3.5 text-workflow-ai" />
          <span>Workspace Environment</span>
        </div>
        <div className="flex items-center gap-2">
          {project.isInstalled && (
            <button
              onClick={handleOpenPlans}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-zinc-300 hover:text-white border border-white/10 transition-all text-[11px] font-bold"
            >
              Plans
            </button>
          )}
          <span className="flex items-center gap-1 text-zinc-400 group-hover:text-white transition-colors font-bold">
            <span>Open</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}
