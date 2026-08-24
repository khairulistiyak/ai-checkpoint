import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ShieldCheck } from 'lucide-react';

export default function HealthScoreGauge({
  score,
  scoreColor,
  healthScore,
  qualityScore,
  filesScanned,
  passed,
  onRescan,
  isScanning
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-4 flex flex-col justify-between h-full min-h-[14rem] shadow-sm transition-all relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <span className="text-xs font-mono font-medium text-zinc-400">System Health</span>
        </div>

        {onRescan && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRescan();
            }}
            disabled={isScanning}
            className="px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-mono shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
            title="Re-scan Health & Code Fortress"
          >
            <RefreshCw size={11} className={isScanning ? 'animate-spin text-emerald-400' : ''} />
            <span>Re-scan</span>
          </button>
        )}
      </div>

      {/* Score Center Gauge */}
      <div className="my-2 flex flex-col items-center justify-center relative z-10">
        <div
          className="w-18 h-18 rounded-full border-2 flex flex-col items-center justify-center transition-all bg-white/[0.01]"
          style={{ borderColor: scoreColor || '#34d399', boxShadow: `0 0 16px ${scoreColor || '#34d399'}15` }}
        >
          <span className="text-2xl font-extrabold font-mono tracking-tight" style={{ color: scoreColor || '#34d399' }}>
            {score}
          </span>
          <span className="text-[9px] font-mono text-zinc-500 uppercase font-semibold -mt-0.5">
            Score
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-xs font-medium text-zinc-300 font-outfit">
            {passed ? 'System Verified' : 'Optimizations Advised'}
          </span>
        </div>
      </div>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-3 gap-1 pt-2.5 border-t border-white/[0.04] text-center relative z-10 font-mono">
        <div>
          <div className="text-zinc-200 font-semibold text-xs">{healthScore}%</div>
          <div className="text-[10px] text-zinc-500 uppercase">Health</div>
        </div>
        <div className="border-x border-white/[0.04]">
          <div className="text-zinc-200 font-semibold text-xs">{qualityScore}%</div>
          <div className="text-[10px] text-zinc-500 uppercase">Quality</div>
        </div>
        <div>
          <div className="text-zinc-200 font-semibold text-xs">{filesScanned || 0}</div>
          <div className="text-[10px] text-zinc-500 uppercase">Files</div>
        </div>
      </div>
    </motion.div>
  );
}
