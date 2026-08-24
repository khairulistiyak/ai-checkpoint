import React from 'react';
import { ChevronLeft, ChevronRight, Layers, ChevronDown, Check, Copy, Maximize2, Minimize2, X } from 'lucide-react';
import FilePreviewToolbar from './FilePreviewToolbar.jsx';

export default function FilePreviewHeader({
  fileNames, filename, handlePrev, hasPrev, handleNext, hasNext, onSelectFile,
  lineCount, showToc, setShowToc, viewMode, setViewMode,
  copyContent, copied, isFullscreen, setIsFullscreen, onClose
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/[0.06] bg-[#0b0c10] shrink-0">
      {/* File Info & Navigation Controls */}
      <div className="flex items-center gap-2.5 min-w-0">
        {fileNames.length > 1 && (
          <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5 shrink-0">
            <button onClick={handlePrev} disabled={!hasPrev} className={`p-1 rounded transition-colors ${hasPrev ? 'hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer' : 'text-zinc-600 cursor-not-allowed'}`} title="Previous Plan blueprint ([)">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleNext} disabled={!hasNext} className={`p-1 rounded transition-colors ${hasNext ? 'hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer' : 'text-zinc-600 cursor-not-allowed'}`} title="Next Plan blueprint (])">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 shrink-0 shadow-inner hidden sm:flex">
          <Layers className="w-4 h-4 text-zinc-300" />
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {fileNames && fileNames.length > 1 ? (
              <div className="relative inline-flex items-center">
                <select value={filename} onChange={(e) => onSelectFile && onSelectFile(e.target.value)} className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 text-xs sm:text-sm font-mono font-bold rounded-lg px-2.5 py-1 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-white/30 transition-colors" title="Switch Architectural Plan Blueprint">
                  {fileNames.map((name) => (<option key={name} value={name} className="bg-[#121215] text-zinc-200">{name}</option>))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 pointer-events-none" />
              </div>
            ) : (
              <span className="text-sm sm:text-base font-mono font-bold text-zinc-100 tracking-tight truncate">{filename}</span>
            )}
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider">Architect Studio</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">{lineCount} lines • Architectural Execution Command Center</span>
        </div>
      </div>

      {/* Action Center */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
        <FilePreviewToolbar showToc={showToc} setShowToc={setShowToc} viewMode={viewMode} setViewMode={setViewMode} />

        <button onClick={copyContent} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-all cursor-pointer shadow-sm" title="Copy entire plan markdown">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>

        <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 text-xs transition-all cursor-pointer shadow-sm hidden sm:flex items-center justify-center" title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}>
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        <button onClick={onClose} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-rose-500/15 border border-white/[0.08] hover:border-rose-500/30 text-zinc-400 hover:text-rose-300 transition-all cursor-pointer shadow-sm font-mono text-xs font-bold" title="Close Modal (Esc)">
          <X className="w-3.5 h-3.5" />
          <span>ESC</span>
        </button>
      </div>
    </div>
  );
}
