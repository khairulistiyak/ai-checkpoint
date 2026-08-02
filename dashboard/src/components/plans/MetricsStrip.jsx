import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Clock, Layers, FileCode } from 'lucide-react';

export default function MetricsStrip({ project }) {
  const progress = project?.progress;
  if (!progress || !progress.overall) return null;
  const { percentage, completed, total } = progress.overall;
  const remaining = total - completed;
  const activePhases = progress.phases ? progress.phases.filter(p => p.percentage > 0 && p.percentage < 100).length : 0;
  const planFiles = project?.planStats?.totalFiles || 0;

  const items = [
    { label: 'Overall Completion', value: `${percentage}%`, sub: `${completed}/${total} Steps`, icon: Target, accent: 'from-cyber-accent/20 to-blue-500/10', border: 'border-cyber-accent/30', text: 'text-cyber-accent' },
    { label: 'Completed Steps', value: completed, sub: 'Verified Done', icon: CheckCircle2, accent: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    { label: 'Remaining Work', value: remaining, sub: 'Steps Pending', icon: Clock, accent: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    { label: 'Active Phases', value: activePhases, sub: 'In Progress', icon: Layers, accent: 'from-purple-500/20 to-pink-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    { label: 'Plan Artifacts', value: planFiles, sub: 'Markdown Files', icon: FileCode, accent: 'from-cyan-500/20 to-indigo-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 px-6 py-4 bg-black/20 border-b border-cyber-card-border/30">
      {items.map((m, i) => {
        const Icon = m.icon;
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative p-3.5 rounded-xl bg-gradient-to-br ${m.accent} border ${m.border} backdrop-blur-md flex flex-col justify-between group hover:border-cyber-accent/60 transition-all duration-300 shadow-lg`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyber-text-secondary font-semibold">{m.label}</span>
              <div className={`p-1.5 rounded-lg bg-black/40 border border-white/10 ${m.text}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-cyber-text-primary tracking-tight font-outfit">{m.value}</div>
              <div className="text-[10px] font-mono text-cyber-text-muted mt-0.5">{m.sub}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
