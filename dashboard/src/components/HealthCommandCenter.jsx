import React from 'react';
import { Shield, RefreshCw, AlertTriangle, Sparkles, Check } from 'lucide-react';
import { useToast } from './ToastProvider';
import HealthScoreGauge from './health/HealthScoreGauge';
import HealthPillarGrid from './health/HealthPillarGrid';
import HealthCoreChecklist from './health/HealthCoreChecklist';
import HealthIssueExplorer from './health/HealthIssueExplorer';
import { useHealthCommandCenter } from './health/useHealthCommandCenter';

export default function HealthCommandCenter({ projectId }) {
  const { showToast } = useToast();
  const {
    health, loading, copiedReport, error, activeCategory, setActiveCategory,
    searchQuery, setSearchQuery, fetchHealth, handleCopyDiagnosticReport,
    handleOpenInIde, score, healthScore, qualityScore, scoreColor, breakdown,
    issues, checks, filteredIssues, categoryCounts
  } = useHealthCommandCenter({ projectId, showToast });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121214] border border-white/[0.08] p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" style={{ color: scoreColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white font-outfit tracking-tight">Health & Quality Fortress</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-300">Live Scan</span>
            </div>
            <p className="text-xs font-mono text-zinc-400">Continuous AST integrity, Rule 0 enforcement, security auditing & code hygiene.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleCopyDiagnosticReport}
            disabled={!health || loading}
            className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 active:scale-95"
            title="Copy structured diagnostic prompt for Cursor, Claude, or ChatGPT to fix issues"
          >
            {copiedReport ? <Check size={13} className="text-purple-300" /> : <Sparkles size={13} className="text-purple-400" />}
            <span>{copiedReport ? 'Copied to Clipboard!' : 'Copy Fix Prompt'}</span>
          </button>

          <button
            onClick={fetchHealth}
            disabled={loading}
            className="bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Scanning...' : 'Re-scan'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-3">
          <AlertTriangle size={16} className="shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {health && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <HealthScoreGauge
              score={score}
              scoreColor={scoreColor}
              healthScore={healthScore}
              qualityScore={qualityScore}
              filesScanned={health.filesScanned}
              passed={health.passed}
            />
            <HealthPillarGrid breakdown={breakdown} />
          </div>

          <HealthCoreChecklist checks={checks} />

          <HealthIssueExplorer
            issues={issues}
            filteredIssues={filteredIssues}
            categoryCounts={categoryCounts}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenInIde={handleOpenInIde}
          />
        </>
      )}

      {!health && !loading && !error && (
        <div className="text-center py-16 bg-[#121214] border border-white/[0.08] rounded-3xl space-y-3">
          <Shield className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white font-outfit">Health Scanner Ready</h3>
          <p className="text-xs font-mono text-zinc-500">Click "Re-scan" to run the continuous diagnostic suite.</p>
        </div>
      )}
    </div>
  );
}
