import React from 'react';
import { GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function SidebarItem({ p, selectedId, onSelect, isSearching }) {
  const isSelected = selectedId === p.id;
  const progress = p.progress?.overall?.percentage || 0;

  let statusColor = 'bg-white/30';
  if (!p.isInstalled) statusColor = 'bg-rose-400/80';
  else if (progress === 100) statusColor = 'bg-white';
  else if (progress > 0) statusColor = 'bg-white/70';

  return (
    <Reorder.Item
      key={p.id}
      value={p}
      className="relative"
      as="li"
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      dragListener={!isSearching}
    >
      <div
        className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between transition-all duration-200 relative overflow-hidden group cursor-pointer select-none min-h-[44px] ${
          isSelected
            ? 'bg-white/[0.08] border border-white/15 text-white font-semibold shadow-sm'
            : 'hover:bg-white/[0.04] text-zinc-400 hover:text-white border border-transparent hover:border-white/10'
        }`}
      >
        {isSelected && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full" />
        )}
        <div
          className="flex items-center gap-3 overflow-hidden flex-1 py-0.5"
          onClick={() => onSelect(p.id)}
        >
          {!isSearching && (
            <div
              className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 p-1 -ml-1 rounded shrink-0"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}
          <div
            className={`w-2 h-2 rounded-full ${statusColor} shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}
          />
          <span
            className={`truncate text-xs sm:text-sm tracking-tight transition-colors ${
              isSelected ? 'font-bold text-white' : 'font-normal text-zinc-300 group-hover:text-white'
            }`}
          >
            {p.name}
          </span>
        </div>
        {p.isInstalled && (
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-md shrink-0 ml-2 transition-all border ${
              isSelected
                ? 'bg-white/15 text-white border-white/20 font-bold'
                : 'bg-white/[0.03] border-white/10 text-zinc-500 group-hover:bg-white/[0.06] group-hover:text-zinc-300'
            }`}
          >
            {progress}%
          </span>
        )}
      </div>
    </Reorder.Item>
  );
}
