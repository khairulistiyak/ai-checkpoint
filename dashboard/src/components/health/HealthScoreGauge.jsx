import React from 'react';
import { motion } from 'framer-motion';

export default function HealthScoreGauge({ score, scoreColor, healthScore, qualityScore, filesScanned, passed }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="lg:col-span-4 bg-gradient-to-b from-[#16161a] to-[#0e0e11] border border-white/[0.08] rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mb-3 flex items-center justify-center">
        <div
          className="w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl transition-all"
          style={{ borderColor: scoreColor, boxShadow: `0 0 35px ${scoreColor}25` }}
        >
          <span className="text-4xl font-extrabold font-mono tracking-tight" style={{ color: scoreColor }}>
            {score}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
            Score
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span className={`w-2 h-2 rounded-full ${passed ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        <span className="text-sm font-bold text-white font-outfit">
          {passed ? 'System Verified' : 'Optimizations Advised'}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-xs font-mono text-zinc-400 w-full pt-3 border-t border-white/5">
        <div>
          <div className="text-white font-bold text-sm">{healthScore}%</div>
          <div className="text-[10px] text-zinc-500 uppercase">Health</div>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div>
          <div className="text-white font-bold text-sm">{qualityScore}%</div>
          <div className="text-[10px] text-zinc-500 uppercase">Quality</div>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div>
          <div className="text-white font-bold text-sm">{filesScanned || 0}</div>
          <div className="text-[10px] text-zinc-500 uppercase">Files</div>
        </div>
      </div>
    </motion.div>
  );
}
