import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, FileCode } from 'lucide-react';

/**
 * IssueCard — Micro-component for individual health diagnostic issue row
 */
export default function IssueCard({ issue, index, isCopied, onCopy, onOpenInIde }) {
  const isCrit = issue.severity === 'critical' || issue.type === 'syntax';
  const isRule0 = issue.type === 'rule0' || issue.category === 'rule0';
  const fileShort = (issue.file || '').replace(/\\/g, '/').split('/').slice(-3).join('/');

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all group"
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5 ${
          isCrit
            ? 'bg-rose-500/10 text-rose-400'
            : isRule0
              ? 'bg-amber-500/10 text-amber-400'
              : 'bg-white/5 text-zinc-400'
        }`}>
          {issue.severity || issue.type || 'info'}
        </span>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold font-mono text-zinc-200 truncate">
              {fileShort || 'Project root'}
            </span>
            {issue.line > 0 && (
              <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-lg">
                Line {issue.line}
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1 leading-relaxed">
            {issue.error || issue.msg || issue.message || 'Diagnostic issue detected'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          onClick={onCopy}
          className="px-4 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white text-xs font-mono font-medium flex items-center gap-2 transition-all active:scale-95"
          title="Copy issue details and fix prompt"
        >
          {isCopied ? (
            <Check size={14} className="text-emerald-400" />
          ) : (
            <Copy size={14} className="text-zinc-500" />
          )}
          <span>{isCopied ? 'Copied!' : 'Copy Prompt'}</span>
        </button>

        {issue.file && (
          <button
            onClick={() => onOpenInIde(issue.file, issue.line)}
            className="px-4 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white text-xs font-mono font-medium flex items-center gap-2 transition-all active:scale-95"
            title="Jump to file in IDE (VS Code / Cursor)"
          >
            <FileCode size={14} className="text-zinc-500" />
            <span>Open in IDE</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
