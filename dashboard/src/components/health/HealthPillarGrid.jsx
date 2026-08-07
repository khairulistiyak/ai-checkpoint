import React from 'react';
import { Shield, Code2, Layers, Sparkles, Lock, Cpu } from 'lucide-react';

export default function HealthPillarGrid({ breakdown }) {
  return (
    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
      {[
        {
          label: 'Security & Secrets',
          value: (breakdown.criticalSecurity || 0) + (breakdown.warningSecurity || 0),
          icon: Lock,
          color: (breakdown.criticalSecurity || 0) === 0 ? 'text-emerald-400' : 'text-rose-400',
          desc: 'Zero leak policy'
        },
        {
          label: 'Rule 0 Guard',
          value: breakdown.rule0Violations || 0,
          icon: Shield,
          color: (breakdown.rule0Violations || 0) === 0 ? 'text-emerald-400' : 'text-amber-400',
          desc: '<= 150 lines per file'
        },
        {
          label: 'Syntax & Types',
          value: breakdown.syntaxErrors || 0,
          icon: Code2,
          color: (breakdown.syntaxErrors || 0) === 0 ? 'text-emerald-400' : 'text-rose-400',
          desc: 'Clean compile state'
        },
        {
          label: 'Module Imports',
          value: breakdown.brokenImports || 0,
          icon: Layers,
          color: (breakdown.brokenImports || 0) === 0 ? 'text-emerald-400' : 'text-rose-400',
          desc: 'Relative dependency map'
        },
        {
          label: 'Code Hygiene',
          value: breakdown.hygieneIssues || 0,
          icon: Sparkles,
          color: (breakdown.hygieneIssues || 0) === 0 ? 'text-emerald-400' : 'text-amber-400',
          desc: 'Logs, TODOs & cleanup'
        },
        {
          label: 'Complexity & Flow',
          value: breakdown.complexityIssues || 0,
          icon: Cpu,
          color: (breakdown.complexityIssues || 0) === 0 ? 'text-emerald-400' : 'text-amber-400',
          desc: 'Cyclomatic depth'
        },
      ].map((item, idx) => {
        const Icon = item.icon;
        const ok = item.value === 0;
        return (
          <div
            key={idx}
            className="bg-[#121214] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-4 flex flex-col justify-between transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-zinc-400 truncate">{item.label}</span>
              <Icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className={`text-2xl font-black font-mono ${ok ? 'text-emerald-400' : 'text-zinc-100'}`}>
                {item.value}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {ok ? 'issues' : 'detected'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 truncate">{item.desc}</span>
          </div>
        );
      })}
    </div>
  );
}
