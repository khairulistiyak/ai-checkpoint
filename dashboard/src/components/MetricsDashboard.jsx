import React from 'react';
import { Activity, Zap, Target, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

// A simple mini sparkline component
const Sparkline = ({ color }) => {
  // Generate random data points for the sparkline to simulate activity
  const data = React.useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 10), []);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  // Create path points
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d - min) / range) * 80 - 10; // 10% padding
    return `${x},${y}`;
  }).join(' L ');

  const path = `M ${points}`;
  const fillPath = `${path} L 100,100 L 0,100 Z`;

  // Color mapping based on Tailwind classes passed to the parent
  let strokeColor = '#a78bfa'; // default primary
  let fillColor = 'rgba(167,139,250,0.2)';
  
  if (color.includes('emerald')) {
    strokeColor = '#34d399';
    fillColor = 'rgba(52,211,153,0.2)';
  } else if (color.includes('amber')) {
    strokeColor = '#fbbf24';
    fillColor = 'rgba(251,191,36,0.2)';
  } else if (color.includes('accent')) {
    strokeColor = 'var(--accent-400)'; // Works if root vars are defined
    fillColor = 'var(--accent-950)';
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <path d={fillPath} fill={fillColor} />
        <path d={path} fill="none" stroke={strokeColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

export default function MetricsDashboard({ progress }) {
  if (!progress || !progress.overall) return null;

  const { percentage, completed, total } = progress.overall;
  const remaining = total - completed;
  
  // Calculate a fake "AI Velocity" or standard metrics for the vibe
  const velocity = Math.round((completed / Math.max(1, total)) * 100);

  const metrics = [
    { label: 'Completion Rate', value: `${percentage}%`, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Steps Completed', value: completed, icon: Activity, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Remaining Tasks', value: remaining, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'AI Sync Status', value: 'Optimal', icon: Cpu, color: 'text-accent-400', bg: 'bg-accent-500/10' },
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
            className="glass-card p-5 flex flex-col items-start justify-center gap-1 group hover:-translate-y-1 transition-transform relative overflow-hidden"
          >
            <div className="flex items-center justify-between w-full relative z-10">
              <div className={`w-8 h-8 rounded-full ${m.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <div className="text-3xl font-black text-white mt-2 relative z-10">{m.value}</div>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400 relative z-10">{m.label}</div>
            
            <Sparkline color={m.color} />
          </motion.div>
        );
      })}
    </div>
  );
}
