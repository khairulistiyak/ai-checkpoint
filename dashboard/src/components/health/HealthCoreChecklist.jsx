import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, FileCheck } from 'lucide-react';

export default function HealthCoreChecklist({ checks }) {
  if (!checks || checks.length === 0) return null;

  const failedRequired = checks.filter(c => !c.passed && !c.optional);
  const failedOptional = checks.filter(c => !c.passed && c.optional);

  if (failedRequired.length === 0 && failedOptional.length === 0) return null;

  return (
    <div className="space-y-3">
      {failedRequired.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
              Framework Integrity Compromised ({failedRequired.length} Failed)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {failedRequired.map((c, i) => (
              <div
                key={i}
                className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300 text-[11px] font-mono flex items-center gap-1.5"
              >
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {failedOptional.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Recommendations ({failedOptional.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {failedOptional.map((c, i) => (
              <div
                key={`opt-${i}`}
                className="px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-300 text-[11px] font-mono flex items-center gap-1.5"
              >
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
