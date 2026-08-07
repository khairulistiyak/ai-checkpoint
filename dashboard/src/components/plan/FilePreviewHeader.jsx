import React from 'react';
import { 
  ChevronLeft, ChevronRight, Layers, ChevronDown, 
  ListCollapse, Code, Edit3, Check, Copy, 
  Maximize2, Minimize2, X 
} from 'lucide-react';

export default function FilePreviewHeader({
  fileNames,
  filename,
  handlePrev,
  hasPrev,
  handleNext,
  hasNext,
  onSelectFile,
  lineCount,
  showToc,
  setShowToc,
  viewMode,
  setViewMode,
  copyContent,
  copied,
  isFullscreen,
  setIsFullscreen,
  onClose
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10 bg-[#0c0c0f] shrink-0">
      {/* File Info & Navigation Controls */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Prev / Next Plan Buttons */}
        {fileNames.length > 1 && (
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 shrink-0">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className={`p-1 rounded text-white transition-colors ${
                hasPrev ? 'hover:bg-white/10 text-white cursor-pointer' : 'text-white/20 cursor-not-allowed'
              }`}
              title="Previous Plan blueprint ([)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className={`p-1 rounded text-white transition-colors ${
                hasNext ? 'hover:bg-white/10 text-white cursor-pointer' : 'text-white/20 cursor-not-allowed'
              }`}
              title="Next Plan blueprint (])"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-2 rounded-xl bg-white/10 border border-white/20 text-white shrink-0 shadow-inner hidden sm:flex">
          <Layers className="w-4 h-4 text-white" />
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {fileNames && fileNames.length > 1 ? (
              <div className="relative inline-flex items-center">
                <select
                  value={filename}
                  onChange={(e) => onSelectFile && onSelectFile(e.target.value)}
                  className="bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-mono font-bold rounded-lg px-2.5 py-1 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-white/40 transition-colors"
                  title="Switch Architectural Plan Blueprint"
                >
                  {fileNames.map((name) => (
                    <option key={name} value={name} className="bg-[#121215] text-white">
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-white/50 absolute right-2 pointer-events-none" />
              </div>
            ) : (
              <span className="text-sm sm:text-base font-mono font-bold text-white tracking-tight truncate">
                {filename}
              </span>
            )}
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-[10px] font-mono font-bold uppercase tracking-wider">
              Architect Studio
            </span>
          </div>
          <span className="text-[11px] font-mono text-white/50 hidden sm:inline">
            {lineCount} lines • Architectural Execution Command Center
          </span>
        </div>
      </div>

      {/* Action Center */}
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
                ? 'bg-white text-black font-bold shadow-md'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Copy Full Plan */}
        <button
          onClick={copyContent}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-mono transition-all cursor-pointer shadow-sm"
          title="Copy entire plan markdown"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-all cursor-pointer shadow-sm hidden sm:flex items-center justify-center"
          title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/30 text-white hover:text-red-300 transition-all cursor-pointer shadow-sm font-mono text-xs font-bold"
          title="Close Modal (Esc)"
        >
          <X className="w-4 h-4" />
          <span>ESC</span>
        </button>
      </div>
    </div>
  );
}
