import React from 'react';
import { motion } from 'framer-motion';

export default function IssueFilterTabs({ categories = [], activeTab, setActiveTab }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl backdrop-blur-md">
      {categories.map((category) => {
        const isActive = activeTab === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`relative px-3 py-1.5 text-xs font-mono font-medium rounded-lg whitespace-nowrap transition-colors duration-150 flex items-center gap-2 z-10 cursor-pointer ${
              isActive ? 'text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilterTab"
                className="absolute inset-0 bg-white/[0.08] border border-white/15 rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{category.label}</span>
            {category.count > 0 && (
              <span className={`relative z-10 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold tabular-nums ${
                isActive ? 'bg-white/15 text-zinc-100' : 'bg-white/[0.04] text-zinc-500'
              }`}>
                {category.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
