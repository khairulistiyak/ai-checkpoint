import React from 'react';
import { Info, Sparkles, AlertCircle, AlertTriangle, Flame } from 'lucide-react';

const ALERT_CONFIGS = {
  note: {
    icon: Info,
    title: 'Note',
    border: 'border-sky-500/20',
    bg: 'bg-sky-500/5',
    badge: 'text-sky-300',
    text: 'text-sky-200/90'
  },
  tip: {
    icon: Sparkles,
    title: 'Tip',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    badge: 'text-emerald-300',
    text: 'text-emerald-200/90'
  },
  important: {
    icon: AlertCircle,
    title: 'Important',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    badge: 'text-purple-300',
    text: 'text-purple-200/90'
  },
  warning: {
    icon: AlertTriangle,
    title: 'Warning',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    badge: 'text-amber-300',
    text: 'text-amber-200/90'
  },
  caution: {
    icon: Flame,
    title: 'Caution',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/5',
    badge: 'text-rose-300',
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
      className={`my-3.5 p-4 rounded-xl border ${config.border} ${config.bg} space-y-1.5 shadow-sm`}
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
