import React from 'react';

export default function IssueFilterTabs({ categories, activeTab, setActiveTab }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar p-1 bg-white/[0.02] border border-white/[0.04] rounded-2xl mask-edges">
      {categories.map((category) => {
        const isActive = activeTab === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
              isActive 
                ? 'bg-white/[0.08] text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
            }`}
          >
            <span>{category.label}</span>
            {category.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                isActive ? 'bg-white/10 text-zinc-300' : 'bg-white/5 text-zinc-500'
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
