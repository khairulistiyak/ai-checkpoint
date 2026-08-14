import React from 'react';
import { Check, Play, CheckCircle2, Bot } from 'lucide-react';

export default function PlanStepBlock({
  block, idx, copiedStepBadge, copyStepCommand, generateStepPrompt,
  formatTextWithBadges
}) {
  const startCmd = `./l start ${block.stepNum}`;
  const completeCmd = `./l c ${block.stepNum} "Implemented ${block.stepTitle.replace(/"/g, '')}"`;
  const isStartCopied = copiedStepBadge === `${block.stepNum}-start`;
  const isCompCopied = copiedStepBadge === `${block.stepNum}-complete`;
  const isPromptCopied = copiedStepBadge === `${block.stepNum}-prompt`;

  return (
    <div key={idx} className="bg-[#121215]/80 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-4 sm:p-5 my-5 space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/[0.02] rounded-full blur-3xl pointer-events-none group-hover:bg-white/[0.03] transition-colors" />

      {/* Step Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-lg bg-white text-black font-mono text-xs font-black">
            Step {block.stepNum}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white font-mono tracking-tight">
            {block.stepTitle}
          </h3>
        </div>

        {/* Step CLI Triggers */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => copyStepCommand(startCmd, block.stepNum, 'start')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isStartCopied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/5 hover:bg-white/15 text-white/90 border-white/15'
            }`}
            title="Copy: ./l start command"
          >
            {isStartCopied ? <Check className="w-3 h-3" /> : <Play className="w-3 h-3 text-white/60" />}
            <span>./l start {block.stepNum}</span>
          </button>

          <button
            onClick={() => copyStepCommand(completeCmd, block.stepNum, 'complete')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isCompCopied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/5 hover:bg-white/15 text-white/90 border-white/15'
            }`}
            title="Copy: ./l c complete command"
          >
            {isCompCopied ? <Check className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3 text-white/60" />}
            <span>./l c {block.stepNum}</span>
          </button>

          <button
            onClick={() => {
              const prompt = generateStepPrompt(block);
              copyStepCommand(prompt, block.stepNum, 'prompt');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isPromptCopied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/25'
            }`}
            title="Copy ready-to-run AI agent prompt for this step"
          >
            {isPromptCopied ? <Check className="w-3 h-3" /> : <Bot className="w-3 h-3 text-white" />}
            <span>AI Step Prompt</span>
          </button>
        </div>
      </div>

      {/* Step Body */}
      {block.body && (
        <div className="text-xs sm:text-sm font-mono text-white/80 leading-relaxed space-y-2 whitespace-pre-wrap">
          {formatTextWithBadges(block.body)}
        </div>
      )}
    </div>
  );
}
