import React from 'react';
import { ChevronRight, AlertTriangle, Copy, Check } from 'lucide-react';

export default function TerminalOutput({
  logs,
  logsEndRef,
  wrapLines,
  handleCopySingle,
  copiedLogId,
}) {
  return (
    <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 custom-scrollbar bg-[#050608] select-text">
      {logs.map((log) => (
        <div key={log.id} className="group flex flex-col gap-1 transition-all">
          {/* Log Meta Header */}
          <div className="flex items-center justify-between text-[10px] text-zinc-500 select-none">
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 font-mono">[{log.time}]</span>

              {log.type === 'input' && (
                <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold uppercase tracking-wider text-[9px]">
                  INPUT
                </span>
              )}
              {log.type === 'output' && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider text-[9px]">
                  SUCCESS
                </span>
              )}
              {log.type === 'error' && (
                <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase tracking-wider text-[9px]">
                  ERROR
                </span>
              )}
              {log.type === 'system' && (
                <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-white/10 font-bold uppercase tracking-wider text-[9px]">
                  SYSTEM
                </span>
              )}
            </div>

            {/* Copy Single Block Action */}
            {(log.type === 'output' || log.type === 'error') && (
              <button
                onClick={() => handleCopySingle(log.id, log.text)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-200 px-1.5 py-0.5 rounded bg-white/[0.05] hover:bg-white/10 flex items-center gap-1 text-[10px] cursor-pointer"
                title="Copy this response"
              >
                {copiedLogId === log.id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                <span>{copiedLogId === log.id ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {/* Log Body Content */}
          {log.type === 'input' ? (
            <div className="flex items-center gap-2 text-sky-300 font-semibold text-xs pl-2 border-l-2 border-sky-500/40">
              <ChevronRight size={14} className="text-sky-400 shrink-0" />
              <span>{log.text}</span>
            </div>
          ) : log.type === 'output' ? (
            <div className={`p-2.5 rounded-xl bg-black/60 border border-emerald-500/20 text-emerald-300 text-xs ${
              wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
            } shadow-inner font-mono leading-relaxed`}>
              {log.text}
            </div>
          ) : log.type === 'error' ? (
            <div className={`p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs ${
              wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
            } flex items-start gap-2 leading-relaxed`}>
              <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{log.text}</span>
            </div>
          ) : (
            <div className="text-zinc-400 text-xs italic pl-2 border-l-2 border-white/10 py-0.5">
              {log.text}
            </div>
          )}
        </div>
      ))}
      <div ref={logsEndRef} />
    </div>
  );
}
