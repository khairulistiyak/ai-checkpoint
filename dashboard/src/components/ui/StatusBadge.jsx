import React from 'react';

export const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'success':
      case 'complete':
      case 'verified':
        return 'text-workflow-success bg-workflow-success/10 border-workflow-success/25';
      case 'running':
      case 'active':
      case 'in progress':
      case 'in-progress':
        return 'text-workflow-running bg-workflow-running/10 border-workflow-running/25';
      case 'warning':
      case 'remaining':
        return 'text-workflow-warning bg-workflow-warning/10 border-workflow-warning/25';
      case 'error':
      case 'blocked':
      case 'failed':
        return 'text-workflow-error bg-workflow-error/10 border-workflow-error/25';
      case 'ai':
      case 'checkpoint':
        return 'text-workflow-ai bg-workflow-ai/10 border-workflow-ai/25';
      case 'pending':
      default:
        return 'text-zinc-400 bg-white/[0.04] border-white/10';
    }
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border transition-colors duration-200 ${getStatusConfig()} ${className}`}
    >
      {status || 'UNKNOWN'}
    </span>
  );
};
