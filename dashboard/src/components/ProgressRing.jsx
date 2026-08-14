import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ProgressRing({ percentage, size = 44, strokeWidth = 3.5, color = '#34d399' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isDone = percentage === 100;
  const gradientId = `progress-grad-${Math.random().toString(36).substr(2, 9)}`;

  const gradientStops = isDone
    ? { start: '#34d399', end: '#06b6d4' } // Emerald to Cyan
    : { start: '#3b82f6', end: '#8b5cf6' }; // Blue to Violet

  return (
    <div className="relative flex items-center justify-center shrink-0 select-none" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStops.start} />
            <stop offset="100%" stopColor={gradientStops.end} />
          </linearGradient>
        </defs>

        {/* Track Circle */}
        <circle
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Animated Progress Circle */}
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
            filter: `drop-shadow(0 0 6px ${gradientStops.start}40)`
          }}
        />
      </svg>

      {/* Center Label / Icon */}
      <div className="absolute inset-0 flex items-center justify-center text-white font-mono font-bold">
        {isDone ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <span style={{ fontSize: Math.max(size * 0.26, 10) }} className="text-zinc-200">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}
