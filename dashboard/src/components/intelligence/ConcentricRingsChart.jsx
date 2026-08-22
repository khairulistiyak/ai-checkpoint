import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ConcentricRingsChart({ scores }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    { label: 'Security', value: scores.security, color: '#f43f5e' },    // Rose
    { label: 'A11y', value: scores.a11y, color: '#34d399' },            // Emerald
    { label: 'Performance', value: scores.performance, color: '#fbbf24' },// Amber
    { label: 'Dynamic', value: scores.dynamic, color: '#c084fc' },      // Purple
    { label: 'Responsive', value: scores.responsive, color: '#60a5fa' }   // Blue
  ];

  const center = 50;
  const strokeWidth = 3;
  const gap = 6;
  const baseRadius = 15;

  return (
    <div className="w-full h-full flex items-center justify-center relative group">
      <svg viewBox="0 0 100 100" className="w-full h-full max-w-[15rem] overflow-visible">
        <defs>
          <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {metrics.map((m, i) => {
          const r = baseRadius + i * gap;
          const circumference = 2 * Math.PI * r;
          const strokeDasharray = circumference;
          const strokeDashoffset = isLoaded ? circumference - (m.value / 100) * circumference : circumference;

          return (
            <g key={i}>
              {/* Background Track */}
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth={strokeWidth}
              />
              
              {/* Animated Progress Ring */}
              <motion.circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={m.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                filter="url(#ringGlow)"
                transform={`rotate(-90 ${center} ${center})`}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeDashoffset }}
                transition={{ duration: 1.5, type: 'spring', bounce: 0.2, delay: i * 0.1 }}
                className="cursor-pointer hover:stroke-[4px] transition-all"
              />
              
              {/* Hover Target for Label */}
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="transparent"
                strokeWidth={strokeWidth + 2}
                className="peer cursor-pointer"
              />
              
              {/* Tooltip text (appears on hover of the outer invisible circle) */}
              <text
                x={center}
                y={center}
                fill="#fff"
                fontSize="6"
                textAnchor="middle"
                alignmentBaseline="middle"
                className="opacity-0 peer-hover:opacity-100 transition-opacity font-mono font-bold drop-shadow-md pointer-events-none"
              >
                {m.label}: {m.value}
              </text>
            </g>
          );
        })}
        <text
          x={center}
          y={center}
          fill="#52525b"
          fontSize="4"
          textAnchor="middle"
          alignmentBaseline="middle"
          className="uppercase tracking-widest font-bold opacity-100 peer-hover:opacity-0 transition-opacity pointer-events-none"
        >
          Hover
        </text>
      </svg>
    </div>
  );
}
