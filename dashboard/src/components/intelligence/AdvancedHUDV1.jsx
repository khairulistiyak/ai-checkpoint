import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdvancedHUDV1({ scores, isFullWidth = false }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Ensure scores is mapped correctly if passed as an object from report.scores
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
    { id: 'RES', label: 'Responsive', val: scores.responsive, angle: 270, status: scores.responsive >= 90 ? 'optimal' : 'anomaly', details: { lcp: '1.2s', shift: '0', tti: '0.8s' } },
    { id: 'DYN', label: 'Dynamic', val: scores.dynamic, angle: 342, status: scores.dynamic >= 90 ? 'optimal' : 'anomaly', details: { render: '60fps', mem: '45MB', state: 'synced' } },
    { id: 'PRF', label: 'Performance', val: scores.performance, angle: 54, status: scores.performance >= 90 ? 'optimal' : 'anomaly', details: { bundle: '240kb', cache: 'HIT', paint: 'fast' } },
    { id: 'ALY', label: 'A11y', val: scores.a11y, angle: 126, status: scores.a11y >= 90 ? 'optimal' : 'anomaly', details: { contrast: 'AAA', aria: '100%', focus: 'visible' } },
    { id: 'SEC', label: 'Security', val: scores.security, angle: 198, status: scores.security >= 90 ? 'optimal' : 'anomaly', details: { csp: 'strict', ssl: 'tls1.3', xss: 'safe' } },
  ];

  const center = 50;
  const radius = 42;

  return (
    <div className="w-full h-full flex items-center justify-center relative font-mono">
      
      {/* Floating Core Balance (Left) */}
      {isFullWidth && (
        <div className="absolute left-8 lg:left-24 top-1/2 -translate-y-1/2 flex flex-col gap-6 w-48 z-20">
          {displayScores.slice(0, 3).map((m, i) => (
            <div key={`l-${i}`} className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="text-zinc-400 text-[0.625rem] uppercase tracking-widest">{m.id}</span>
                <span className="text-zinc-100 text-xs font-bold">{m.val}%</span>
              </div>
              <div className="w-full h-[0.125rem] bg-white/[0.03] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: m.color }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${m.val}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Core Balance (Right) */}
      {isFullWidth && (
        <div className="absolute right-8 lg:right-24 top-1/2 -translate-y-1/2 flex flex-col gap-6 w-48 z-20">
          {displayScores.slice(3, 5).map((m, i) => (
            <div key={`r-${i}`} className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="text-zinc-400 text-[0.625rem] uppercase tracking-widest">{m.id}</span>
                <span className="text-zinc-100 text-xs font-bold">{m.val}%</span>
              </div>
              <div className="w-full h-[0.125rem] bg-white/[0.03] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: m.color }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${m.val}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip Overlay */}
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
          {/* Target Rings */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx={center} cy={center} r={radius * 0.6} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <circle cx={center} cy={center} r={radius * 0.2} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Sweeping Scanner */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            style={{ originX: '50%', originY: '50%' }}
          >
            <path d={`M 50 ${50 - radius + 5} A ${radius - 5} ${radius - 5} 0 0 1 ${50 + radius - 5} 50`} fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="0.5" />
          </motion.g>

          {/* Connectors & Nodes */}
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
                <line x1={center} y1={center} x2={x} y2={y} stroke={isHovered ? "#06b6d4" : "rgba(255,255,255,0.2)"} strokeWidth={isHovered ? "1" : "0.5"} />
                
                <motion.circle 
                  cx={x} cy={y} r={isHovered ? 2.5 : 1.5} 
                  fill={isAnomaly ? "#f43f5e" : (isHovered ? "#06b6d4" : "#10b981")}
                  animate={isAnomaly ? { opacity: [1, 0.4, 1], scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                />

                <circle cx={tx} cy={ty} r="1" fill="none" stroke="rgba(255,255,255,0.2)" />

                <text x={lx} y={ly} fill={isHovered ? "#06b6d4" : (isAnomaly ? "#f43f5e" : "rgba(255,255,255,0.5)")} fontSize="3" textAnchor="middle" alignmentBaseline="middle" fontWeight="bold">
                  {n.id}
                </text>
                
                <circle cx={lx} cy={ly} r="8" fill="transparent" />
                <circle cx={x} cy={y} r="6" fill="transparent" />
              </g>
            );
          })}
        </svg>

        {/* Central Core Element */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_0.5rem_#22d3ee]" />
        </div>
      </div>
    </div>
  );
}
