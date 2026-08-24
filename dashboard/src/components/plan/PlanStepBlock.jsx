import React from 'react';
import { Check, Play, CheckCircle2, Bot } from 'lucide-react';
import PlanStepMetadata from './PlanStepMetadata.jsx';

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
    <div key={idx} className="bg-[#101116] border border-white/[0.07] hover:border-white/15 rounded-2xl p-4 sm:p-5 my-4 space-y-3.5 shadow-lg transition-all group">
      {/* Step Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-mono text-xs font-bold shadow-sm">
            Step {block.stepNum}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-zinc-100 font-mono tracking-tight">
            {block.stepTitle}
          </h3>
        </div>

        {/* Step Actions: AI Prompt & CLI Segment */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const prompt = generateStepPrompt(block);
              copyStepCommand(prompt, block.stepNum, 'prompt');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isPromptCopied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-sm'
            }`}
            title="Copy ready-to-run AI agent prompt for this step"
          >
            {isPromptCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Bot className="w-3 h-3 text-cyan-400" />}
            <span>AI Prompt</span>
          </button>

          <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5 text-[11px] font-mono">
            <button
              onClick={() => copyStepCommand(startCmd, block.stepNum, 'start')}
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                isStartCopied ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title={`Copy: ${startCmd}`}
            >
              {isStartCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 text-zinc-400" />}
              <span>start</span>
            </button>
            <div className="w-px h-3 bg-white/10 mx-0.5" />
            <button
              onClick={() => copyStepCommand(completeCmd, block.stepNum, 'complete')}
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                isCompCopied ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title={`Copy: ${completeCmd}`}
            >
              {isCompCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <CheckCircle2 className="w-3 h-3 text-zinc-400" />}
              <span>done</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step Body with Structured Metadata */}
      {block.body && (
        <PlanStepMetadata body={block.body} formatTextWithBadges={formatTextWithBadges} />
      )}
    </div>
  );
}
