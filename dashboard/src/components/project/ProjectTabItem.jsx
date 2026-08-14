import React from 'react';
import { motion } from 'framer-motion';

export default function ProjectTabItem({
  tab,
  isActive,
  onClick
}) {
  const Icon = tab.icon;

  return (
    <button
      onClick={onClick}
      aria-label={tab.label}
      className={`relative px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer select-none shrink-0 ${
        isActive
          ? 'text-white font-semibold z-10'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
      }`}
    >
      {/* Active Indicator Pill */}
      {isActive && (
        <motion.div
          layoutId="projectTabActiveIndicator"
          className="absolute inset-0 rounded-xl bg-white/[0.1] border border-white/15 shadow-sm -z-10"
          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
        />
      )}

      {/* Tab Icon */}
      <Icon
        className={`w-4 h-4 transition-colors duration-200 ${
          isActive ? tab.activeText || 'text-white' : 'text-zinc-400'
        }`}
      />

      {/* Tab Label */}
      <span className={`tracking-tight whitespace-nowrap ${
        isActive ? 'inline-block' : 'hidden sm:inline-block'
      }`}>
        {tab.label}
      </span>

      {/* Tab Badge */}
      {tab.badge !== undefined && (
        <span
          className={`text-[10px] px-2 py-0.5 rounded-md font-mono border transition-all ${
            isActive
              ? 'bg-white/15 text-white border-white/20 font-bold'
              : 'bg-white/[0.03] text-zinc-500 border-white/10'
          }`}
        >
          {tab.badge}
        </span>
      )}
    </button>
  );
}
