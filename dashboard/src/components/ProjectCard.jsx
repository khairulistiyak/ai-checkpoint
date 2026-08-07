import React, { useState, useEffect } from "react";
import ProgressRing from "./ProgressRing";
import ProjectCardStats from "./project/ProjectCardStats";
import ProjectCardActions from "./project/ProjectCardActions";
import { Terminal, FolderOpen, ShieldCheck, Copy, Check, Zap } from "lucide-react";
import { motion } from "framer-motion";
import * as api from "../utils/api";
import { useToast } from "./ToastProvider";

export default function ProjectCard({
  project,
  onRemove,
  onOpenConfig,
  onOpenArchitect,
}) {
  const { showToast } = useToast();
  const { progress } = project;
  const [health, setHealth] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedCd, setCopiedCd] = useState(false);
  const [showAuditDetails, setShowAuditDetails] = useState(false);

  useEffect(() => {
    if (project.isInstalled) {
      api.fetchProjectHealth(project.id).then(setHealth).catch(() => {});
    }
  }, [project.id, project.isInstalled]);

  const overall = progress?.overall || { percentage: 0, completed: 0, total: 0 };
  const isDone = overall.percentage === 100;
  const passedChecks = health?.checks?.filter((c) => c.passed).length || 0;
  const totalChecks = health?.checks?.length || 0;
  const allPassed = totalChecks > 0 && passedChecks === totalChecks;

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
      className="bg-[#121215]/95 backdrop-blur-xl border border-white/10 hover:border-white/15 rounded-xl p-3 sm:p-3.5 flex flex-col gap-2 transition-all shadow-md relative overflow-hidden shrink-0"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.015] rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/15 flex items-center justify-center shadow-inner relative group">
              <ProgressRing percentage={overall.percentage} color="#ffffff" size={30} strokeWidth={3} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center" title="Live File Watcher Active">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute w-1 h-1 rounded-full bg-emerald-400" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-cyber-text-primary tracking-tight font-outfit truncate">{project.name}</h1>
              {isDone ? (
                <span className="bg-workflow-success/10 text-workflow-success border border-workflow-success/20 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                  <Check className="w-2.5 h-2.5" /><span>100% Done</span>
                </span>
              ) : (
                <span className="bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/20 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(var(--cyber-accent-rgb),0.2)]">
                  <Zap className="w-2.5 h-2.5" /><span>Active</span>
                </span>
              )}
              <span className="bg-cyber-card-border text-cyber-text-secondary border border-cyber-card-border px-2 py-0.5 rounded-md text-[10px] font-mono">{overall.completed} / {overall.total} Steps</span>
              {health && health.checks && (
                <button
                  onClick={() => setShowAuditDetails(!showAuditDetails)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all cursor-pointer ${
                    allPassed ? "bg-workflow-success/10 text-workflow-success border-workflow-success/20 hover:bg-workflow-success/15" : "bg-workflow-warning/10 text-workflow-warning border-workflow-warning/20 hover:bg-workflow-warning/15"
                  }`}
                  title="Click to view health audit details"
                >
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>{allPassed ? "Verified" : `${passedChecks}/${totalChecks}`}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-xs font-mono text-white/50 flex-wrap">
              <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-md border border-white/5 min-w-0 max-w-full">
                <FolderOpen className="w-3 h-3 shrink-0 text-white/40" />
                <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg text-[10px] text-white/70">{project.path}</span>
                <button onClick={handleCopyPath} title="Copy full path" className="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer shrink-0 ml-0.5">
                  {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                </button>
                <div className="w-[1px] h-2.5 bg-white/10 shrink-0" />
                <button onClick={handleCopyCd} title="Copy `cd` command" className="px-1 py-0.2 rounded hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer flex items-center gap-0.5 text-[9px]">
                  <Terminal className="w-2.5 h-2.5 text-white/40" /><span>{copiedCd ? "copied" : "cd"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <ProjectCardActions
          project={project}
          onOpenArchitect={onOpenArchitect}
          handleQuickCheckpoint={handleQuickCheckpoint}
          onOpenConfig={onOpenConfig}
          onRemove={onRemove}
        />
      </div>

      <ProjectCardStats health={health} showAuditDetails={showAuditDetails} />
    </motion.div>
  );
}
