import React, { useState } from "react";
import ProgressRing from "./ProgressRing";
import ProjectCardActions from "./project/ProjectCardActions";
import { Terminal, FolderOpen, Copy, Check, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "./ToastProvider";

export default function ProjectCard({
  project,
  onRemove,
  onOpenConfig,
  onOpenArchitect,
  onOpenIntelligence,
  onOpenActivityLog,
}) {
  const { showToast } = useToast();
  const { progress } = project;
  const [copied, setCopied] = useState(false);
  const [copiedCd, setCopiedCd] = useState(false);

  const overall = progress?.overall || { percentage: 0, completed: 0, total: 0 };
  const isDone = overall.percentage === 100;
  
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

  const handleQuickCheckpoint = () => {
    if (navigator.clipboard) {
      const msg = `checkpoint: ${new Date().toISOString().replace("T", " ").slice(0, 16)}`;
      navigator.clipboard.writeText(`./l cp save "${msg}"`);
      showToast("Copied: ./l cp save command", "success");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-[#0e0e11]/90 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-4 flex flex-col gap-3 transition-all shadow-xl relative overflow-hidden shrink-0"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/15 flex items-center justify-center shadow-lg relative group backdrop-blur-md">
              <ProgressRing percentage={overall.percentage} size={36} strokeWidth={3.5} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-sm" title="Live File Watcher Active">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight font-outfit truncate">{project.name}</h1>
              
              {isDone ? (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm">
                  <Check className="w-3 h-3" />
                  <span>100% Done</span>
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>In Progress</span>
                </span>
              )}

              {intelligence && (
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm" title={`AI Intelligence Score: ${score}/100`}>
                  <span>🥇</span>
                  <span>{grade}</span>
                </span>
              )}

              <span className="bg-white/[0.04] text-zinc-300 border border-white/10 px-2.5 py-0.5 rounded-full text-xs font-mono">
                {overall.completed} / {overall.total} Steps
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1.5 text-xs font-mono text-zinc-400 flex-wrap">
              <div className="flex items-center gap-2 bg-black/50 px-2.5 py-1 rounded-lg border border-white/10 min-w-0 max-w-full">
                <FolderOpen className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                <span className="truncate max-w-[13.75rem] sm:max-w-xs md:max-w-md lg:max-w-lg text-xs text-zinc-300 font-mono">{project.path}</span>
                
                <button
                  onClick={handleCopyPath}
                  title="Copy full path"
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-0.5"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>

                <div className="w-px h-3 bg-white/10 shrink-0" />

                <button
                  onClick={handleCopyCd}
                  title="Copy `cd` command"
                  className="px-1.5 py-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Terminal className="w-3 h-3 text-zinc-400" />
                  <span>{copiedCd ? "copied" : "cd"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <ProjectCardActions
          onOpenConfig={onOpenConfig}
          onOpenActivityLog={onOpenActivityLog}
          onRemove={onRemove}
        />
      </div>
    </motion.div>
  );
}
