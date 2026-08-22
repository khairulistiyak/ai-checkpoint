import React from 'react';
import { GripVertical } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function SidebarItem({ p, selectedId, onSelect, isSearching, isCollapsed }) {
  const isSelected = selectedId === p.id;
  const progress = p.progress?.overall?.percentage || 0;
  const dragControls = useDragControls();

  let statusColor = 'bg-emerald-400';
  if (!p.isInstalled) statusColor = 'bg-rose-400';
  else if (progress === 100) statusColor = 'bg-cyan-400';
  else if (progress > 0) statusColor = 'bg-amber-400';

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
        className="relative group flex justify-center py-1"
        as="li"
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        dragListener={false}
      >
        <button
          onClick={() => onSelect(p.id)}
          className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all duration-200 cursor-pointer select-none ${
            isSelected
              ? 'bg-gradient-to-br from-white/20 to-white/5 border border-white/30 text-white font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-1 ring-white/20'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-white'
          }`}
          title={p.name}
        >
          {isSelected && (
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          )}

          <span className="text-xs font-mono font-bold tracking-wider">{initials}</span>

          {/* Status Indicator Dot */}
          <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${statusColor} ring-2 ring-[#09090b] shadow-sm`} />
        </button>

        {/* Floating Tooltip for Mini Collapsed Mode */}
        <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
          <div className="bg-[#09090b]/95 border border-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 whitespace-nowrap">
            <span className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className="font-semibold text-white">{p.name}</span>
            {p.isInstalled && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-zinc-300 font-bold">
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
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      dragListener={false}
      dragControls={dragControls}
    >
      <div
        onClick={() => onSelect(p.id)}
        className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between transition-all duration-200 relative overflow-hidden group cursor-pointer select-none min-h-[2.75rem] active:scale-[0.99] ${
          isSelected
            ? 'bg-gradient-to-r from-white/[0.12] to-white/[0.04] border border-white/20 text-white font-semibold shadow-md ring-1 ring-white/10'
            : 'hover:bg-white/[0.05] text-zinc-400 hover:text-white border border-transparent hover:border-white/10'
        }`}
      >
        {isSelected && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        )}
        <div className="flex items-center gap-3 overflow-hidden flex-1 py-0.5 pointer-events-auto">
          {!isSearching && (
            <div
              className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-300 p-1 -ml-1 rounded shrink-0 transition-colors touch-none"
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
          <div
            className={`w-2 h-2 rounded-full ${statusColor} shrink-0 opacity-90 group-hover:opacity-100 transition-opacity shadow-sm`}
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
                ? 'bg-white/20 text-white border-white/30 font-bold shadow-sm'
                : 'bg-white/[0.04] border-white/10 text-zinc-400 group-hover:bg-white/[0.08] group-hover:text-zinc-200'
            }`}
          >
            {progress}%
          </span>
        )}
      </div>
    </Reorder.Item>
  );
}
