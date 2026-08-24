import React from 'react';
import { Cpu, Check, Bot, FileCode2, Copy } from 'lucide-react';

export default function PlanSpecHeader({
  title,
  stats,
  percentage,
  copyFullSpecAsPrompt,
  copiedSpec,
  targetFiles,
  copiedFilePath,
  setCopiedFilePath,
}) {
  const uniqueFiles = Array.from(new Set(targetFiles || []));
  const subText = stats.totalTasks > 0
    ? `${stats.totalTasks} checkpoints`
    : `${stats.totalSteps} execution steps`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0d0e12] border border-white/15 p-5 sm:p-7 shadow-2xl">
      {/* Ambient Radial Glow Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/[0.07] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <Cpu className="w-3 h-3 text-cyan-400" />
              SYSTEM ARCHITECTURE BLUEPRINT
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/15 text-white/80 font-mono text-[10px] font-bold flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {stats.totalSteps > 0 ? `${stats.totalSteps} Execution Steps` : 'Verified Plan'}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs font-mono text-white/60 leading-relaxed">
            Atomic execution specification • <strong className="text-white">{stats.totalModules} modules</strong> • <strong className="text-white">{subText}</strong>
          </p>
        </div>

        <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
          {stats.totalTasks > 0 && (
            <div className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-3 backdrop-blur-md">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Tasks Completed</span>
                <span className="text-sm font-mono font-bold text-white">
                  {stats.completedTasks} / {stats.totalTasks} ({percentage}%)
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                <span className="text-xs font-mono font-black text-emerald-400">{percentage}%</span>
              </div>
            </div>
          )}

          <button
            onClick={copyFullSpecAsPrompt}
            className="px-3.5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 border border-white font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            title="Copy entire blueprint as an AI instruction prompt"
          >
            {copiedSpec ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span>Prompt Copied!</span>
              </>
            ) : (
              <>
                <Bot className="w-3.5 h-3.5 text-black" />
                <span>Copy AI Full Plan Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {uniqueFiles.length > 0 && (
        <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-2 mb-2 text-[11px] font-mono uppercase tracking-wider text-white/60 font-semibold">
            <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Files & References Radar ({uniqueFiles.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {uniqueFiles.map((filePath, i) => (
              <button
                key={i}
                onClick={() => {
                  navigator.clipboard.writeText(filePath);
                  setCopiedFilePath(filePath);
                  setTimeout(() => setCopiedFilePath(null), 1500);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-white/80 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer group shadow-sm"
                title="Click to copy file path"
              >
                <span className="text-cyan-400/70 group-hover:text-cyan-300 text-[10px]">📄</span>
                <span className="truncate max-w-[12.5rem]">{filePath}</span>
                {copiedFilePath === filePath ? (
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
