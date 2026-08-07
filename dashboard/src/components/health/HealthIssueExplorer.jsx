import React from 'react';
import { motion } from 'framer-motion';
import { Search, FileCode, CheckCheck } from 'lucide-react';

export default function HealthIssueExplorer({
  issues,
  filteredIssues,
  categoryCounts,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  onOpenInIde
}) {
  return (
    <div className="bg-[#121214] border border-white/[0.08] rounded-3xl p-4 sm:p-6 space-y-4">
      {/* Filter Bar & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Issues', count: categoryCounts.all },
            { id: 'security', label: 'Security', count: categoryCounts.security },
            { id: 'rule0', label: 'Rule 0', count: categoryCounts.rule0 },
            { id: 'syntax', label: 'Syntax & Imports', count: categoryCounts.syntax },
            { id: 'hygiene', label: 'Hygiene', count: categoryCounts.hygiene },
            { id: 'complexity', label: 'Complexity', count: categoryCounts.complexity },
            { id: 'structure', label: 'Structure', count: categoryCounts.structure },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-white text-zinc-950 font-bold shadow-sm'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border border-white/5'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeCategory === cat.id ? 'bg-zinc-900 text-white' : 'bg-white/10 text-zinc-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter issues by file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-200 placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-white/30 transition-all"
          />
        </div>
      </div>

      {/* Issue List */}
      {filteredIssues.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white font-outfit">No Issues Found</h3>
          <p className="text-xs font-mono text-zinc-500 max-w-sm mx-auto">
            {issues.length === 0
              ? 'Your workspace is in pristine condition! All health, syntax, and Rule 0 tests passed.'
              : 'No issues match the selected category or search filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
          {filteredIssues.map((issue, idx) => {
            const isCrit = issue.severity === 'critical' || issue.type === 'syntax';
            const isRule0 = issue.type === 'rule0' || issue.category === 'rule0';
            const fileShort = (issue.file || '').replace(/\\/g, '/').split('/').slice(-3).join('/');

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-[#09090b] border border-white/[0.06] hover:border-white/[0.12] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5 ${
                    isCrit
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                      : isRule0
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                        : 'bg-white/5 border border-white/10 text-zinc-400'
                  }`}>
                    {issue.severity || issue.type || 'info'}
                  </span>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold font-mono text-zinc-200 truncate">
                        {fileShort || 'Project root'}
                      </span>
                      {issue.line > 0 && (
                        <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-1.5 py-0.2 rounded border border-white/5">
                          Line {issue.line}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-zinc-400 mt-1 leading-relaxed">
                      {issue.error || issue.msg || issue.message || 'Diagnostic issue detected'}
                    </p>
                  </div>
                </div>

                {issue.file && (
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onOpenInIde(issue.file, issue.line)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      title="Jump to file in IDE (VS Code / Cursor)"
                    >
                      <FileCode size={13} className="text-sky-400" />
                      <span>Open in IDE</span>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
