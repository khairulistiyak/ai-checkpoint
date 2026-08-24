import React from 'react';
import { Info, Sparkles, AlertCircle, AlertTriangle, Flame } from 'lucide-react';

const ALERT_CONFIGS = {
  note: {
    icon: Info,
    title: 'Note',
    border: 'border-l-sky-400 border-white/10',
    bg: 'bg-sky-500/10',
    badge: 'text-sky-400',
    text: 'text-sky-200/90'
  },
  tip: {
    icon: Sparkles,
    title: 'Tip',
    border: 'border-l-emerald-400 border-white/10',
    bg: 'bg-emerald-500/10',
    badge: 'text-emerald-400',
    text: 'text-emerald-200/90'
  },
  important: {
    icon: AlertCircle,
    title: 'Important',
    border: 'border-l-purple-400 border-white/10',
    bg: 'bg-purple-500/10',
    badge: 'text-purple-400',
    text: 'text-purple-200/90'
  },
  warning: {
    icon: AlertTriangle,
    title: 'Warning',
    border: 'border-l-amber-400 border-white/10',
    bg: 'bg-amber-500/10',
    badge: 'text-amber-400',
    text: 'text-amber-200/90'
  },
  caution: {
    icon: Flame,
    title: 'Caution',
    border: 'border-l-rose-400 border-white/10',
    bg: 'bg-rose-500/10',
    badge: 'text-rose-400',
    text: 'text-rose-200/90'
  }
};

export default function PlanAlertBlock({ block, idx, formatTextWithBadges }) {
  if (!block || !block.text) return null;
  const variant = (block.variant || 'note').toLowerCase();
  const config = ALERT_CONFIGS[variant] || ALERT_CONFIGS.note;
  const Icon = config.icon;

  return (
    <div
      key={idx}
      className={`my-3.5 p-4 rounded-xl border border-l-4 ${config.border} ${config.bg} space-y-1.5 shadow-md`}
    >
      <div className={`flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider ${config.badge}`}>
        <Icon className="w-4 h-4 shrink-0" />
        <span>{config.title}</span>
      </div>
      <div className="font-mono text-xs text-zinc-200 leading-relaxed pl-6 whitespace-pre-wrap">
        {formatTextWithBadges ? formatTextWithBadges(block.text) : block.text}
      </div>
    </div>
  );
}
