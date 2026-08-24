import React, { useState, useMemo } from 'react';
import { Copy, Check, CheckCheck } from 'lucide-react';
import IssueFilterTabs from './IssueFilterTabs';
import ActionableIssueCard from './ActionableIssueCard';
import { useToast } from '../ToastProvider';
import { buildSurgicalFixPrompt, buildBulkIssuesPrompt } from '../../utils/prompt-builder';

const DEFAULT_CATEGORIES = [
  { id: 'responsive', label: 'Responsive' },
  { id: 'dynamic', label: 'Dynamic' },
  { id: 'performance', label: 'Performance' },
  { id: 'a11y', label: 'A11y' },
  { id: 'security', label: 'Security' },
];

export default function ActionableIssuesList({ issues = [], categories = DEFAULT_CATEGORIES, projectId, onOpenInIde, className = '' }) {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { showToast } = useToast();

  const filterCategories = useMemo(() => {
    const base = [{ id: 'all', label: 'All', count: issues.length }];
    const cats = categories.map(cat => ({ ...cat, count: issues.filter(i => (i.type === cat.id || i.category === cat.id)).length }));
    return [...base, ...cats.filter(c => c.count > 0)];
  }, [issues, categories]);

  const filteredIssues = useMemo(() => {
    if (activeTab === 'all') return issues;
    return issues.filter(i => (i.type === activeTab || i.category === activeTab));
  }, [issues, activeTab]);

  const handleCopyPrompt = (issue, index) => {
    if (navigator.clipboard) {
      const fullText = buildSurgicalFixPrompt({
        file: issue.file || 'General',
        line: issue.line || 'N/A',
        severity: issue.severity || issue.type || 'info',
        type: issue.type || issue.category || 'diagnostic',
        message: issue.message || issue.error || issue.msg || 'Diagnostic issue detected',
        guidance: issue.guidance || ''
      });
      navigator.clipboard.writeText(fullText);
      setCopiedId(index);
      showToast("Diagnostic prompt copied!", "success");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyAllPrompts = () => {
    if (navigator.clipboard) {
      const fullPrompt = buildBulkIssuesPrompt({ category: activeTab, issues: filteredIssues });
      navigator.clipboard.writeText(fullPrompt);
      setCopiedAll(true);
      showToast(`Copied ${filteredIssues.length} prompts!`, "success");
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleOpenTargetIde = async (filePath, line = 1) => {
    if (!filePath) return showToast("No target file specified", "warning");
    if (onOpenInIde) return onOpenInIde(filePath, line);
    try {
      const fileName = filePath.split('/').pop() || filePath;
      showToast(`Opening ${fileName} in IDE...`, "info");
      const res = await fetch('/api/open-in-ide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filePath, line, projectId }) }).then(r => r.json()).catch(() => null);
      if (!res?.opened && res?.url) window.location.href = res.url;
    } catch {
      window.location.href = `vscode://file/${filePath}${line ? `:${line}` : ''}`;
    }
  };

  return (
    <div className={`bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden ${className}`}>
      <div className="relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.04]">
          <IssueFilterTabs categories={filterCategories} activeTab={activeTab} setActiveTab={setActiveTab} />
          {filteredIssues.length > 0 && (
            <button
              onClick={handleCopyAllPrompts}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-zinc-100 text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
            >
              {copiedAll ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-zinc-400" />}
              <span>{copiedAll ? 'Copied All!' : 'Copy Prompts'}</span>
            </button>
          )}
        </div>

        {filteredIssues.length === 0 ? (
          <div className="py-14 text-center space-y-2.5 bg-white/[0.01] rounded-xl border border-white/[0.04]">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-white font-mono">No Issues Detected</h3>
            <p className="text-xs font-mono text-zinc-500 max-w-sm mx-auto">
              All intelligence diagnostics and code quality checks passed.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[37.5rem] overflow-y-auto custom-scrollbar pr-1.5 pb-1">
            {filteredIssues.map((issue, idx) => (
              <ActionableIssueCard
                key={`${issue.type || 'issue'}-${idx}`}
                issue={issue}
                idx={idx}
                isCopied={copiedId === idx}
                onCopyPrompt={handleCopyPrompt}
                onOpenIde={handleOpenTargetIde}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
