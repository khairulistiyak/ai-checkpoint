import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ProgressRing({ percentage, size = 46, strokeWidth = 3.5, isRunning = false }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isDone = percentage === 100 && !isRunning;
  const rawId = useId();
  const gradientId = `progress-halo-${rawId.replace(/:/g, '')}`;

  const gradientStops = isRunning
    ? { start: '#fbbf24', end: '#f59e0b' } // Amber to Orange
    : isDone
    ? { start: '#10b981', end: '#06b6d4' } // Emerald to Cyan
    : { start: '#6366f1', end: '#a855f7' }; // Indigo to Purple

  return (
    <div className="relative flex items-center justify-center shrink-0 select-none" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStops.start} />
            <stop offset="100%" stopColor={gradientStops.end} />
          </linearGradient>
        </defs>

        {/* Halo Track Circle */}
        <circle
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Animated Halo Glow Circle */}
        <motion.circle
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 7px ${gradientStops.start}50)`
          }}
        />
      </svg>

      {/* Centered Percentage Value */}
      <div className="absolute inset-0 flex items-center justify-center text-white font-mono font-bold">
        {isDone ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <span style={{ fontSize: Math.max(size * 0.25, 11) }} className={isRunning ? "text-amber-300 tracking-tighter" : "text-zinc-100 tracking-tighter"}>
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}
