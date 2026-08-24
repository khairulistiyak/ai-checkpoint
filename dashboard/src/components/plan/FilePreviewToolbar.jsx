import React from 'react';
import { Layers, Code, Edit3, ListCollapse } from 'lucide-react';

export default function FilePreviewToolbar({ showToc, setShowToc, viewMode, setViewMode }) {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
      {/* TOC Toggle */}
      <button
        onClick={() => setShowToc(!showToc)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
          showToc
            ? 'bg-cyber-accent/10 text-cyber-accent border-cyber-accent/30 shadow-[0_0_10px_rgba(var(--cyber-accent-rgb),0.1)]'
            : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/10'
        }`}
        title="Toggle Table of Contents Minimap (O)"
      >
        <ListCollapse className="w-3.5 h-3.5" />
        <span className="hidden md:inline">TOC Outline</span>
      </button>

      {/* View Mode Toggle: Architect vs Raw vs Edit */}
      <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
        <button
          onClick={() => setViewMode('architect')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
            viewMode === 'architect'
              ? 'bg-cyber-accent/10 text-cyber-accent font-bold border border-cyber-accent/30 shadow-[0_0_10px_rgba(var(--cyber-accent-rgb),0.15)]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Architect</span>
        </button>
        <button
          onClick={() => setViewMode('raw')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
            viewMode === 'raw'
              ? 'bg-white/15 text-white font-bold border border-white/30 shadow-sm'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Raw</span>
        </button>
        <button
          onClick={() => setViewMode('edit')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
            viewMode === 'edit'
              ? 'bg-cyber-accent/10 text-cyber-accent font-bold border border-cyber-accent/30 shadow-[0_0_10px_rgba(var(--cyber-accent-rgb),0.15)]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
}
