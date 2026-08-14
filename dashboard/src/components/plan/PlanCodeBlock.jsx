import React from 'react';
import { Check, Copy } from 'lucide-react';

export default function PlanCodeBlock({ block, idx, copiedCodeIndex, copySnippet, formatCodeWithTheme }) {
  return (
    <div key={idx} className="bg-[#070709]/90 backdrop-blur-md rounded-xl border border-white/[0.12] overflow-hidden my-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/10 text-xs font-mono">
        <span className="uppercase tracking-wider text-[11px] font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded border border-white/15">
          {block.language}
        </span>
        <button
          onClick={() => copySnippet(block.code, idx)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all text-xs font-mono border border-white/10 cursor-pointer"
        >
          {copiedCodeIndex === idx ? (
            <>
              <Check className="w-3 h-3 text-white" />
              <span className="text-white font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="text-xs font-mono leading-relaxed text-[#abb2bf]">
          <code dangerouslySetInnerHTML={{ __html: formatCodeWithTheme(block.code) }} />
        </pre>
      </div>
    </div>
  );
}
