import React from 'react';
import { Shield, Code2, Layers, Sparkles, Lock, Cpu } from 'lucide-react';

export default function HealthPillarGrid({ breakdown = {}, activeCategory = 'all', onSelectCategory }) {
  const pillars = [
    {
      id: 'security',
      label: 'Security & Secrets',
      value: (breakdown.criticalSecurity || 0) + (breakdown.warningSecurity || 0),
      icon: Lock,
      iconColor: (breakdown.criticalSecurity || 0) === 0 ? 'text-emerald-400' : 'text-rose-400',
      iconBg: (breakdown.criticalSecurity || 0) === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20',
      desc: 'Zero leak policy'
    },
    {
      id: 'rule0',
      label: 'Rule 0 Guard',
      value: breakdown.rule0Violations || 0,
      icon: Shield,
      iconColor: (breakdown.rule0Violations || 0) === 0 ? 'text-emerald-400' : 'text-amber-400',
      iconBg: (breakdown.rule0Violations || 0) === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20',
      desc: '<= 150 lines per file'
    },
    {
      id: 'syntax',
      label: 'Syntax & Types',
      value: breakdown.syntaxErrors || 0,
      icon: Code2,
      iconColor: (breakdown.syntaxErrors || 0) === 0 ? 'text-emerald-400' : 'text-rose-400',
      iconBg: (breakdown.syntaxErrors || 0) === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20',
      desc: 'Clean compile state'
    },
    {
      id: 'imports',
      label: 'Module Imports',
      value: breakdown.brokenImports || 0,
      icon: Layers,
      iconColor: (breakdown.brokenImports || 0) === 0 ? 'text-emerald-400' : 'text-rose-400',
      iconBg: (breakdown.brokenImports || 0) === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20',
      desc: 'Relative dependency map'
    },
    {
      id: 'hygiene',
      label: 'Code Hygiene',
      value: breakdown.hygieneIssues || 0,
      icon: Sparkles,
      iconColor: (breakdown.hygieneIssues || 0) === 0 ? 'text-emerald-400' : 'text-amber-400',
      iconBg: (breakdown.hygieneIssues || 0) === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20',
      desc: 'Logs, TODOs & cleanup'
    },
    {
      id: 'complexity',
      label: 'Complexity & Flow',
      value: breakdown.complexityIssues || 0,
      icon: Cpu,
      iconColor: (breakdown.complexityIssues || 0) === 0 ? 'text-emerald-400' : 'text-amber-400',
      iconBg: (breakdown.complexityIssues || 0) === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20',
      desc: 'Cyclomatic depth'
    }
  ];

  return (
    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
      {pillars.map((item) => {
        const Icon = item.icon;
        const isSelected = activeCategory === item.id;
        const ok = item.value === 0;

        return (
          <div
            key={item.id}
            onClick={() => onSelectCategory && onSelectCategory(isSelected ? 'all' : item.id)}
            className={`rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer active:scale-[0.98] ${
              isSelected
                ? 'bg-[#0e0e11]/95 border border-white/30 shadow-[0_0_24px_rgba(255,255,255,0.08)] ring-1 ring-white/15'
                : 'bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.14] hover:bg-[#0e0e11]/95 shadow-sm'
            }`}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/[0.015] rounded-full blur-2xl pointer-events-none group-hover:bg-white/[0.03] transition-all" />

            <div className="flex items-center justify-between gap-2 relative z-10">
              <span className="text-xs font-mono font-semibold text-zinc-300 group-hover:text-white transition-colors truncate">
                {item.label}
              </span>
              <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${item.iconBg}`}>
                <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
              </div>
            </div>

            <div className="my-2.5 flex items-baseline justify-between gap-2 relative z-10">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-black font-mono tabular-nums ${ok ? 'text-emerald-400' : 'text-rose-300'}`}>
                  {item.value}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">{ok ? 'issues' : 'detected'}</span>
              </div>

              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm shrink-0 ${
                ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse'
              }`}>
                {ok ? 'PASS' : 'WARN'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 relative z-10 pt-1 border-t border-white/[0.04]">
              <span className="text-[10px] font-mono text-zinc-500 truncate">{item.desc}</span>
              {isSelected && (
                <span className="text-[9px] font-mono font-bold text-white uppercase tracking-wider shrink-0 bg-white/10 px-1 rounded">
                  FILTERED
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
