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
      className={`relative px-3.5 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer select-none group ${
        isActive
          ? `${tab.activeText} font-bold z-10`
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
      }`}
    >
      {/* Sliding Active Indicator Pill */}
      {isActive && (
        <motion.div
          layoutId="projectTabActiveIndicator"
          className={`absolute inset-0 rounded-xl bg-white/[0.06] border ${tab.glowBorder} shadow-lg backdrop-blur-md -z-10`}
          style={{
            boxShadow: `0 0 20px -3px ${tab.accentColor}25, 0 0 0 1px ${tab.accentColor}30`
          }}
          transition={{ type: 'spring', stiffness: 480, damping: 36 }}
        />
      )}

      {/* Icon with glow & active accent */}
      <div className={`relative flex items-center justify-center transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
        <Icon
          className={`w-4 h-4 transition-colors duration-200 ${
            isActive ? tab.activeText : 'text-zinc-400 group-hover:text-zinc-200'
          }`}
        />
        {isActive && (
          <span
            className="absolute inset-0 blur-sm opacity-50 -z-10"
            style={{ color: tab.accentColor }}
          >
            <Icon className="w-4 h-4" />
          </span>
        )}
      </div>

      {/* Tab Label */}
      <span className="tracking-tight whitespace-nowrap">
        {tab.label}
      </span>

      {/* Smart Badge */}
      {tab.badge !== undefined && (
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-all duration-200 border ${
            isActive
              ? tab.badgeStyle
              : 'bg-white/[0.04] text-zinc-400 border-white/[0.06] group-hover:text-zinc-300'
          }`}
        >
          {tab.badge}
        </span>
      )}

      {/* Hotkey Indicator Tag */}
      <span className="hidden lg:inline-block text-[9px] px-1 py-0.2 rounded font-mono text-zinc-500 bg-white/[0.02] border border-white/[0.04] opacity-60 group-hover:opacity-100 transition-opacity">
        {tab.hotkey}
      </span>
    </button>
  );
}
