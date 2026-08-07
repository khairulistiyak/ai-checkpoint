import React from 'react';
import { Radio, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function ProjectCardStats({ health, showAuditDetails }) {
  if (!showAuditDetails || !health || !health.checks) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap pt-1.5 border-t border-white/5 text-[9px] font-mono">
      <span className="text-white/40 mr-1 flex items-center gap-1">
        <Radio className="w-2.5 h-2.5 text-white/30" />
        Audit Details:
      </span>
      {health.checks.map((c) => (
        <span
          key={c.name}
          className={`px-1.5 py-0.5 rounded border flex items-center gap-1 ${
            c.passed
              ? "bg-white/5 text-white/70 border-white/10"
              : "bg-red-500/10 text-red-400 border-red-500/20 font-bold"
          }`}
        >
          {c.passed ? (
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-2.5 h-2.5 text-red-400" />
          )}
          {c.name}
        </span>
      ))}
    </div>
  );
}
