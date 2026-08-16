import React from 'react';
import { ShieldCheck, Layers, AlertCircle, Check, ArrowRight } from 'lucide-react';

export default function ArchitectureRadar({ compliance, loading }) {
  if (loading) {
    return (
      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl animate-pulse text-zinc-500 font-mono text-xs">
        Evaluating RFC Architecture Compliance...
      </div>
    );
  }

  const score = compliance?.score ?? 100;
  const specs = compliance?.specs ?? [];
  const isHealthy = score === 100;

  return (
    <div className="space-y-3.5 font-mono text-xs">
      <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-zinc-300" />
            <span className="font-bold text-white text-xs">Architecture RFC Compliance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500">{compliance?.filesScanned || 0} files verified</span>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${isHealthy ? 'bg-white/10 text-white border border-white/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
              {score}% RFC Compliant
            </span>
          </div>
        </div>

        <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-700 ${isHealthy ? 'bg-white' : 'bg-amber-400'}`} style={{ width: `${score}%` }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {specs.map((spec) => (
            <div
              key={spec.code}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                spec.passed ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-red-500/[0.04] border-red-500/20 text-red-200'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-300 px-1.5 py-0.2 bg-white/5 rounded border border-white/10">{spec.code}</span>
                  <span className="font-medium text-white truncate text-[11px]">{spec.title}</span>
                </div>
                <div className="text-[10px] text-zinc-500 truncate mt-0.5">{spec.desc}</div>
              </div>
              {spec.passed ? (
                <Check size={13} className="text-zinc-300 stroke-[2.5] shrink-0" />
              ) : (
                <AlertCircle size={13} className="text-red-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-2">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
          <Layers size={12} className="text-zinc-300" /> Dependency Flow Blueprint
        </label>
        <div className="flex items-center justify-between gap-1 p-2 bg-black/40 border border-white/10 rounded-xl text-[10px] text-zinc-400 overflow-x-auto">
          <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-white font-medium shrink-0">
            UI Layer (dashboard/)
          </div>
          <ArrowRight size={12} className="text-zinc-600 shrink-0" />
          <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-white font-medium shrink-0">
            Adapters & CLI (packages/cli/)
          </div>
          <ArrowRight size={12} className="text-zinc-600 shrink-0" />
          <div className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-lg text-white font-bold shrink-0">
            Domain Core (packages/core/)
          </div>
        </div>
      </div>
    </div>
  );
}
