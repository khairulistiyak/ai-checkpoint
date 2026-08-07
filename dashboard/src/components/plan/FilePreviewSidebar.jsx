import React from 'react';
import { Search } from 'lucide-react';

export default function FilePreviewSidebar({
  showToc,
  viewMode,
  tocItems,
  filteredToc,
  tocSearch,
  setTocSearch,
  scrollToElement
}) {
  if (!showToc || viewMode !== 'architect') return null;

  return (
    <div className="w-64 lg:w-72 bg-[#09090c] border-r border-white/10 flex flex-col shrink-0 h-full overflow-hidden">
      <div className="p-3 border-b border-white/10 bg-[#0d0d10] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-white/60 font-bold">
          <span>Table of Contents</span>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded text-white/80">
            {tocItems.filter(t => t.type === 'module').length} Modules
          </span>
        </div>
        <div className="relative">
          <Search className="w-3 h-3 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter sections..."
            value={tocSearch}
            onChange={(e) => setTocSearch(e.target.value)}
            className="w-full pl-7 pr-2 py-1 rounded-lg bg-black border border-white/15 text-[11px] font-mono text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredToc.length === 0 ? (
          <div className="p-4 text-center text-white/30 text-xs font-mono">
            No matching sections
          </div>
        ) : (
          filteredToc.map((item, idx) => {
            if (item.type === 'module') {
              return (
                <button
                  key={idx}
                  onClick={() => scrollToElement(item.id)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono text-white/90 hover:text-white hover:bg-cyber-accent/10 hover:shadow-[0_0_10px_rgba(var(--cyber-accent-rgb),0.15)] transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span className="w-4 h-4 rounded bg-white/10 group-hover:bg-cyber-accent/20 group-hover:text-cyber-accent group-hover:border-cyber-accent/40 text-white text-[10px] font-bold flex items-center justify-center shrink-0 border border-white/15 transition-all">
                    {item.index + 1}
                  </span>
                  <span className="truncate font-semibold group-hover:text-cyber-accent transition-colors">{item.title}</span>
                </button>
              );
            }
            return (
              <div
                key={idx}
                className="pl-7 pr-2 py-1 text-[11px] font-mono text-white/50 truncate hover:text-white/80 transition-colors"
              >
                • {item.title}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
