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

    if (lowestScore < 90) {
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
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 p-6 backdrop-blur-xl group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex gap-4">
        <div className="shrink-0 mt-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            AI Insights
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </h3>
          <p className="text-zinc-300 leading-relaxed text-sm md:text-base font-medium">
            {insights}
          </p>
        </div>
      </div>
    </div>
  );
}
