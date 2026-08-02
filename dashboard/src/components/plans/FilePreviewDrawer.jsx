import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCode, X, Loader2, Copy, Check, Terminal } from 'lucide-react';
import * as api from '../../utils/api';

export default function FilePreviewDrawer({ projectId, filename, onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
      className="w-full lg:w-[48%] border-l border-cyber-card-border/60 bg-[#090a0e]/95 backdrop-blur-2xl flex flex-col overflow-hidden shrink-0 shadow-2xl z-30"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyber-card-border/40 bg-cyber-card/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30 text-cyber-accent">
            <FileCode className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-mono font-bold text-cyber-text-primary truncate">{filename}</span>
            <span className="text-[10px] font-mono text-cyber-text-muted">{lineCount} lines</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyContent}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-cyber-text-secondary hover:text-cyber-text-primary text-[10px] font-mono transition-all"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-cyber-text-muted hover:text-cyber-text-primary hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Container */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-[#050608] font-mono text-xs leading-relaxed relative">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2 text-cyber-text-muted">
            <Loader2 className="w-5 h-5 animate-spin text-cyber-accent" />
            <span className="text-xs font-mono">Reading artifact...</span>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="select-none text-cyber-text-muted/30 text-right font-mono text-[11px] space-y-0.5 min-w-[2rem]">
              {content.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <pre className="text-slate-200 whitespace-pre-wrap flex-1 text-[11px] space-y-0.5 overflow-x-auto">
              {content}
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  );
}
