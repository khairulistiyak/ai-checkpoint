import React from 'react';
import { motion } from 'framer-motion';

export default function IssueFilterTabs({ categories = [], activeTab, setActiveTab }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl">
      {categories.map((category) => {
        const isActive = activeTab === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors duration-200 flex items-center gap-2 z-10 ${
              isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilterTab"
                className="absolute inset-0 bg-indigo-600/80 border border-indigo-400/40 rounded-xl shadow-lg shadow-indigo-500/20"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{category.label}</span>
            {category.count > 0 && (
              <span className={`relative z-10 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'
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
