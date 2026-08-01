import React from 'react';
import { GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function SidebarItem({ p, selectedId, onSelect, isSearching }) {
  const isSelected = selectedId === p.id;
  const progress = p.progress?.overall?.percentage || 0;

  let statusColor = "bg-slate-600";
  if (!p.isInstalled) statusColor = "bg-red-500";
  else if (progress === 100) statusColor = "bg-emerald-500";
  else if (progress > 0) statusColor = "bg-blue-500";
  else statusColor = "bg-slate-400";

  return (
    <Reorder.Item
      key={p.id} value={p} className="relative" as="li"
      variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      dragListener={!isSearching}
    >
      <div className={`w-full text-left px-3 sm:px-3.5 lg:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl flex items-center justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer select-none min-h-[48px] sm:min-h-[44px] ${isSelected
        ? 'bg-cyber-accent/10 border border-cyber-accent text-cyber-text-primary shadow-[0_0_20px_rgba(255,255,255,0.05)]'
        : 'hover:bg-white/[0.04] text-cyber-text-secondary border border-transparent hover:border-cyber-card-border hover:translate-x-1'
        }`}
      >
        {isSelected && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-cyber-text-primary shadow-[0_0_12px_rgba(255,255,255,0.8)] rounded-r-full" />
        )}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1 py-0.5" onClick={() => onSelect(p.id)}>
          {!isSearching && (
            <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1 sm:-ml-1.5 rounded shrink-0" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shrink-0 shadow-[0_0_8px_currentColor] opacity-80 group-hover:opacity-100 transition-opacity`} />
          <span className={`truncate font-medium text-sm md:text-[13px] lg:text-sm tracking-wide group-hover:text-cyber-text-primary transition-colors ${isSelected ? 'font-bold' : ''}`}>
            {p.name}
          </span>
        </div>
        {p.isInstalled && (
          <span className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 sm:py-1 rounded-md shrink-0 ml-2 transition-all border ${isSelected ? 'bg-cyber-accent/20 border-cyber-accent text-cyber-text-primary shadow-inner' : 'bg-white/[0.03] border-white/5 text-cyber-text-muted group-hover:bg-white/[0.08] group-hover:text-cyber-text-secondary'}`}>
            {progress}%
          </span>
        )}
      </div>
    </Reorder.Item>
  );
}
