import React from 'react';
import { motion } from 'framer-motion';

export default function IssueFilterTabs({ categories, activeTab, setActiveTab }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar mask-edges">
      {categories.map((category) => {
        const isActive = activeTab === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`relative px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors duration-300 ${
              isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200 bg-white/5 hover:bg-white/10'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className={`absolute inset-0 rounded-full ${category.color} opacity-20`}
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {isActive && (
              <motion.div
                layoutId="activeTabBorder"
                className={`absolute inset-0 rounded-full border ${category.borderColor}`}
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {category.label}
              {category.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] uppercase font-bold ${isActive ? 'bg-black/20' : 'bg-white/10'}`}>
                  {category.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
