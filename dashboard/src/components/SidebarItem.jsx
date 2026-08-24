import React from 'react';
import { GripVertical } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 350, damping: 26 } }
};

export default function SidebarItem({ p, selectedId, onSelect, isSearching, isCollapsed }) {
  const isSelected = selectedId === p.id;
  const progress = p.progress?.overall?.percentage || 0;
  const dragControls = useDragControls();

  let statusColor = 'bg-zinc-500';
  if (!p.isInstalled) statusColor = 'bg-rose-400/80';
  else if (progress === 100) statusColor = 'bg-emerald-400/90 shadow-[0_0_6px_rgba(52,211,153,0.4)]';
  else if (progress > 0) statusColor = 'bg-amber-400/90 shadow-[0_0_6px_rgba(251,191,36,0.4)]';

  const initials = (p.name || 'P')
    .split(/[-_\s]+/)
    .map(part => part[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (isCollapsed) {
    return (
      <Reorder.Item
        key={p.id}
        value={p}
        className="relative group flex justify-center py-0.5"
        as="li"
        variants={itemVariants}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        dragListener={false}
      >
        <button
          onClick={() => onSelect(p.id)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center relative transition-all duration-200 cursor-pointer select-none ${
            isSelected
              ? 'bg-white/[0.12] border border-white/25 text-white font-bold shadow-sm ring-1 ring-white/10'
              : 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-400 hover:text-white'
          }`}
          title={p.name}
        >
          {isSelected && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-4.5 w-1 bg-white/90 rounded-r-full shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
          )}

          <span className="text-xs font-mono font-bold tracking-wider">{initials}</span>
          <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${statusColor} ring-2 ring-[#0a0a0c]`} />
        </button>

        <div className="pointer-events-none absolute left-13 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
          <div className="bg-[#0e0e11]/95 border border-white/[0.12] backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-2 whitespace-nowrap">
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
            <span className="font-semibold text-zinc-100">{p.name}</span>
            {p.isInstalled && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-300 font-bold">
                {progress}%
              </span>
            )}
          </div>
        </div>
      </Reorder.Item>
    );
  }

  return (
    <Reorder.Item
      key={p.id}
      value={p}
      className="relative"
      as="li"
      variants={itemVariants}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      dragListener={false}
      dragControls={dragControls}
    >
      <div
        onClick={() => onSelect(p.id)}
        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all duration-200 relative overflow-hidden group cursor-pointer select-none min-h-[2.5rem] active:scale-[0.99] ${
          isSelected
            ? 'bg-white/[0.06] border border-white/[0.12] text-white shadow-sm ring-1 ring-white/[0.05]'
            : 'hover:bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-transparent hover:border-white/[0.05]'
        }`}
      >
        {isSelected && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4.5 w-1 bg-white/90 rounded-r-full shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
        )}

        <div className="flex items-center gap-2.5 overflow-hidden flex-1 py-0.5 pointer-events-auto">
          {!isSearching && (
            <div
              className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-300 p-0.5 -ml-1 rounded shrink-0 transition-opacity opacity-0 group-hover:opacity-100 touch-none"
              onPointerDown={(e) => {
                e.stopPropagation();
                dragControls.start(e);
              }}
              onClick={(e) => e.stopPropagation()}
              title="Drag to reorder"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}

          <div className={`w-1.5 h-1.5 rounded-full ${statusColor} shrink-0`} />

          <span
            className={`truncate text-xs sm:text-[13px] tracking-tight transition-colors ${
              isSelected ? 'font-semibold text-white' : 'font-medium text-zinc-300 group-hover:text-white'
            }`}
          >
            {p.name}
          </span>
        </div>

        {p.isInstalled && (
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ml-2 transition-all border tabular-nums ${
              isSelected
                ? 'bg-white/[0.10] text-white border-white/[0.15] font-bold shadow-sm'
                : 'bg-white/[0.02] border-white/[0.04] text-zinc-500 group-hover:text-zinc-400'
            }`}
          >
            {progress}%
          </span>
        )}
      </div>
    </Reorder.Item>
  );
}
