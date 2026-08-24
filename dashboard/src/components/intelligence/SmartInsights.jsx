import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SmartInsights({ grade, scores, issues }) {
  const insights = useMemo(() => {
    let text = "";
    
    // Overall sentiment
    if (grade === 'A+' || grade === 'A') {
      text += "Your project is in exceptional shape, exhibiting World Top 1 standards. ";
    } else if (grade === 'B') {
      text += "Your project is performing well but has room for premium optimization. ";
    } else {
      text += "Your project requires attention to meet modern quality standards. ";
    }

    // Identify weakest area
    let weakest = null;
    let lowestScore = 100;
    Object.entries(scores).forEach(([key, val]) => {
      if (val < lowestScore) {
        lowestScore = val;
        weakest = key;
      }
    });

    if (lowestScore < 90 && weakest) {
      const formattedWeakest = weakest.charAt(0).toUpperCase() + weakest.slice(1);
      text += `Currently, ${formattedWeakest} is your lowest metric (${lowestScore}%). `;
    }

    // Issues summary
    if (issues.length === 0) {
      text += "No actionable issues were found! You are flawless.";
    } else if (issues.length === 1) {
      text += "Fixing the single remaining issue below will maximize your score.";
    } else {
      text += `Focus on resolving the ${issues.length} actionable issues listed below to boost your grade.`;
    }

    return text;
  }, [grade, scores, issues]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] p-5 shadow-sm transition-all"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex gap-3.5 items-start">
        <div className="shrink-0 mt-0.5">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 shadow-sm">
            <Sparkles className="w-4 h-4 text-zinc-300" />
          </div>
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
              AI Smart Insights
            </h3>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-zinc-400 leading-relaxed text-xs font-mono">
            {insights}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
