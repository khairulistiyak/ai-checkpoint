import React from 'react';
import { CheckCircle2, XCircle, FileCheck } from 'lucide-react';

export default function HealthCoreChecklist({ checks }) {
  if (!checks || checks.length === 0) return null;

  return (
    <div className="bg-[#121214] border border-white/[0.08] rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-sky-400" />
          <span>Core Framework Integrity ({checks.filter(c => c.passed).length}/{checks.length})</span>
        </span>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          {checks.every(c => c.passed) ? 'All Pass' : 'Partial'}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {checks.map((c, i) => (
          <div
            key={i}
            className={`px-3 py-2 rounded-xl border text-xs font-mono flex items-center justify-between gap-1.5 ${
              c.passed
                ? 'bg-white/[0.02] border-white/[0.06] text-zinc-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            <span className="truncate text-[11px]">{c.name}</span>
            {c.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
