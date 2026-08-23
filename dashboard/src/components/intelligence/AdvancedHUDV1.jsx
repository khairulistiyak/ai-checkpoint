import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HUDCoreBalance from './HUDCoreBalance';

export default function AdvancedHUDV1({ scores, isFullWidth = false }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const displayScores = scores && !Array.isArray(scores) ? [
    { id: 'PERFORMANCE', val: scores.performance || 0, color: '#06b6d4' },
    { id: 'DYNAMIC', val: scores.dynamic || 0, color: '#a855f7' },
    { id: 'RESPONSIVE', val: scores.responsive || 0, color: '#10b981' },
    { id: 'A11Y', val: scores.a11y || 0, color: '#f59e0b' },
    { id: 'SECURITY', val: scores.security || 0, color: '#ec4899' }
  ] : [
    { id: 'PERFORMANCE', val: 92, color: '#06b6d4' },
    { id: 'DYNAMIC', val: 78, color: '#a855f7' },
    { id: 'RESPONSIVE', val: 95, color: '#10b981' },
    { id: 'A11Y', val: 80, color: '#f59e0b' },
    { id: 'SECURITY', val: 99, color: '#ec4899' }
  ];

  const nodes = [
    { id: 'RES', label: 'Responsive', val: scores?.responsive || 0, angle: 270, status: (scores?.responsive || 0) >= 90 ? 'optimal' : 'anomaly', details: { lcp: '1.2s', shift: '0', tti: '0.8s' } },
    { id: 'DYN', label: 'Dynamic', val: scores?.dynamic || 0, angle: 342, status: (scores?.dynamic || 0) >= 90 ? 'optimal' : 'anomaly', details: { render: '60fps', mem: '45MB', state: 'synced' } },
    { id: 'PRF', label: 'Performance', val: scores?.performance || 0, angle: 54, status: (scores?.performance || 0) >= 90 ? 'optimal' : 'anomaly', details: { bundle: '240kb', cache: 'HIT', paint: 'fast' } },
    { id: 'ALY', label: 'A11y', val: scores?.a11y || 0, angle: 126, status: (scores?.a11y || 0) >= 90 ? 'optimal' : 'anomaly', details: { contrast: 'AAA', aria: '100%', focus: 'visible' } },
    { id: 'SEC', label: 'Security', val: scores?.security || 0, angle: 198, status: (scores?.security || 0) >= 90 ? 'optimal' : 'anomaly', details: { csp: 'strict', ssl: 'tls1.3', xss: 'safe' } },
  ];

  const center = 50;
  const radius = 42;

  return (
    <div className="w-full h-full flex items-center justify-center relative font-mono">
      <HUDCoreBalance scores={displayScores} isFullWidth={isFullWidth} />

      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-2 right-2 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 w-40 z-50 pointer-events-none shadow-[0_0_1rem_rgba(6,182,212,0.15)]"
          >
            <div className="text-[0.625rem] text-cyan-400 mb-1 font-bold border-b border-cyan-500/30 pb-1">SYS.{hoveredNode.id}_DATA</div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white">{hoveredNode.label}</span>
              <span className={`text-xs font-bold ${hoveredNode.status === 'optimal' ? 'text-emerald-400' : 'text-rose-400'}`}>{hoveredNode.val}%</span>
            </div>
            <div className="space-y-1">
              {Object.entries(hoveredNode.details).map(([k, v]) => (
                <div key={k} className="flex justify-between text-[0.5625rem]">
                  <span className="text-zinc-500 uppercase">{k}</span>
                  <span className="text-zinc-300">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`w-full h-full relative ${isFullWidth ? 'max-w-[clamp(15rem,30vw,22rem)] max-h-[clamp(15rem,30vw,22rem)]' : 'max-w-[12.5rem] max-h-[12.5rem]'}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible z-10">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx={center} cy={center} r={radius * 0.6} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <circle cx={center} cy={center} r={radius * 0.2} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '50%', originY: '50%' }}
          >
            <path d={`M 50 ${50 - radius + 5} A ${radius - 5} ${radius - 5} 0 0 1 ${50 + radius - 5} 50`} fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="0.5" />
          </motion.g>

          {nodes.map((n, i) => {
            const rad = n.angle * (Math.PI / 180);
            const tx = center + radius * Math.cos(rad);
            const ty = center + radius * Math.sin(rad);
            const dist = (n.val / 100) * radius;
            const x = center + dist * Math.cos(rad);
            const y = center + dist * Math.sin(rad);
            const lx = center + 48 * Math.cos(rad);
            const ly = center + 48 * Math.sin(rad);
            const isHovered = hoveredNode?.id === n.id;
            const isAnomaly = n.status === 'anomaly';

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(n)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <line x1={center} y1={center} x2={tx} y2={ty} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                <line x1={center} y1={center} x2={x} y2={y} stroke={isHovered ? '#06b6d4' : 'rgba(255,255,255,0.2)'} strokeWidth={isHovered ? '1' : '0.5'} />
                <motion.circle
                  cx={x} cy={y} r={isHovered ? 2.5 : 1.5}
                  fill={isAnomaly ? '#f43f5e' : (isHovered ? '#06b6d4' : '#10b981')}
                  animate={isAnomaly ? { opacity: [1, 0.4, 1], scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <circle cx={tx} cy={ty} r="1" fill="none" stroke="rgba(255,255,255,0.2)" />
                <text x={lx} y={ly} fill={isHovered ? '#06b6d4' : (isAnomaly ? '#f43f5e' : 'rgba(255,255,255,0.5)')} fontSize="3" textAnchor="middle" alignmentBaseline="middle" fontWeight="bold">
                  {n.id}
                </text>
                <circle cx={lx} cy={ly} r="8" fill="transparent" />
                <circle cx={x} cy={y} r="6" fill="transparent" />
              </g>
            );
          })}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_0.5rem_#22d3ee]" />
        </div>
      </div>
    </div>
  );
}
