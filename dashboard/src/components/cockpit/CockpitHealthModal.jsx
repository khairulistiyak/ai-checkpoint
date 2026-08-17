import React from 'react';
import { Shield, RefreshCw, AlertTriangle, Sparkles, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HealthScoreGauge from '../health/HealthScoreGauge';
import HealthPillarGrid from '../health/HealthPillarGrid';
import HealthCoreChecklist from '../health/HealthCoreChecklist';
import HealthIssueExplorer from '../health/HealthIssueExplorer';

export default function CockpitHealthModal({
  isOpen,
  onClose,
  health,
  loading,
  error,
  copiedReport,
  score,
  healthScore,
  qualityScore,
  scoreColor,
  breakdown,
  issues,
  checks,
  filteredIssues,
  categoryCounts,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  fetchHealth,
  handleCopyDiagnosticReport,
  handleOpenInIde,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl bg-[#0e0e11] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/10 shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" style={{ color: scoreColor }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white font-outfit tracking-tight">Health & Quality Overview</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-300">Live Fortress</span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-mono text-zinc-400 mt-0.5">AST integrity, Rule 0 guard, security auditing & code hygiene.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyDiagnosticReport}
                  disabled={!health || loading}
                  className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                  title="Copy structured diagnostic prompt for AI to fix issues"
                >
                  {copiedReport ? <Check size={14} className="text-purple-300" /> : <Sparkles size={14} className="text-purple-400" />}
                  <span>{copiedReport ? 'Copied!' : 'Fix Prompt'}</span>
                </button>

                <button
                  onClick={fetchHealth}
                  disabled={loading}
                  className="bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>{loading ? 'Scanning...' : 'Re-scan'}</span>
                </button>

                <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm font-mono flex items-center gap-3">
                  <AlertTriangle size={16} className="shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {health && (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-4 flex flex-col gap-5">
                      <HealthScoreGauge
                        score={score}
                        scoreColor={scoreColor}
                        healthScore={healthScore}
                        qualityScore={qualityScore}
                        filesScanned={health.filesScanned}
                        passed={health.passed}
                      />
                      <HealthCoreChecklist checks={checks} />
                    </div>

                    <div className="lg:col-span-8 flex flex-col gap-5">
                      <HealthPillarGrid breakdown={breakdown} />
                    </div>
                  </div>

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
                </div>
              )}

              {!health && !loading && !error && (
                <div className="text-center py-16 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-3">
                  <Shield className="w-12 h-12 text-zinc-600 mx-auto" />
                  <h3 className="text-base font-bold text-white font-outfit">Health Scanner Ready</h3>
                  <p className="text-sm font-mono text-zinc-500">Click "Re-scan" to run the continuous diagnostic suite.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
