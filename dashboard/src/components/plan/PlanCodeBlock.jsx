import React from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

export default function PlanCodeBlock({ block, idx, copiedCodeIndex, copySnippet, formatCodeWithTheme }) {
  const isCopied = copiedCodeIndex === idx;

  return (
    <div key={idx} className="bg-[#07070a]/95 backdrop-blur-xl rounded-2xl border border-white/[0.12] overflow-hidden my-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] group">
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/90 border border-[#e0443e]/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/90 border border-[#dea123]/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/90 border border-[#1aab29]/50" />
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            <Code2 className="w-3 h-3 text-sky-400" />
            <span>{block.language || 'code'}</span>
          </div>
        </div>

        <button
          onClick={() => copySnippet(block.code, idx)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
            isCopied
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border-white/10'
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
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
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
