import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Sparkles, Check } from 'lucide-react';

const tiers = [
  {
    id: 'small',
    label: 'Small',
    icon: Cpu,
    color: 'text-zinc-400',
    activeColor: 'text-emerald-400',
    maxSteps: '5 Steps / Phase',
    complexity: 'Simple tasks & direct instructions',
  },
  {
    id: 'medium',
    label: 'Medium',
    icon: Zap,
    color: 'text-zinc-400',
    activeColor: 'text-amber-400',
    maxSteps: '10 Steps / Phase',
    complexity: 'Standard tasks & linear dependencies',
  },
  {
    id: 'high',
    label: 'High',
    icon: Sparkles,
    color: 'text-zinc-400',
    activeColor: 'text-cyber-accent',
    maxSteps: 'Unlimited Steps',
    complexity: 'Full autonomy & complex reasoning',
  },
];

export default function AiTierSelector({ selectedTier, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {tiers.map((t) => {
        const Icon = t.icon;
        const isActive = selectedTier === t.id;

        return (
          <motion.button
            key={t.id}
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onChange(t.id)}
            className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between text-left cursor-pointer relative overflow-hidden ${
              isActive
                ? 'bg-white/[0.06] border-cyber-accent shadow-[0_0_20px_rgba(var(--cyber-accent-rgb),0.1)]'
                : 'bg-[#121214] border-white/[0.08] hover:bg-[#16171c] hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
                    isActive
                      ? 'bg-white/10 border-white/20'
                      : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? t.activeColor : t.color
                    }`}
                  />
                </div>
                <span className="font-bold text-white text-sm font-outfit tracking-tight">
                  {t.label}
                </span>
              </div>
              {isActive && (
                <div className="w-5 h-5 rounded-full bg-cyber-accent text-zinc-950 flex items-center justify-center font-bold">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <div className="inline-flex items-center self-start px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-[10px] font-mono text-zinc-300 font-semibold uppercase tracking-wider">
                {t.maxSteps}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                {t.complexity}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
