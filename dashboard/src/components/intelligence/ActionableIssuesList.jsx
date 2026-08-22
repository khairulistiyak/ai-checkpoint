import React, { useState, useMemo } from 'react';
import { Copy, Check, CheckCheck } from 'lucide-react';
import IssueFilterTabs from './IssueFilterTabs';
import ActionableIssueCard from './ActionableIssueCard';
import { useToast } from '../ToastProvider';

const DEFAULT_CATEGORIES = [
  { id: 'responsive', label: 'Responsive' },
  { id: 'dynamic', label: 'Dynamic' },
  { id: 'performance', label: 'Performance' },
  { id: 'a11y', label: 'A11y' },
  { id: 'security', label: 'Security' },
];

export default function ActionableIssuesList({
  issues = [],
  categories = DEFAULT_CATEGORIES,
  projectId,
  onOpenInIde,
  className = ''
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { showToast } = useToast();

  const filterCategories = useMemo(() => {
    const base = [{ id: 'all', label: 'All', count: issues.length }];
    const cats = categories.map(cat => ({
      ...cat,
      count: issues.filter(i => (i.type === cat.id || i.category === cat.id)).length
    }));
    return [...base, ...cats.filter(c => c.count > 0)];
  }, [issues, categories]);

  const filteredIssues = useMemo(() => {
    if (activeTab === 'all') return issues;
    return issues.filter(i => (i.type === activeTab || i.category === activeTab));
  }, [issues, activeTab]);

  const handleCopyPrompt = (issue, index) => {
    if (navigator.clipboard) {
      const fullText = `Please fix the following issue in my code:\n\nFile: ${issue.file || 'General'}\nLine: ${issue.line || 'N/A'}\nSeverity: ${issue.severity || issue.type || 'info'}\n\nIssue Description:\n${issue.message || issue.error || issue.msg || 'Diagnostic issue detected'}\n\nPlease provide the corrected code or explain how to resolve this.`;
      navigator.clipboard.writeText(fullText);
      setCopiedId(index);
      showToast("Diagnostic prompt copied to clipboard!", "success");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyAllPrompts = () => {
    if (navigator.clipboard) {
      const fullPrompt = filteredIssues.map(issue => `File: ${issue.file || 'General'}\nIssue: ${issue.message || issue.error || issue.msg}\nPrompt: ${issue.prompt || `Fix: ${issue.message || issue.error || issue.msg}`}`).join('\n\n---\n\n');
      navigator.clipboard.writeText(`Please fix the following issues to meet World Top 1 Standards:\n\n${fullPrompt}`);
      setCopiedAll(true);
      showToast(`Copied ${filteredIssues.length} prompts to clipboard!`, "success");
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleOpenTargetIde = async (filePath, line = 1) => {
    if (!filePath) {
      showToast("No target file specified for this issue", "warning");
      return;
    }
    if (onOpenInIde) {
      onOpenInIde(filePath, line);
      return;
    }
    try {
      const fileName = filePath.split('/').pop() || filePath;
      showToast(`Opening ${fileName} in IDE...`, "info");
      const res = await fetch('/api/open-in-ide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, line, projectId })
      }).then(r => r.json()).catch(() => null);

      if (!res?.opened && res?.url) {
        window.location.href = res.url;
      }
    } catch {
      window.location.href = `vscode://file/${filePath}${line ? `:${line}` : ''}`;
    }
  };

  return (
    <div className={`bg-[#121214] border border-white/[0.04] rounded-3xl p-6 relative overflow-hidden ${className}`}>
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
          <IssueFilterTabs
            categories={filterCategories}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          {filteredIssues.length > 0 && (
            <button
              onClick={handleCopyAllPrompts}
              className="px-4 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white text-xs font-mono font-medium flex items-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {copiedAll ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-zinc-500" />}
              <span>{copiedAll ? 'Copied All!' : 'Copy Prompts'}</span>
            </button>
          )}
        </div>

        {filteredIssues.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white/[0.02] rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <CheckCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white font-outfit">No Issues Detected</h3>
            <p className="text-xs font-mono text-zinc-400 max-w-sm mx-auto">
              All intelligence diagnostics and code quality checks passed.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[37.5rem] overflow-y-auto custom-scrollbar pr-2 pb-2">
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
