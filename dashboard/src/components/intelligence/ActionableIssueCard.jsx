import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, FileCode } from 'lucide-react';

const BADGE_COLORS = {
  critical: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  security: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  rule0: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  performance: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  dynamic: 'bg-zinc-500/10 text-zinc-300 border border-zinc-500/20',
  responsive: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  a11y: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  hygiene: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  syntax: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  complexity: 'bg-zinc-500/10 text-zinc-300 border border-zinc-500/20',
  structure: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
};

export default function ActionableIssueCard({
  issue,
  idx,
  isCopied,
  onCopyPrompt,
  onOpenIde,
}) {
  const badgeKey = (issue.severity || issue.type || issue.category || 'info').toLowerCase();
  const badgeColor = BADGE_COLORS[badgeKey] || 'bg-white/[0.04] text-zinc-400 border border-white/[0.08]';
  const fileShort = (issue.file || '').replace(/\\/g, '/').split('/').slice(-3).join('/');
  const message = issue.message || issue.error || issue.msg || 'Diagnostic issue detected';

  return (
    <motion.div
      key={`${issue.type || 'issue'}-${idx}`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.015 }}
      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group"
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase shrink-0 mt-0.5 ${badgeColor}`}>
          {issue.severity || issue.type || 'info'}
        </span>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold font-mono text-zinc-200 truncate">
              {fileShort || 'Project root'}
            </span>
            {issue.line > 0 && (
              <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded">
                L{issue.line}
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        <button
          onClick={() => onCopyPrompt(issue, idx)}
          className="px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-400 hover:text-zinc-100 text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Copy issue details and fix prompt"
        >
          {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-zinc-400" />}
          <span>{isCopied ? 'Copied!' : 'Prompt'}</span>
        </button>
        {issue.file && (
          <button
            onClick={() => onOpenIde(issue.file, issue.line)}
            className="px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-400 hover:text-zinc-100 text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Jump to file in IDE"
          >
            <FileCode size={12} className="text-zinc-400" />
            <span>IDE</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
