import React from 'react';
import { Activity, Zap, Target, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MetricsDashboard({ progress }) {
  if (!progress || !progress.overall) return null;

  const { percentage, completed, total } = progress.overall;
  const remaining = total - completed;
  
  // Calculate a fake "AI Velocity" or standard metrics for the vibe
  const velocity = Math.round((completed / Math.max(1, total)) * 100);

  const metrics = [
    { label: 'Completion Rate', value: `${percentage}%`, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Steps Completed', value: completed, icon: Activity, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Remaining Tasks', value: remaining, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'AI Sync Status', value: 'Optimal', icon: Cpu, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={m.label} 
            className="glass-card p-5 flex flex-col items-center justify-center text-center gap-2 group hover:-translate-y-1 transition-transform"
          >
            <div className={`w-10 h-10 rounded-full ${m.bg} flex items-center justify-center mb-1 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <div className="text-2xl font-black text-white">{m.value}</div>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400">{m.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
