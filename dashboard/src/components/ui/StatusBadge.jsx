import React from 'react';

const STATUS_STYLE_MAP = {
  done: 'text-workflow-success bg-workflow-success/10 border-workflow-success/25',
  success: 'text-workflow-success bg-workflow-success/10 border-workflow-success/25',
  complete: 'text-workflow-success bg-workflow-success/10 border-workflow-success/25',
  verified: 'text-workflow-success bg-workflow-success/10 border-workflow-success/25',
  running: 'text-workflow-running bg-workflow-running/10 border-workflow-running/25',
  active: 'text-workflow-running bg-workflow-running/10 border-workflow-running/25',
  'in progress': 'text-workflow-running bg-workflow-running/10 border-workflow-running/25',
  'in-progress': 'text-workflow-running bg-workflow-running/10 border-workflow-running/25',
  warning: 'text-workflow-warning bg-workflow-warning/10 border-workflow-warning/25',
  remaining: 'text-workflow-warning bg-workflow-warning/10 border-workflow-warning/25',
  error: 'text-workflow-error bg-workflow-error/10 border-workflow-error/25',
  blocked: 'text-workflow-error bg-workflow-error/10 border-workflow-error/25',
  failed: 'text-workflow-error bg-workflow-error/10 border-workflow-error/25',
  ai: 'text-workflow-ai bg-workflow-ai/10 border-workflow-ai/25',
  checkpoint: 'text-workflow-ai bg-workflow-ai/10 border-workflow-ai/25',
};

const DEFAULT_STATUS_STYLE = 'text-zinc-400 bg-white/[0.04] border-white/10';

export const StatusBadge = ({ status, className = '' }) => {
  const normalized = status?.toLowerCase();
  const statusStyle = STATUS_STYLE_MAP[normalized] || DEFAULT_STATUS_STYLE;

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border transition-colors duration-200 ${statusStyle} ${className}`}
    >
      {status || 'UNKNOWN'}
    </span>
  );
};
