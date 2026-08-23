import React, { useState } from 'react';
import { Search, CheckCheck } from 'lucide-react';
import IssueCard from './IssueCard';

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
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyIssue = (issue, idx) => {
    const prompt = `Please fix the following issue in my code:

File: ${issue.file || 'Project root'}
Line: ${issue.line || 'N/A'}
Severity: ${issue.severity || issue.type || 'info'}

Issue Description:
${issue.error || issue.msg || issue.message || 'Diagnostic issue detected'}

Please provide the corrected code or explain how to resolve this.`;

    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const categories = [
    { id: 'all', label: 'All', count: categoryCounts.all },
    { id: 'security', label: 'Security', count: categoryCounts.security },
    { id: 'rule0', label: 'Rule 0', count: categoryCounts.rule0 },
    { id: 'syntax', label: 'Syntax', count: categoryCounts.syntax },
    { id: 'hygiene', label: 'Hygiene', count: categoryCounts.hygiene },
    { id: 'complexity', label: 'Complexity', count: categoryCounts.complexity },
    { id: 'structure', label: 'Structure', count: categoryCounts.structure },
  ];

  return (
    <div className="bg-[#121214] border border-white/[0.04] rounded-3xl p-6 relative overflow-hidden">
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar p-1 bg-white/[0.02] border border-white/[0.04] rounded-2xl mask-edges">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                }`}
              >
                <span>{cat.label}</span>
                {cat.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    activeCategory === cat.id ? 'bg-white/10 text-zinc-300' : 'bg-white/5 text-zinc-500'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 lg:w-72 shrink-0 group">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-zinc-300" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-zinc-200 placeholder-zinc-600 text-xs font-mono focus:outline-none focus:border-white/10 focus:bg-white/[0.04] transition-all"
            />
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <CheckCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white font-outfit">No Issues Found</h3>
            <p className="text-xs font-mono text-zinc-400 max-w-sm mx-auto">
              {issues.length === 0
                ? 'Your workspace is in pristine condition! All health, syntax, and Rule 0 tests passed.'
                : 'No issues match the selected category or search filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[37.5rem] overflow-y-auto custom-scrollbar pr-2 pb-2">
            {filteredIssues.map((issue, idx) => (
              <IssueCard
                key={idx}
                issue={issue}
                index={idx}
                isCopied={copiedIndex === idx}
                onCopy={() => handleCopyIssue(issue, idx)}
                onOpenInIde={onOpenInIde}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
