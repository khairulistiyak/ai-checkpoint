import React from 'react';
import { Cpu, Check, Bot, FileCode2 } from 'lucide-react';

export default function PlanSpecHeader({
  title,
  stats,
  percentage,
  copyFullSpecAsPrompt,
  copiedSpec,
  targetFiles,
}) {
  const uniqueFiles = Array.from(new Set(targetFiles || []));

  return (
    <div className="rounded-2xl bg-[#0d0e12] border border-white/[0.08] p-5 sm:p-6 space-y-3.5 shadow-lg">
      {/* Row 1: Blueprint Title & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 shrink-0">
            <Cpu className="w-4 h-4 text-zinc-300" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-100 font-mono tracking-tight">
            {title}
          </h1>
        </div>

        <button
          onClick={copyFullSpecAsPrompt}
          className={`px-3.5 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            copiedSpec
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border-white/[0.08] hover:border-white/20 shadow-sm'
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
              <Bot className="w-3.5 h-3.5 text-zinc-400" />
              <span>AI Plan Prompt</span>
            </>
          )}
        </button>
      </div>

      {/* Row 2: Structured Metadata Summary Strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-white/[0.05] text-xs font-mono text-zinc-400">
        {uniqueFiles.length > 0 && (
          <span className="flex items-center gap-1.5">
            <FileCode2 className="w-3.5 h-3.5 text-zinc-400" />
            <strong className="text-zinc-200 font-semibold">{uniqueFiles.length}</strong> Target Files
          </span>
        )}
        <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:inline-block" />
        <span>
          <strong className="text-zinc-200 font-semibold">{stats.totalModules}</strong> Modules
        </span>
        <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:inline-block" />
        <span>
          <strong className="text-zinc-200 font-semibold">{stats.totalSteps}</strong> Steps
        </span>
        {stats.totalTasks > 0 && (
          <>
            <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:inline-block" />
            <span className="flex items-center gap-1.5 text-emerald-400/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>
                {stats.completedTasks}/{stats.totalTasks} Tasks ({percentage}%)
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
