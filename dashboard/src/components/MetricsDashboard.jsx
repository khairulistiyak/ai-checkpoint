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
    { label: 'Completion', value: `${percentage}%`, icon: Target, color: 'text-white', bg: 'bg-white/10 border border-white/20' },
    { label: 'Steps Done', value: completed, icon: Activity, color: 'text-white', bg: 'bg-white/10 border border-white/20' },
    { label: 'Remaining', value: remaining, icon: Zap, color: 'text-white/70', bg: 'bg-white/5 border border-white/10' },
    { label: 'Active Phases', value: activePhases, icon: Layers, color: 'text-white/70', bg: 'bg-white/5 border border-white/10' },
    { label: 'Planned Steps', value: plannedSteps, icon: FileText, color: 'text-white/70', bg: 'bg-white/5 border border-white/10' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.3 }}
            key={m.label}
            className="bg-[#121214] border border-white/10 hover:border-white/20 rounded-3xl p-5 flex flex-col items-start justify-center gap-1 group transition-all shadow-sm"
          >
            <div className="flex items-center justify-between w-full">
              <div className={`w-8 h-8 rounded-xl ${m.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mt-3 font-outfit">{m.value}</div>
            <div className="text-xs font-mono uppercase tracking-wider text-white/50">{m.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
