import React from 'react';
import { Activity, Zap, Target, Layers, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MetricsDashboard({ progress, project }) {
  if (!progress || !progress.overall) return null;

  const { percentage, completed, total } = progress.overall;
  const remaining = total - completed;
  const activePhases = progress.phases ? progress.phases.filter(p => p.percentage > 0 && p.percentage < 100).length : 0;
  
  const totalPlanSteps = project?.planStats?.totalSteps || 0;
  const plannedSteps = Math.max(0, totalPlanSteps - total);

  const metrics = [
    { label: 'Completion', value: `${percentage}%`, icon: Target, color: 'text-cyber-text-primary', bg: 'bg-cyber-accent/20', glow: 'bg-cyber-accent/10' },
    { label: 'Steps Done', value: completed, icon: Activity, color: 'text-cyber-text-secondary', bg: 'bg-white/5', glow: 'bg-white/5' },
    { label: 'Remaining', value: remaining, icon: Zap, color: 'text-cyber-text-secondary', bg: 'bg-white/5', glow: 'bg-white/5' },
    { label: 'Active Phases', value: activePhases, icon: Layers, color: 'text-cyber-text-secondary', bg: 'bg-white/5', glow: 'bg-white/5' },
    { label: 'Planned Steps', value: plannedSteps, icon: FileText, color: 'text-cyber-text-secondary', bg: 'bg-white/5', glow: 'bg-white/5' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={m.label}
            className="glass-card p-4 sm:p-5 flex flex-col items-start justify-center gap-1 group hover:-translate-y-1 transition-transform relative overflow-hidden"
          >
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 ${m.glow} blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-500 z-0`} />
            <div className="flex items-center justify-between w-full relative z-10">
              <div className={`w-8 h-8 rounded-full ${m.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <div className="text-3xl font-black text-cyber-text-primary mt-2 relative z-10">{m.value}</div>
            <div className="text-xs font-medium uppercase tracking-wider text-cyber-text-secondary relative z-10">{m.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
