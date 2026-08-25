import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, FileCode } from 'lucide-react';

const BADGE_COLORS = {
  critical: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  security: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  syntax: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  rule0: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  performance: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  dynamic: 'bg-white/5 text-zinc-400 border border-white/10',
  responsive: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  a11y: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  hygiene: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  complexity: 'bg-white/5 text-zinc-400 border border-white/10',
  structure: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  info: 'bg-white/5 text-zinc-400 border border-white/10',
};

export default function ActionableIssueCard({
  issue,
  idx,
  isCopied,
  onCopyPrompt,
  onOpenIde,
}) {
  const badgeKey = (issue.severity || issue.type || issue.category || 'info').toLowerCase();
  const badgeColor = BADGE_COLORS[badgeKey] || 'bg-white/5 text-zinc-400 border border-white/10';
  const fileShort = (issue.file || '').replace(/\\/g, '/').split('/').slice(-3).join('/');
  const message = issue.error || issue.msg || issue.message || 'Diagnostic issue detected';

  return (
    <motion.div
      key={`${issue.type || 'issue'}-${idx}`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.015 }}
      className="p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all group"
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5 ${badgeColor}`}>
          {issue.severity || issue.type || issue.category || 'info'}
        </span>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold font-mono text-zinc-200 truncate">
              {fileShort || 'Project root'}
            </span>
            {issue.line > 0 && (
              <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/[0.06]">
                Line {issue.line}
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          onClick={() => onCopyPrompt(issue, idx)}
          className="px-4 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-400 hover:text-white text-xs font-mono font-medium flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
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
            onClick={() => onOpenIde(issue.file, issue.line)}
            className="px-4 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-400 hover:text-white text-xs font-mono font-medium flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
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
