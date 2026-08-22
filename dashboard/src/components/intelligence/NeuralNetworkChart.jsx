import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function NeuralNetworkChart({ scores, averageScore }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    { label: 'Security', value: scores.security, color: '#f43f5e' },
    { label: 'A11y', value: scores.a11y, color: '#34d399' },
    { label: 'Perf', value: scores.performance, color: '#fbbf24' }, // Shortened for space
    { label: 'Dynamic', value: scores.dynamic, color: '#c084fc' },
    { label: 'Responsive', value: scores.responsive, color: '#60a5fa' }
  ];

  const center = 50;
  const radius = 35;
  const numNodes = metrics.length;
  
  // Calculate node positions
  const getCoordinates = (index) => {
    const angle = (Math.PI * 2 * index) / numNodes - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius
    };
  };

  const nodes = metrics.map((m, i) => {
    const pos = getCoordinates(i);
    return { ...m, ...pos };
  });

  return (
    <div className="w-full h-full flex items-center justify-center relative group">
      <svg viewBox="0 0 100 100" className="w-full h-full max-w-[15rem] overflow-visible">
        <defs>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.2)" />
          </radialGradient>
        </defs>

        {/* Neural Connections (Edges) */}
        {nodes.map((n, i) => {
          // Thickness and opacity based on score
          const edgeWidth = (n.value / 100) * 3;
          const edgeOpacity = (n.value / 100);
          
          return (
            <motion.line
              key={`edge-${i}`}
              x1={center}
              y1={center}
              x2={n.x}
              y2={n.y}
              stroke={n.color}
              strokeWidth={edgeWidth}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: isLoaded ? 1 : 0, opacity: isLoaded ? edgeOpacity : 0 }}
              transition={{ duration: 1, delay: i * 0.1, type: 'spring' }}
              filter="url(#nodeGlow)"
            />
          );
        })}

        {/* Central Core */}
        <motion.circle
          cx={center}
          cy={center}
          r="8"
          fill="url(#coreGlow)"
          filter="url(#nodeGlow)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
        />
        <motion.text
          x={center}
          y={center}
          fill="#18181b"
          fontSize="4.5"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {averageScore}
        </motion.text>

        {/* Outer Nodes */}
        {nodes.map((n, i) => {
          const nodeRadius = 3 + (n.value / 100) * 3; // Size varies from 3 to 6 based on score
          return (
            <g key={`node-${i}`}>
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={nodeRadius}
                fill={n.color}
                filter="url(#nodeGlow)"
                initial={{ scale: 0 }}
                animate={{ scale: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.5 + i * 0.1, type: 'spring', bounce: 0.5 }}
                className="cursor-pointer hover:stroke-white hover:stroke-[1.5px] transition-all"
              >
                <title>{n.label}: {n.value}</title>
              </motion.circle>
              
              {/* Node Labels */}
              <motion.text
                x={n.x}
                y={n.y + nodeRadius + 3}
                fill="#a1a1aa"
                fontSize="3"
                fontWeight="600"
                textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                {n.label}
              </motion.text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
