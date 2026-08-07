import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Copy, Check, RotateCcw, Loader2 } from 'lucide-react';

export default function GitCommitCard({
  cp,
  idx,
  isLatest,
  isCopied,
  handleCopyHash,
  setConfirmHash,
  rollingBack
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(idx * 0.02, 0.2) }}
      className="flex items-start gap-2.5 group relative z-10"
    >
      {/* Sleek Node Dot */}
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1.5 z-10 transition-all bg-cyber-card border ${
          isLatest
            ? "border-cyber-accent"
            : "border-cyber-card-border group-hover:border-cyber-text-secondary"
        }`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${isLatest ? "bg-cyber-accent" : "bg-cyber-text-muted group-hover:bg-cyber-text-secondary"}`}
        />
      </div>

      {/* Card */}
      <div className="flex-1 bg-cyber-dark/30 border border-cyber-card-border rounded-xl p-2.5 group-hover:border-cyber-accent/20 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <button
              onClick={(e) => handleCopyHash(cp.hash, e)}
              title="Click to copy full commit hash"
              className="font-mono text-[10px] text-cyber-text-primary bg-cyber-accent/10 hover:bg-cyber-accent/20 px-1.5 py-0.5 rounded border border-cyber-accent/20 shrink-0 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{cp.hash.slice(0, 7)}</span>
              {isCopied ? (
                <Check className="w-2.5 h-2.5 text-workflow-success" />
              ) : (
                <Copy className="w-2.5 h-2.5 text-cyber-text-muted" />
              )}
            </button>

            {isLatest && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-workflow-success/10 text-workflow-success border border-workflow-success/20 font-bold uppercase tracking-wider">
                Latest Head
              </span>
            )}

            <span className="text-[10px] text-cyber-text-secondary flex items-center gap-1 shrink-0 font-mono">
              <Clock className="w-2.5 h-2.5 text-cyber-text-muted" />{" "}
              {cp.timeAgo || "recent"}
            </span>

            {cp.author && (
              <span className="text-[10px] text-cyber-text-muted truncate font-mono hidden md:inline">
                by {cp.author}
              </span>
            )}
          </div>

          <div
            className="text-cyber-text-primary text-xs font-mono break-words leading-relaxed flex items-start mt-1.5"
            title={cp.message}
          >
            {(() => {
              const m = cp.message.toLowerCase();
              let badge = null;
              if (m.includes('delete') || m.includes('remove') || m.includes('drop') || m.includes('rm ')) {
                badge = <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider mr-2 shrink-0">🗑️ Delete</span>;
              } else if (m.includes('add') || m.includes('create') || m.includes('new ') || m.includes('init') || m.includes('implement')) {
                badge = <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider mr-2 shrink-0">✨ Add</span>;
              } else if (m.includes('fix') || m.includes('resolve') || m.includes('patch')) {
                badge = <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold uppercase tracking-wider mr-2 shrink-0">🐛 Fix</span>;
              } else if (m.includes('update') || m.includes('modif') || m.includes('change') || m.includes('edit')) {
                badge = <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider mr-2 shrink-0">📝 Modify</span>;
              } else {
                badge = <span className="px-1.5 py-0.5 rounded bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 text-[9px] font-bold uppercase tracking-wider mr-2 shrink-0">📌 Commit</span>;
              }
              return (
                <>
                  {badge}
                  <span className="pt-0.5 leading-snug opacity-90">
                    {cp.message.replace(/^(?:aicp\/[^\s]+|checkpoint:)\s*/i, "")}
                  </span>
                </>
              );
            })()}
          </div>
        </div>

        <button
          onClick={() => setConfirmHash(cp.hash)}
          disabled={rollingBack}
          className="px-2.5 py-1 bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-300 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all border border-white/10 hover:border-red-500/30 flex items-center justify-center gap-1 shrink-0 self-end sm:self-auto w-full sm:w-auto cursor-pointer"
        >
          {rollingBack ? (
            <Loader2 className="w-3 h-3 animate-spin text-white" />
          ) : (
            <RotateCcw className="w-3 h-3" />
          )}
          <span>Rollback</span>
        </button>
      </div>
    </motion.div>
  );
}
