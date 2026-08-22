import React from 'react';
import { motion } from 'framer-motion';

export default function BlueprintRadarChart({ scores }) {
  const metrics = [
    { label: 'RES', value: scores.responsive },
    { label: 'DYN', value: scores.dynamic },
    { label: 'PRF', value: scores.performance },
    { label: 'ALY', value: scores.a11y },
    { label: 'SEC', value: scores.security }
  ];

  const center = 50;
  const radius = 35;
  const numNodes = metrics.length;
  
  const getCoordinates = (value, index) => {
    const angle = (Math.PI * 2 * index) / numNodes - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r
    };
  };

  const points = metrics.map((m, i) => getCoordinates(m.value, i));
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';

  return (
    <div className="w-full h-full flex items-center justify-center relative font-mono">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
        backgroundSize: '12px 12px'
      }} />
      
      <svg viewBox="0 0 100 100" className="w-full h-full max-w-[260px] overflow-visible relative z-10">
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
          </linearGradient>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Architect Grid Rings */}
        {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
          <polygon
            key={i}
            points={metrics.map((_, idx) => {
              const p = getCoordinates(100 * scale, idx);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.3"
            strokeDasharray="1 1"
          />
        ))}

        {/* Axes */}
        {metrics.map((_, i) => {
          const p = getCoordinates(100, i);
          return (
            <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.12)" strokeWidth="0.3" />
          );
        })}

        {/* Data Polygon */}
        <motion.path
          d={pathData}
          fill="url(#radarFill)"
          stroke="#818cf8"
          strokeWidth="0.8"
          filter="url(#radarGlow)"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Data Points & Labels */}
        {points.map((p, i) => {
          const labelPos = getCoordinates(118, i);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="1.2" fill="#818cf8" filter="url(#radarGlow)" />
              <text
                x={labelPos.x}
                y={labelPos.y}
                fill="#c4b5fd"
                fontSize="3.2"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
                className="tracking-wider"
              >
                {metrics[i].label}
              </text>
              <text
                x={p.x + (p.x > center ? 2 : -2)}
                y={p.y + (p.y > center ? 2 : -2)}
                fill="#a7f3d0"
                fontSize="2.6"
                fontWeight="bold"
                textAnchor={p.x > center ? "start" : "end"}
                alignmentBaseline="middle"
              >
                {metrics[i].value}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
