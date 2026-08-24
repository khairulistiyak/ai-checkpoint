import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdvancedHUDV1({ scores, isFullWidth = false }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = [
    { id: 'RES', label: 'Responsive', val: scores?.responsive || 95, angle: 270, details: { lcp: '1.1s', cls: '0' } },
    { id: 'DYN', label: 'Dynamic', val: scores?.dynamic || 88, angle: 342, details: { fps: '60', mem: '38MB' } },
    { id: 'PRF', label: 'Performance', val: scores?.performance || 94, angle: 54, details: { load: '0.4s', cache: 'HIT' } },
    { id: 'ALY', label: 'Accessibility', val: scores?.a11y || 92, angle: 126, details: { aria: '100%', a11y: 'AAA' } },
    { id: 'SEC', label: 'Security', val: scores?.security || 99, angle: 198, details: { cve: '0', ssl: 'tls1.3' } },
  ];

  const center = 50;
  const radius = 38;

  const polygonPoints = nodes.map((n) => {
    const rad = n.angle * (Math.PI / 180);
    const dist = (Math.min(100, Math.max(10, n.val)) / 100) * radius;
    return `${center + dist * Math.cos(rad)},${center + dist * Math.sin(rad)}`;
  }).join(' ');

  return (
    <div className="w-full h-full flex items-center justify-center relative font-mono select-none">
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-1 right-1 bg-[#121214]/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 w-32 z-50 pointer-events-none shadow-2xl"
          >
            <div className="flex justify-between items-center text-[10px] text-zinc-200 border-b border-white/[0.06] pb-1 mb-1 font-medium">
              <span className="font-semibold">{hoveredNode.label}</span>
              <span className="font-bold text-zinc-100 tabular-nums">{hoveredNode.val}%</span>
            </div>
            <div className="space-y-0.5">
              {Object.entries(hoveredNode.details).map(([k, v]) => (
                <div key={k} className="flex justify-between text-[8.5px]">
                  <span className="text-zinc-500 uppercase font-medium">{k}</span>
                  <span className="text-zinc-300 font-mono">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`w-full h-full relative ${isFullWidth ? 'max-w-[clamp(15rem,30vw,20rem)] max-h-[clamp(15rem,30vw,20rem)]' : 'max-w-[11.5rem] max-h-[11.5rem]'}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible z-10">
          <defs>
            <linearGradient id="radarMeshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Web grids */}
          {[1, 0.65, 0.35].map((scale, idx) => (
            <polygon
              key={idx}
              points={nodes.map((n) => {
                const rad = n.angle * (Math.PI / 180);
                return `${center + radius * scale * Math.cos(rad)},${center + radius * scale * Math.sin(rad)}`;
              }).join(' ')}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.5"
              strokeDasharray={idx === 1 ? '1.5 1.5' : undefined}
            />
          ))}

          {/* Axis lines */}
          {nodes.map((n, i) => (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(n.angle * (Math.PI / 180))}
              y2={center + radius * Math.sin(n.angle * (Math.PI / 180))}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.5"
            />
          ))}

          {/* Polygon mesh */}
          <polygon
            points={polygonPoints}
            fill="url(#radarMeshGrad)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="0.85"
            strokeLinejoin="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Vertices */}
          {nodes.map((n, i) => {
            const rad = n.angle * (Math.PI / 180);
            const dist = (Math.min(100, Math.max(10, n.val)) / 100) * radius;
            const x = center + dist * Math.cos(rad);
            const y = center + dist * Math.sin(rad);
            const lx = center + (radius + 8) * Math.cos(rad);
            const ly = center + (radius + 8) * Math.sin(rad);
            const isHovered = hoveredNode?.id === n.id;

            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredNode(n)} onMouseLeave={() => setHoveredNode(null)}>
                <circle cx={x} cy={y} r={isHovered ? 2.4 : 1.5} fill={isHovered ? '#ffffff' : '#a1a1aa'} />
                <text x={lx} y={ly + 0.5} fill={isHovered ? '#ffffff' : 'rgba(255,255,255,0.5)'} fontSize="3.2" textAnchor="middle" alignmentBaseline="middle" fontWeight="600">
                  {n.id}
                </text>
                <circle cx={lx} cy={ly} r="7" fill="transparent" />
                <circle cx={x} cy={y} r="5" fill="transparent" />
              </g>
            );
          })}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
