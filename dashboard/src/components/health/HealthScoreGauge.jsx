import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ShieldCheck } from 'lucide-react';

export default function HealthScoreGauge({
  score = 100,
  scoreColor = '#34d399',
  healthScore = 100,
  qualityScore = 100,
  filesScanned = 0,
  passed = true,
  onRescan,
  isScanning = false
}) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const validScore = Math.min(100, Math.max(0, typeof score === 'number' ? score : 0));
  const strokeDashoffset = circumference - (circumference * validScore) / 100;

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

      {/* Center SVG Gauge */}
      <div className="my-1 flex flex-col items-center justify-center relative z-10">
        <div className="relative flex items-center justify-center w-20 h-20">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="4"
            />
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="transparent"
              stroke={scoreColor || '#34d399'}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold font-mono tracking-tight text-zinc-100 tabular-nums">
              {score}
            </span>
            <span className="text-[8px] font-mono text-zinc-500 uppercase font-semibold -mt-0.5">
              Score
            </span>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.02] border border-white/[0.05] mt-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)] animate-pulse' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]'}`} />
          <span className="text-[11px] font-medium text-zinc-300 font-outfit">
            {passed ? 'System Verified' : 'Optimizations Advised'}
          </span>
        </div>
      </div>

      {/* 3-Cell Metric Matrix */}
      <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-white/[0.04] text-center relative z-10 font-mono">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
          <div className="text-zinc-200 font-semibold text-xs tabular-nums">{healthScore}%</div>
          <div className="text-[9px] text-zinc-500 uppercase font-medium">Health</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
          <div className="text-zinc-200 font-semibold text-xs tabular-nums">{qualityScore}%</div>
          <div className="text-[9px] text-zinc-500 uppercase font-medium">Quality</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
          <div className="text-zinc-200 font-semibold text-xs tabular-nums">{filesScanned || 0}</div>
          <div className="text-[9px] text-zinc-500 uppercase font-medium">Files</div>
        </div>
      </div>
    </motion.div>
  );
}
