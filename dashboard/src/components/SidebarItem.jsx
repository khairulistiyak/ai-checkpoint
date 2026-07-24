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
      <div className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer ${isSelected
        ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/10 border border-primary-500/30 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]'
        : 'hover:bg-white/[0.04] text-slate-400 border border-transparent hover:border-white/[0.05] hover:translate-x-1'
        }`}
      >
        {isSelected && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-gradient-to-b from-primary-400 to-accent-400 shadow-[0_0_12px_rgba(217,70,239,0.8)] rounded-r-full" />
        )}
        <div className="flex items-center gap-3 overflow-hidden flex-1" onClick={() => onSelect(p.id)}>
          <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1 -ml-2 rounded" onPointerDown={(e) => e.stopPropagation()}>
            <GripVertical className="w-4 h-4" />
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shrink-0 shadow-[0_0_8px_currentColor] opacity-80 group-hover:opacity-100 transition-opacity`} />
          <span className={`truncate font-medium text-[13px] tracking-wide group-hover:text-white transition-colors ${isSelected ? 'font-bold' : ''}`}>
            {p.name}
          </span>
        </div>
        {p.isInstalled && (
          <span className={`text-[10px] font-mono px-2 py-1 rounded-md transition-all border ${isSelected ? 'bg-primary-500/30 border-primary-500/40 text-primary-200 shadow-inner' : 'bg-white/[0.03] border-white/5 text-slate-500 group-hover:bg-white/[0.08] group-hover:text-slate-300'}`}>
            {progress}%
          </span>
        )}
      </div>
    </Reorder.Item>
  );
}
