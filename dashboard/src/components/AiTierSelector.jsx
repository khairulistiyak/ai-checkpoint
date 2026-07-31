import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Sparkles, Check } from 'lucide-react';

const tiers = [
  {
    id: 'small',
    label: 'Small',
    emoji: '🟢',
    icon: Cpu,
    color: 'text-emerald-400',
    border: 'hover:border-emerald-500/30',
    glow: 'from-emerald-500/10 to-transparent',
    activeGlow: 'bg-emerald-500/20 border-emerald-500/50',
    maxSteps: 'Max 5 steps / phase',
    complexity: 'Simple tasks & direct instructions',
    models: 'GPT-3.5, Gemini Flash, Claude Haiku'
  },
  {
    id: 'medium',
    label: 'Medium',
    emoji: '🟡',
    icon: Zap,
    color: 'text-amber-400',
    border: 'hover:border-amber-500/30',
    glow: 'from-amber-500/10 to-transparent',
    activeGlow: 'bg-amber-500/20 border-amber-500/50',
    maxSteps: 'Max 10 steps / phase',
    complexity: 'Standard tasks & linear dependencies',
    models: 'GPT-4o, Gemini Pro, Claude Sonnet'
  },
  {
    id: 'high',
    label: 'High',
    emoji: '🔴',
    icon: Sparkles,
    color: 'text-accent-400',
    border: 'hover:border-accent-500/30',
    glow: 'from-accent-500/10 to-transparent',
    activeGlow: 'bg-accent-500/20 border-accent-500/50',
    maxSteps: 'Unlimited steps / phase',
    complexity: 'Full freedom & complex reasoning',
    models: 'GPT-4, o1, Gemini Ultra, Claude Opus'
  }
];

export default function AiTierSelector({ selectedTier, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tiers.map((t) => {
        const Icon = t.icon;
        const isActive = selectedTier === t.id;

        return (
          <motion.div
            key={t.id}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(t.id)}
            className={`glass-card p-5 cursor-pointer relative overflow-hidden flex flex-col justify-between border transition-all duration-300 ${
              isActive 
                ? t.activeGlow
                : `border-white/[0.05] ${t.border} bg-white/[0.02]`
            }`}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${t.glow} opacity-30 pointer-events-none`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${t.color}`} />
                  <span className="font-bold text-white text-base">{t.label}</span>
                </div>
                {isActive && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-accent-500 flex items-center justify-center border border-white/20 shadow-lg"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>

              <div className="text-[11px] font-mono text-slate-400 mb-4 font-semibold uppercase tracking-wider">
                {t.maxSteps}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {t.complexity}
              </p>
            </div>

            <div className="border-t border-white/[0.05] pt-3 mt-auto relative z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Recommended Models</div>
              <div className="text-[11px] font-medium text-slate-300">{t.models}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
