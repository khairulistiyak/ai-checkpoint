import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function PolarAreaChart({ scores }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    { label: 'Responsive', value: scores.responsive, color: 'rgba(96, 165, 250, 0.6)' },
    { label: 'Dynamic', value: scores.dynamic, color: 'rgba(192, 132, 252, 0.6)' },
    { label: 'Performance', value: scores.performance, color: 'rgba(251, 191, 36, 0.6)' },
    { label: 'A11y', value: scores.a11y, color: 'rgba(52, 211, 153, 0.6)' },
    { label: 'Security', value: scores.security, color: 'rgba(244, 63, 94, 0.6)' }
  ];

  const center = 50;
  const maxRadius = 45;
  const numSlices = metrics.length;
  const anglePerSlice = (Math.PI * 2) / numSlices;

  const createSlicePath = (radius, startAngle, endAngle) => {
    const startX = center + Math.cos(startAngle) * radius;
    const startY = center + Math.sin(startAngle) * radius;
    const endX = center + Math.cos(endAngle) * radius;
    const endY = center + Math.sin(endAngle) * radius;
    
    // Large arc flag is 0 because our angle is 72 degrees (< 180)
    return `M ${center},${center} L ${startX},${startY} A ${radius},${radius} 0 0,1 ${endX},${endY} Z`;
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative group">
      <svg viewBox="0 0 100 100" className="w-full h-full max-w-[240px] overflow-visible">
        <defs>
          <filter id="polarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Grid Rings */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
          <circle key={i} cx={center} cy={center} r={maxRadius * scale} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        ))}
        
        {/* Slice Dividers */}
        {metrics.map((_, i) => {
          const angle = i * anglePerSlice - Math.PI / 2;
          const x = center + Math.cos(angle) * maxRadius;
          const y = center + Math.sin(angle) * maxRadius;
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />;
        })}

        {/* Slices */}
        {metrics.map((m, i) => {
          const startAngle = i * anglePerSlice - Math.PI / 2;
          const endAngle = (i + 1) * anglePerSlice - Math.PI / 2;
          
          // Initial path (0 radius) and Target path
          const initialPath = createSlicePath(0, startAngle, endAngle);
          const targetPath = createSlicePath((m.value / 100) * maxRadius, startAngle, endAngle);

          return (
            <motion.path
              key={i}
              d={isLoaded ? targetPath : initialPath}
              fill={m.color}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
              filter="url(#polarGlow)"
              initial={{ d: initialPath }}
              animate={{ d: isLoaded ? targetPath : initialPath }}
              transition={{ duration: 1.5, type: 'spring', bounce: 0.3, delay: i * 0.1 }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <title>{m.label}: {m.value}</title>
            </motion.path>
          );
        })}

        {/* Labels */}
        {metrics.map((m, i) => {
          const midAngle = (i + 0.5) * anglePerSlice - Math.PI / 2;
          const labelR = maxRadius + 5;
          const lx = center + Math.cos(midAngle) * labelR;
          const ly = center + Math.sin(midAngle) * labelR;
          return (
            <motion.text
              key={`label-${i}`}
              x={lx}
              y={ly}
              fill="#a1a1aa"
              fontSize="3.5"
              textAnchor="middle"
              alignmentBaseline="middle"
              className="font-medium tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              {m.label}
            </motion.text>
          );
        })}
        
        {/* Core Dot */}
        <circle cx={center} cy={center} r="2" fill="#fff" filter="url(#polarGlow)" />
      </svg>
    </div>
  );
}
