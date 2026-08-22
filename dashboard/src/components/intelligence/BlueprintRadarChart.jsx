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
      {/* Graph Paper Background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '10px 10px'
      }} />
      
      <svg viewBox="0 0 100 100" className="w-full h-full max-w-[15rem] overflow-visible relative z-10">
        
        {/* Architect Grid Rings */}
        {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
          <polygon
            key={i}
            points={metrics.map((_, idx) => {
              const p = getCoordinates(100 * scale, idx);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.2"
            strokeDasharray="1 1"
          />
        ))}

        {/* Axes */}
        {metrics.map((_, i) => {
          const p = getCoordinates(100, i);
          return (
            <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.15)" strokeWidth="0.2" />
          );
        })}

        {/* Data Polygon */}
        <motion.path
          d={pathData}
          fill="rgba(255,255,255,0.02)"
          stroke="#fff"
          strokeWidth="0.5"
          strokeLinejoin="miter"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Data Points & Labels */}
        {points.map((p, i) => {
          const labelPos = getCoordinates(115, i);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="0.8" fill="#fff" />
              <text
                x={labelPos.x}
                y={labelPos.y}
                fill="#a1a1aa"
                fontSize="3"
                textAnchor="middle"
                alignmentBaseline="middle"
                className="tracking-widest"
              >
                {metrics[i].label}
              </text>
              <text
                x={p.x + (p.x > center ? 2 : -2)}
                y={p.y + (p.y > center ? 2 : -2)}
                fill="#fff"
                fontSize="2.5"
                textAnchor={p.x > center ? "start" : "end"}
                alignmentBaseline="middle"
                opacity="0.5"
              >
                {metrics[i].value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
