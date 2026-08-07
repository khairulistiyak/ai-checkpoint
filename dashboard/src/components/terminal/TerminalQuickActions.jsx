import React from 'react';

export default function TerminalQuickActions({ actions, runningCmd }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e0f18]/90 border-b border-white/[0.06] overflow-x-auto custom-scrollbar shrink-0">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 px-1 shrink-0">
        Fast Actions:
      </span>

      {actions.map((qa, i) => {
        const Icon = qa.icon;
        return (
          <button
            key={i}
            disabled={!!runningCmd}
            onClick={qa.action}
            className="px-2.5 py-1 rounded-lg text-[11px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40 active:scale-95 shadow-sm"
            title={`Run ${qa.cmd}`}
          >
            <Icon size={12} className={qa.color} />
            <span>{qa.label}</span>
          </button>
        );
      })}
    </div>
  );
}
