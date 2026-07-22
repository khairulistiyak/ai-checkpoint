import React from 'react';
import { Activity, Zap, Target, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MetricsDashboard({ progress }) {
  if (!progress || !progress.overall) return null;

  const { percentage, completed, total } = progress.overall;
  const remaining = total - completed;
  const activePhases = progress.phases ? progress.phases.filter(p => p.percentage > 0 && p.percentage < 100).length : 0;

  const metrics = [
    { label: 'Completion', value: `${percentage}%`, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'bg-emerald-500/20' },
    { label: 'Steps Done', value: completed, icon: Activity, color: 'text-primary-400', bg: 'bg-primary-500/10', glow: 'bg-primary-500/20' },
    { label: 'Remaining', value: remaining, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'bg-amber-500/20' },
    { label: 'Active Phases', value: activePhases, icon: Layers, color: 'text-accent-400', bg: 'bg-accent-500/10', glow: 'bg-accent-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={m.label}
            className="glass-card p-5 flex flex-col items-start justify-center gap-1 group hover:-translate-y-1 transition-transform relative overflow-hidden"
          >
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 ${m.glow} blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-500 z-0`} />
            <div className="flex items-center justify-between w-full relative z-10">
              <div className={`w-8 h-8 rounded-full ${m.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <div className="text-3xl font-black text-white mt-2 relative z-10">{m.value}</div>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400 relative z-10">{m.label}</div>

            {/* Progress bar instead of fake sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.03]">
              <motion.div
                className={`h-full ${m.color.replace('text-', 'bg-')}`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
