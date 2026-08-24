import React from 'react';
import { Cpu, Check, Bot, FileCode2, Copy } from 'lucide-react';

export default function PlanSpecHeader({
  title,
  stats,
  percentage,
  copyFullSpecAsPrompt,
  copiedSpec,
  targetFiles,
}) {
  const uniqueFiles = Array.from(new Set(targetFiles || []));
  const subText = stats.totalTasks > 0
    ? `${stats.totalTasks} checkpoints`
    : `${stats.totalSteps} execution steps`;

  return (
    <div className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 sm:p-6 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-cyan-400" />
              SYSTEM BLUEPRINT
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-300 font-mono text-[10px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              {stats.totalSteps > 0 ? `${stats.totalSteps} Execution Steps` : 'Verified Plan'}
            </span>
            {uniqueFiles.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-400 font-mono text-[10px] font-medium flex items-center gap-1.5">
                <FileCode2 className="w-3 h-3 text-cyan-400" />
                {uniqueFiles.length} Target Files
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
            {title}
          </h1>
          <p className="text-xs font-mono text-zinc-400 leading-relaxed">
            Atomic execution specification • <strong className="text-zinc-200">{stats.totalModules} modules</strong> • <strong className="text-zinc-200">{subText}</strong>
          </p>
        </div>

        <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
          {stats.totalTasks > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Tasks Completed</span>
                <span className="text-xs font-mono font-bold text-zinc-200">
                  {stats.completedTasks} / {stats.totalTasks} ({percentage}%)
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25">
                <span className="text-[11px] font-mono font-black text-emerald-400">{percentage}%</span>
              </div>
            </div>
          )}

          <button
            onClick={copyFullSpecAsPrompt}
            className={`px-3.5 py-2 rounded-xl border font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              copiedSpec
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border-cyan-500/30 hover:border-cyan-500/50 shadow-sm'
            }`}
            title="Copy entire blueprint as an AI instruction prompt"
          >
            {copiedSpec ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Prompt Copied!</span>
              </>
            ) : (
              <>
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy AI Full Plan Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
