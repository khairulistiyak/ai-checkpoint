import React from 'react';
import { motion } from 'framer-motion';

/**
 * HUDCoreBalance — Left and right floating balance bars for AdvancedHUD
 */
export default function HUDCoreBalance({ scores = [], isFullWidth = false }) {
  if (!isFullWidth) return null;

  const leftScores = scores.slice(0, 3);
  const rightScores = scores.slice(3, 5);

  return (
    <>
      {/* Floating Core Balance (Left) */}
      <div className="absolute left-8 lg:left-24 top-1/2 -translate-y-1/2 flex flex-col gap-6 w-48 z-20">
        {leftScores.map((m, i) => (
          <div key={`l-${i}`} className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-zinc-400 text-[0.625rem] uppercase tracking-widest">{m.id}</span>
              <span className="text-zinc-100 text-xs font-bold">{m.val}%</span>
            </div>
            <div className="w-full h-[0.125rem] bg-white/[0.03] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: m.color }}
                initial={{ width: '0%' }}
                animate={{ width: `${m.val}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Floating Core Balance (Right) */}
      <div className="absolute right-8 lg:right-24 top-1/2 -translate-y-1/2 flex flex-col gap-6 w-48 z-20">
        {rightScores.map((m, i) => (
          <div key={`r-${i}`} className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-zinc-400 text-[0.625rem] uppercase tracking-widest">{m.id}</span>
              <span className="text-zinc-100 text-xs font-bold">{m.val}%</span>
            </div>
            <div className="w-full h-[0.125rem] bg-white/[0.03] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: m.color }}
                initial={{ width: '0%' }}
                animate={{ width: `${m.val}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
