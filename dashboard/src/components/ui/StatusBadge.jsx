import React from 'react';

export const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'success':
      case 'complete':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]';
      case 'running':
      case 'active':
        return 'text-cyber-accent bg-cyber-accent/10 border-cyber-accent/20 shadow-[0_0_10px_rgba(var(--cyber-accent-rgb),0.1)]';
      case 'pending':
        return 'text-cyber-text-muted bg-cyber-dark border-cyber-card-border';
      case 'error':
      case 'blocked':
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]';
      default:
        return 'text-cyber-text-muted bg-cyber-dark border-cyber-card-border';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${getStatusConfig()} ${className}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};
