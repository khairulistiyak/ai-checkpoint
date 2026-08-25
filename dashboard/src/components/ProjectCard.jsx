import React, { useState } from "react";
import ProgressRing from "./ProgressRing";
import ProjectCardActions from "./project/ProjectCardActions";
import { Terminal, FolderOpen, Copy, Check, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "./ToastProvider";
import { isStepActive } from "../utils/date-formatter";

export default function ProjectCard({
  project, onRemove, onOpenConfig, onOpenArchitect, onOpenIntelligence, onOpenActivityLog
}) {
  const { showToast } = useToast();
  const { progress } = project;
  const [copied, setCopied] = useState(false);
  const [copiedCd, setCopiedCd] = useState(false);

  const overall = progress?.overall || { percentage: 0, completed: 0, total: 0 };
  const hasRunningStep = Boolean(progress?.phases?.some(p => p.steps?.some(s => isStepActive(s))));
  const hasRemaining = (overall.total > 0 && overall.completed < overall.total);
  const isDone = overall.percentage === 100 && !hasRunningStep && !hasRemaining && overall.total > 0;
  const safePct = hasRemaining ? Math.min(99, overall.percentage) : overall.percentage;
  const displayPct = (hasRunningStep || hasRemaining) ? Math.min(99, safePct) : safePct;

  const intelligence = project.intelligence;
  const grade = intelligence?.grade || '?';
  const score = intelligence?.averageScore || 0;

  const handleCopyPath = () => {
    if (project.path && navigator.clipboard) {
      navigator.clipboard.writeText(project.path);
      setCopied(true);
      showToast("Project path copied!", "info");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCd = () => {
    if (project.path && navigator.clipboard) {
      navigator.clipboard.writeText(`cd "${project.path}"`);
      setCopiedCd(true);
      showToast("cd command copied to clipboard!", "info");
      setTimeout(() => setCopiedCd(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`bg-[#0b0c10]/90 backdrop-blur-xl border rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 transition-all shadow-xl relative overflow-hidden shrink-0 ${
        hasRunningStep ? 'border-amber-500/30' : 'border-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.01] rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 relative z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Frameless Radial Halo Progress Indicator */}
          <div className="relative shrink-0 flex items-center justify-center">
            <ProgressRing percentage={displayPct} size={46} strokeWidth={3.5} isRunning={hasRunningStep} />
          </div>

          {/* Project Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight font-outfit truncate">
                {project.name}
              </h1>

              {hasRunningStep ? (
                <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Working</span>
                </span>
              ) : isDone ? (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium flex items-center gap-1 shadow-sm">
                  <Check className="w-3 h-3" />
                  <span>100% Done</span>
                </span>
              ) : (
                <span className="bg-white/[0.03] text-zinc-400 border border-white/[0.06] px-2 py-0.5 rounded-md text-[11px] font-mono font-medium flex items-center gap-1 shadow-sm">
                  <Zap className="w-3 h-3 text-zinc-400" />
                  <span>In Progress</span>
                </span>
              )}

              {intelligence && (
                <span
                  className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium flex items-center gap-1 shadow-sm"
                  title={`AI Intelligence Score: ${score}/100`}
                >
                  <Award className="w-3 h-3 text-purple-400" />
                  <span>Grade {grade}</span>
                </span>
              )}

              <span className="bg-white/[0.03] text-zinc-400 border border-white/[0.06] px-2 py-0.5 rounded-md text-[11px] font-mono tabular-nums">
                {overall.completed} / {overall.total} Steps
              </span>
            </div>

            {/* Breadcrumb Path Box */}
            <div className="flex items-center gap-2 mt-1.5 text-xs font-mono text-zinc-400 flex-wrap">
              <div className="flex items-center gap-2 bg-white/[0.02] hover:bg-white/[0.04] px-2.5 py-0.5 rounded-lg border border-white/[0.06] min-w-0 max-w-full transition-colors">
                <FolderOpen className="w-3 h-3 shrink-0 text-zinc-400" />
                <span className="truncate max-w-[13.75rem] sm:max-w-xs md:max-w-md lg:max-w-lg text-[11px] text-zinc-300 font-mono">
                  {project.path}
                </span>

                <button
                  onClick={handleCopyPath}
                  title="Copy full path"
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-0.5"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>

                <div className="w-px h-3 bg-white/[0.08] shrink-0" />

                <button
                  onClick={handleCopyCd}
                  title="Copy `cd` command"
                  className="px-1.5 py-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[10px]"
                >
                  <Terminal className="w-2.5 h-2.5 text-zinc-400" />
                  <span>{copiedCd ? "copied" : "cd"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <ProjectCardActions
          onOpenConfig={onOpenConfig}
          onOpenActivityLog={onOpenActivityLog}
          onRemove={onRemove}
        />
      </div>
    </motion.div>
  );
}
