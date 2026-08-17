import React from 'react';
import { CheckCircle2, XCircle, FileCheck } from 'lucide-react';

export default function HealthCoreChecklist({ checks }) {
  if (!checks || checks.length === 0) return null;

  const allPassed = checks.every(c => c.passed);

  if (allPassed) {
    return null;
  }

  const failedChecks = checks.filter(c => !c.passed);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <XCircle className="w-4 h-4 text-rose-500" />
        <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
          Framework Integrity Compromised ({failedChecks.length} Failed)
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {failedChecks.map((c, i) => (
          <div
            key={i}
            className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300 text-[11px] font-mono flex items-center gap-1.5"
          >
            <span>{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
