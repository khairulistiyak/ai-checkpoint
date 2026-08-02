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

  let statusColor = "bg-white/40";
  if (!p.isInstalled) statusColor = "bg-red-400";
  else if (progress === 100) statusColor = "bg-white";
  else if (progress > 0) statusColor = "bg-white/80";

  return (
    <Reorder.Item
      key={p.id} value={p} className="relative" as="li"
      variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      dragListener={!isSearching}
    >
      <div className={`w-full text-left px-3 sm:px-3.5 lg:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl flex items-center justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer select-none min-h-[48px] sm:min-h-[44px] ${isSelected
        ? 'bg-white/10 border border-white text-white shadow-md'
        : 'hover:bg-white/[0.04] text-white/60 hover:text-white border border-transparent hover:border-white/10 hover:translate-x-1'
        }`}
      >
        {isSelected && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] rounded-r-full" />
        )}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1 py-0.5" onClick={() => onSelect(p.id)}>
          {!isSearching && (
            <div className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white/70 p-1 sm:-ml-1.5 rounded shrink-0" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`} />
          <span className={`truncate font-medium text-sm md:text-[13px] lg:text-sm tracking-wide group-hover:text-white transition-colors ${isSelected ? 'font-bold text-white' : ''}`}>
            {p.name}
          </span>
        </div>
        {p.isInstalled && (
          <span className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 sm:py-1 rounded-md shrink-0 ml-2 transition-all border ${isSelected ? 'bg-white text-zinc-950 border-white font-bold shadow-inner' : 'bg-white/[0.03] border-white/10 text-white/60 group-hover:bg-white/[0.08] group-hover:text-white'}`}>
            {progress}%
          </span>
        )}
      </div>
    </Reorder.Item>
  );
}
