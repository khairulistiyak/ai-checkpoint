import React, { useState } from 'react';
import { Copy, Check, CheckCheck } from 'lucide-react';
import IssueCard from './IssueCard';
import { buildSurgicalFixPrompt, buildBulkIssuesPrompt } from '../../utils/prompt-builder';
import { useToast } from '../ToastProvider';

export default function HealthIssueExplorer({
  issues = [],
  filteredIssues = [],
  categoryCounts = {},
  activeCategory = 'all',
  setActiveCategory,
  onOpenInIde
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { showToast } = useToast();

  const handleCopyIssue = (issue, idx) => {
    const prompt = buildSurgicalFixPrompt({
      file: issue.file || 'Project root',
      line: issue.line || 'N/A',
      severity: issue.severity || issue.type || 'info',
      type: issue.type || issue.category || 'diagnostic',
      message: issue.error || issue.msg || issue.message || 'Diagnostic issue detected',
      guidance: issue.guidance || issue.suggestion || ''
    });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(prompt);
      setCopiedIndex(idx);
      if (showToast) showToast('Diagnostic prompt copied!', 'success');
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleCopyAllPrompts = () => {
    if (navigator.clipboard) {
      const fullPrompt = buildBulkIssuesPrompt({
        category: activeCategory,
        issues: filteredIssues
      });
      navigator.clipboard.writeText(fullPrompt);
      setCopiedAll(true);
      if (showToast) showToast(`Copied ${filteredIssues.length} prompts for ${activeCategory}!`, 'success');
      setTimeout(() => setCopiedAll(false), 2000);
    }
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.04]">
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

          {filteredIssues.length > 0 && (
            <button
              onClick={handleCopyAllPrompts}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-zinc-100 text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
              title={`Copy fix prompts for ${activeCategory} section`}
            >
              {copiedAll ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-zinc-400" />}
              <span>{copiedAll ? 'Copied All!' : 'Copy Prompts'}</span>
            </button>
          )}
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
                : 'No issues match the selected category filter.'}
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
