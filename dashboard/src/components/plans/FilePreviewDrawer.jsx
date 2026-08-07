import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCode, X, Loader2, Copy, Check, Layers, Code,
  Maximize2, Minimize2, ChevronDown, ChevronLeft, ChevronRight,
  Edit3, ListCollapse, Search, Eye, Terminal, Sparkles
} from 'lucide-react';
import * as api from '../../utils/api';
import ArchitecturalPlanViewer from './ArchitecturalPlanViewer';
import PlanMarkdownEditor from './PlanMarkdownEditor';

export default function FilePreviewDrawer({
  projectId,
  filename,
  allFiles = [],
  onSelectFile,
  onClose
}) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('architect'); // 'architect' | 'raw' | 'edit'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(true);
  const [tocSearch, setTocSearch] = useState('');

  // Load content
  const loadPlanContent = () => {
    if (!filename) return;
    setLoading(true);
    api.fetchPlanFileContent(projectId, filename)
      .then(res => setContent(res.content || ''))
      .catch(() => setContent('// Failed to read file content'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlanContent();
  }, [projectId, filename]);

  // Lock background body scroll while modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Compute file index for prev/next
  const fileNames = useMemo(() => {
    return allFiles.map(f => (typeof f === 'string' ? f : f.name));
  }, [allFiles]);

  const currentIndex = fileNames.indexOf(filename);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < fileNames.length - 1;

  const handlePrev = () => {
    if (hasPrev && onSelectFile) {
      onSelectFile(fileNames[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectFile) {
      onSelectFile(fileNames[currentIndex + 1]);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept typing if user is in an input/textarea
      const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

      if (e.key === 'Escape') {
        if (onClose) onClose();
      } else if (!isInput && e.key === '[') {
        handlePrev();
      } else if (!isInput && e.key === ']') {
        handleNext();
      } else if (!isInput && (e.key === 'f' || e.key === 'F')) {
        setIsFullscreen(prev => !prev);
      } else if (!isInput && (e.key === 'o' || e.key === 'O')) {
        setShowToc(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, fileNames, onClose, hasPrev, hasNext]);

  const handleSaveContent = async (newContent) => {
    setSaving(true);
    try {
      await api.savePlanFileContent(projectId, filename, newContent);
      setContent(newContent);
    } finally {
      setSaving(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = content ? content.split('\n').length : 0;

  // Extract Table of Contents items (H2 modules & H3 steps)
  const tocItems = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const items = [];
    let modIndex = 0;

    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        const title = line.slice(3).trim();
        items.push({
          type: 'module',
          id: `arch-mod-${modIndex}`,
          index: modIndex,
          title
        });
        modIndex++;
      } else if (line.startsWith('### ')) {
        const title = line.slice(4).trim();
        items.push({
          type: 'step',
          title
        });
      }
    });
    return items;
  }, [content]);

  const filteredToc = useMemo(() => {
    if (!tocSearch) return tocItems;
    return tocItems.filter(item => item.title.toLowerCase().includes(tocSearch.toLowerCase()));
  }, [tocItems, tocSearch]);

  const scrollToElement = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const modalNode = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-2xl backdrop-saturate-150 overflow-hidden select-none sm:select-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className={`w-full flex flex-col bg-[#08080b]/98 border border-white/20 shadow-[0_0_90px_rgba(0,0,0,0.95)] overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 h-screen w-screen rounded-none border-0 z-[100000]'
            : 'h-[95vh] max-w-[1680px] rounded-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Studio Header */}
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
                {allFiles && allFiles.length > 1 ? (
                  <div className="relative inline-flex items-center">
                    <select
                      value={filename}
                      onChange={(e) => onSelectFile && onSelectFile(e.target.value)}
                      className="bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-mono font-bold rounded-lg px-2.5 py-1 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-white/40 transition-colors"
                      title="Switch Architectural Plan Blueprint"
                    >
                      {allFiles.map((f) => {
                        const name = typeof f === 'string' ? f : f.name;
                        return (
                          <option key={name} value={name} className="bg-[#121215] text-white">
                            {name}
                          </option>
                        );
                      })}
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

        {/* Modal Main Split Body Area */}
        <div className="flex-1 flex overflow-hidden bg-[#060608] relative">
          {/* Split-Screen TOC Outline Sidebar */}
          {showToc && viewMode === 'architect' && (
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
          )}

          {/* Main View Area */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-white/50">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span className="text-xs font-mono text-white/60">Loading architectural specification blueprint...</span>
              </div>
            ) : viewMode === 'architect' ? (
              /* Architectural Spec View */
              <div className="max-w-6xl mx-auto w-full">
                <ArchitecturalPlanViewer content={content} filename={filename} />
              </div>
            ) : viewMode === 'edit' ? (
              /* Live Blueprint Editor */
              <div className="h-full w-full max-w-6xl mx-auto min-h-[500px]">
                <PlanMarkdownEditor
                  initialContent={content}
                  filename={filename}
                  onSave={handleSaveContent}
                  saving={saving}
                />
              </div>
            ) : (
              /* Raw Markdown Code View */
              <div className="flex font-mono text-sm leading-relaxed max-w-6xl mx-auto bg-[#0d0d12]/95 backdrop-blur-3xl rounded-2xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden min-h-[500px]">
                <div className="select-none text-white/30 text-right font-mono text-xs bg-black/40 py-6 px-3 min-w-[3.5rem] border-r border-white/5 space-y-0.5">
                  {content.split('\n').map((_, i) => <div key={i} className="h-6 leading-6 opacity-70 hover:opacity-100 transition-opacity">{i + 1}</div>)}
                </div>
                <pre className="text-[#e2e8f0] whitespace-pre-wrap flex-1 py-6 px-6 text-sm leading-6 overflow-x-auto selection:bg-cyber-accent/30 selection:text-white custom-scrollbar">
                  {content}
                </pre>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalNode, document.body);
}
