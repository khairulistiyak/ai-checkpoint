import React from 'react';
import { motion } from 'framer-motion';

export default function ActivityLogEntry({ entry, config, formatTime }) {
  const Icon = config.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-cyber-dark/50 transition-colors group border border-transparent hover:border-cyber-card-border"
    >
      <span className="text-[11px] font-mono text-cyber-text-muted w-12 shrink-0">
        {formatTime(entry.ts)}
      </span>
      <div
        className={`flex items-center gap-1.5 w-[76px] py-1 px-2 rounded-md ${config.bg} border border-cyber-card-border group-hover:border-transparent shrink-0`}
        title={config.label}
      >
        <Icon className={`w-3 h-3 ${config.color}`} />
        <span className={`text-[9px] font-bold uppercase tracking-wider ${config.color}`}>
          {config.label}
        </span>
      </div>
      <span className="text-xs text-cyber-text-secondary truncate group-hover:text-cyber-text-primary transition-colors font-mono">
        {entry.file}
      </span>
      {entry.size != null && (
        <span className="text-[10px] text-cyber-text-muted ml-auto shrink-0">
          {entry.size > 1024
            ? `${(entry.size / 1024).toFixed(1)}KB`
            : `${entry.size}B`}
        </span>
      )}
    </motion.div>
  );
}
