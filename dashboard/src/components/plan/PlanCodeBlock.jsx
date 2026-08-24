import React from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

export default function PlanCodeBlock({ block, idx, copiedCodeIndex, copySnippet, formatCodeWithTheme }) {
  const isCopied = copiedCodeIndex === idx;

  return (
    <div key={idx} className="bg-[#07070a] rounded-2xl border border-white/[0.07] overflow-hidden my-4 shadow-lg group">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.05] text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff5f56]/60 border border-[#e0443e]/30" />
            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]/60 border border-[#dea123]/30" />
            <span className="w-2 h-2 rounded-full bg-[#27c93f]/60 border border-[#1aab29]/30" />
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <Code2 className="w-3 h-3 text-sky-400" />
            <span>{block.language || 'code'}</span>
          </div>
        </div>

        <button
          onClick={() => copySnippet(block.code, idx)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
            isCopied
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border-white/[0.06]'
          }`}
          title="Copy snippet"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-emerald-300">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-500" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 sm:p-5 overflow-x-auto custom-scrollbar bg-[#050508]/60">
        <pre className="text-xs font-mono leading-relaxed text-[#abb2bf]">
          <code dangerouslySetInnerHTML={{ __html: formatCodeWithTheme(block.code) }} />
        </pre>
      </div>
    </div>
  );
}
