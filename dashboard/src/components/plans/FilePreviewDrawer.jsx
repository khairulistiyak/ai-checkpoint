import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCode, X, Loader2, Copy, Check, Terminal, Layers, Code } from 'lucide-react';
import * as api from '../../utils/api';
import ArchitecturalPlanViewer from './ArchitecturalPlanViewer';

export default function FilePreviewDrawer({ projectId, filename, onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('architect'); // 'architect' | 'raw'

  useEffect(() => {
    if (!filename) return;
    setLoading(true);
    api.fetchPlanFileContent(projectId, filename)
      .then(res => setContent(res.content || ''))
      .catch(() => setContent('// Failed to read file content'))
      .finally(() => setLoading(false));
  }, [projectId, filename]);

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = content ? content.split('\n').length : 0;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
      className="flex-1 w-full border-l border-white/10 bg-[#05070c]/98 backdrop-blur-3xl flex flex-col overflow-hidden shadow-2xl z-30"
    >
      {/* Drawer Header with Architectural Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-black/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-mono font-bold text-white truncate">{filename}</span>
            <span className="text-[11px] font-mono text-white/50">{lineCount} lines • Plan Artifact</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Architect vs Raw */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <button
              onClick={() => setViewMode('architect')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                viewMode === 'architect' 
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architect View</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                viewMode === 'raw' 
                  ? 'bg-white/10 text-white font-bold border border-white/15 shadow-sm' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Raw Code</span>
            </button>
          </div>

          <button
            onClick={copyContent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-mono transition-all"
            title="Copy entire markdown content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-cyber-dark">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-white/50">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-xs font-mono">Loading architectural specification...</span>
          </div>
        ) : viewMode === 'architect' ? (
          /* Architectural Spec View */
          <div className="max-w-4xl mx-auto">
            <ArchitecturalPlanViewer content={content} filename={filename} />
          </div>
        ) : (
          /* Raw Markdown Code View */
          <div className="flex gap-4 font-mono text-xs leading-relaxed max-w-4xl mx-auto bg-black/40 p-6 rounded-2xl border border-white/5">
            <div className="select-none text-white/20 text-right font-mono text-xs space-y-0.5 min-w-[2rem]">
              {content.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <pre className="text-slate-200 whitespace-pre-wrap flex-1 text-xs space-y-0.5 overflow-x-auto">
              {content}
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  );
}
