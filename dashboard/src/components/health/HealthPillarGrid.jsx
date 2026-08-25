import React from 'react';
import { Shield, Code2, Layers, Sparkles, Lock, Cpu, Check, AlertTriangle } from 'lucide-react';

export default function HealthPillarGrid({ breakdown = {}, activeCategory = 'all', onSelectCategory }) {
  const pillars = [
    {
      id: 'security',
      label: 'Security & Secrets',
      value: (breakdown.criticalSecurity || 0) + (breakdown.warningSecurity || 0),
      icon: Lock,
      desc: 'Zero leak policy'
    },
    {
      id: 'rule0',
      label: 'Rule 0 Guard',
      value: breakdown.rule0Violations || 0,
      icon: Shield,
      desc: '<= 150 lines per file'
    },
    {
      id: 'syntax',
      label: 'Syntax & Types',
      value: breakdown.syntaxErrors || 0,
      icon: Code2,
      desc: 'Clean compile state'
    },
    {
      id: 'imports',
      label: 'Module Imports',
      value: breakdown.brokenImports || 0,
      icon: Layers,
      desc: 'Relative dependency map'
    },
    {
      id: 'hygiene',
      label: 'Code Hygiene',
      value: breakdown.hygieneIssues || 0,
      icon: Sparkles,
      desc: 'Logs, TODOs & cleanup'
    },
    {
      id: 'complexity',
      label: 'Complexity & Flow',
      value: breakdown.complexityIssues || 0,
      icon: Cpu,
      desc: 'Cyclomatic depth'
    }
  ];

  return (
    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
      {pillars.map((item) => {
        const Icon = item.icon;
        const isSelected = activeCategory === item.id;
        const ok = item.value === 0;

        return (
          <div
            key={item.id}
            onClick={() => onSelectCategory && onSelectCategory(isSelected ? 'all' : item.id)}
            className={`rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200 relative overflow-hidden group cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] ${
              isSelected
                ? ok
                  ? 'bg-[#0f1512]/95 border border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/30'
                  : 'bg-[#181113]/95 border border-rose-500/40 shadow-[0_0_24px_rgba(244,63,94,0.12)] ring-1 ring-rose-500/30'
                : 'bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/[0.06] hover:border-white/[0.14] hover:bg-[#111114]/90 shadow-sm'
            }`}
          >
            {/* Ambient Background Radial Glow */}
            <div
              className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-all ${
                ok
                  ? 'bg-emerald-500/[0.02] group-hover:bg-emerald-500/[0.05]'
                  : 'bg-rose-500/[0.04] group-hover:bg-rose-500/[0.08]'
              }`}
            />

            {/* Header: Icon & Label */}
            <div className="flex items-center justify-between gap-2 relative z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                    ok
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-mono font-semibold text-zinc-300 group-hover:text-white transition-colors truncate">
                  {item.label}
                </span>
              </div>
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  ok
                    ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                    : 'bg-rose-400 animate-ping'
                }`}
              />
            </div>

            {/* Metric & Status Pill */}
            <div className="my-2.5 flex items-baseline justify-between gap-2 relative z-10">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-2xl font-black font-mono tabular-nums tracking-tight transition-colors ${
                    ok ? 'text-white group-hover:text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {item.value}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">{ok ? 'issues' : 'detected'}</span>
              </div>

              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm shrink-0 flex items-center gap-1 ${
                  ok
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse'
                }`}
              >
                {ok ? <Check className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                {ok ? 'PASS' : 'WARN'}
              </span>
            </div>

            {/* Footer / Filter Affordance */}
            <div className="flex items-center justify-between gap-1 relative z-10 pt-1.5 border-t border-white/[0.04]">
              <span className="text-[10px] font-mono text-zinc-400 truncate">{item.desc}</span>
              {isSelected ? (
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  FILTERED
                </span>
              ) : (
                <span className="text-[9px] font-mono text-zinc-400 group-hover:text-zinc-300 transition-colors flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                  Filter <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
