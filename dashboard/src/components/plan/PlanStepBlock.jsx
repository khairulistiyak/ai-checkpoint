import React from 'react';
import { Check, Bot } from 'lucide-react';
import PlanStepMetadata from './PlanStepMetadata.jsx';

export default function PlanStepBlock({
  block, idx, copiedStepBadge, copyStepCommand, generateStepPrompt,
  formatTextWithBadges
}) {
  const isPromptCopied = copiedStepBadge === `${block.stepNum}-prompt`;

  return (
    <div key={idx} className="bg-[#101116] border border-white/[0.07] hover:border-white/15 rounded-2xl p-4 sm:p-5 my-4 space-y-3.5 shadow-lg transition-all group">
      {/* Step Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] text-zinc-300 border border-white/[0.08] font-mono text-xs font-bold">
            Step {block.stepNum}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-zinc-100 font-mono tracking-tight">
            {block.stepTitle}
          </h3>
        </div>

        {/* Step Action: AI Prompt */}
        <button
          onClick={() => {
            const prompt = generateStepPrompt(block);
            copyStepCommand(prompt, block.stepNum, 'prompt');
          }}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
            isPromptCopied
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border-white/[0.08] hover:border-white/20 shadow-sm'
          }`}
          title="Copy ready-to-run AI agent prompt for this step"
        >
          {isPromptCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Bot className="w-3 h-3 text-zinc-400" />}
          <span>AI Prompt</span>
        </button>
      </div>

      {/* Step Body with Structured Metadata */}
      {block.body && (
        <PlanStepMetadata body={block.body} formatTextWithBadges={formatTextWithBadges} />
      )}
    </div>
  );
}

