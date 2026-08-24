# Phase 137: AI Intelligence HUD & Radar Clean Harmonization

> **Objective:** Harmonize the AI Intelligence component across the Cockpit HUD and the full Intelligence Hub into the "Linear Minimalist Dark Studio / Eye-Comfort Matte Dark" aesthetic. Eliminate harsh neon/cyan glows, unify color tokens with Cockpit Progress and Health Fortress, and refine typography, grid matrices, and radar micro-animations. Zero regressions.

---

## 📋 Execution Steps

### Step 137.1 — Harmonize Advanced HUD Radar Aesthetics (`dashboard/src/components/intelligence/AdvancedHUDV1.jsx`)
- **File**: `dashboard/src/components/intelligence/AdvancedHUDV1.jsx`
- **Action**: EDIT
- **Content**: Replace harsh cyan (#06b6d4, #22d3ee) and neon fills with clean, high-precision matte dark gradients (`rgba(255,255,255,0.08)` to `rgba(255,255,255,0.02)`), crisp subpixel border strokes (`rgba(255,255,255,0.3)`), subtle vertex badges, and clean frosted tooltip styling.

Replace the entire file with:
```jsx
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

          {/* Rotating scan sweep */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '50%', originY: '50%' }}
          >
            <path
              d={`M 50 ${center - radius + 4} A ${radius - 4} ${radius - 4} 0 0 1 ${center + radius - 4} 50`}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.75"
              strokeLinecap="round"
            />
          </motion.g>

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
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 137.2 — Polish Cockpit Health Overview Card (`dashboard/src/components/cockpit/CockpitHealthOverview.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitHealthOverview.jsx`
- **Action**: EDIT
- **Content**: Update the AI Intelligence card in Cockpit Health Overview to match the clean aesthetic: change the spinning spinner color from `text-cyan-400` to `text-zinc-300`, polish the bottom 3-cell metric matrix with clean typography, and refine background gradients.

Find lines 86-129 in `dashboard/src/components/cockpit/CockpitHealthOverview.jsx`:
```jsx
        {onOpenIntelligence && (
          <div onClick={onOpenIntelligence} className="group cursor-pointer hover:scale-[1.01] transition-transform active:scale-[0.99] h-full bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[14rem]" title="Click to open Full Intelligence Hub">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10 w-full">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
                  <Radio className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <span className="text-xs font-mono font-medium text-zinc-400">AI Intelligence</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchIntelligence(true);
                }}
                disabled={isIntelligenceScanning}
                className="px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-mono shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
                title="Re-scan Intelligence Hub"
              >
                <RefreshCw size={11} className={isIntelligenceScanning ? 'animate-spin text-cyan-400' : ''} />
                <span>Re-scan</span>
              </button>
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center my-0.5">
              <AdvancedHUDV1 isFullWidth={false} scores={scores} />
            </div>
            
            <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-white/[0.04] text-center relative z-10 font-mono">
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
                <div className="text-zinc-200 font-semibold text-xs tabular-nums">{scores.performance}%</div>
                <div className="text-[9px] text-zinc-500 uppercase font-medium">Perf</div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
                <div className="text-zinc-200 font-semibold text-xs tabular-nums">{scores.dynamic}%</div>
                <div className="text-[9px] text-zinc-500 uppercase font-medium">Dynamic</div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
                <div className="text-zinc-200 font-semibold text-xs tabular-nums">{scores.security}%</div>
                <div className="text-[9px] text-zinc-500 uppercase font-medium">Security</div>
              </div>
            </div>
          </div>
        )}
```

Replace with:
```jsx
        {onOpenIntelligence && (
          <div onClick={onOpenIntelligence} className="group cursor-pointer hover:scale-[1.01] transition-transform active:scale-[0.99] h-full bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[14rem]" title="Click to open Full Intelligence Hub">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10 w-full">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
                  <Radio className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <span className="text-xs font-mono font-medium text-zinc-400">AI Intelligence</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchIntelligence(true);
                }}
                disabled={isIntelligenceScanning}
                className="px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-mono shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
                title="Re-scan Intelligence Hub"
              >
                <RefreshCw size={11} className={isIntelligenceScanning ? 'animate-spin text-zinc-300' : ''} />
                <span>Re-scan</span>
              </button>
            </div>

            <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center my-0.5">
              <AdvancedHUDV1 isFullWidth={false} scores={scores} />
            </div>
            
            <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-white/[0.04] text-center relative z-10 font-mono">
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
                <div className="text-zinc-200 font-semibold text-xs tabular-nums">{scores.performance}%</div>
                <div className="text-[9px] text-zinc-500 uppercase font-medium">Perf</div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
                <div className="text-zinc-200 font-semibold text-xs tabular-nums">{scores.dynamic}%</div>
                <div className="text-[9px] text-zinc-500 uppercase font-medium">Dynamic</div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
                <div className="text-zinc-200 font-semibold text-xs tabular-nums">{scores.security}%</div>
                <div className="text-[9px] text-zinc-500 uppercase font-medium">Security</div>
              </div>
            </div>
          </div>
        )}
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 137.1

---

### Step 137.3 — Harmonize Full Intelligence Hub Design (`dashboard/src/components/intelligence/IntelligenceHub.jsx`)
- **File**: `dashboard/src/components/intelligence/IntelligenceHub.jsx`
- **Action**: EDIT
- **Content**: Replace indigo/cyan accents in header, grade badge, and radar separator with clean neutral studio tones (`bg-white/[0.04]`, `border-white/10`, `text-zinc-200`).

Find this in `dashboard/src/components/intelligence/IntelligenceHub.jsx` (lines 78-95):
```jsx
      {/* Modern Clean Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.05] pr-12">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-outfit">Intelligence Hub</h2>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm">
                <span>🥇 Grade {grade}</span>
              </span>
            </div>
            <p className="text-zinc-400 text-xs font-mono mt-0.5">World Top 1 Standard Code Quality Analysis</p>
          </div>
        </div>
```

Replace with:
```jsx
      {/* Modern Clean Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.05] pr-12">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0 shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-outfit">Intelligence Hub</h2>
              <span className="bg-white/[0.04] text-zinc-300 border border-white/10 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm">
                <span>🥇 Grade {grade}</span>
              </span>
            </div>
            <p className="text-zinc-400 text-xs font-mono mt-0.5">Code Quality & Architectural Intelligence Radar</p>
          </div>
        </div>
```

Find this in `dashboard/src/components/intelligence/IntelligenceHub.jsx` (lines 139-149):
```jsx
      {/* Top Full Width: Advanced HUD */}
      <motion.div variants={itemVariants} className="w-full flex flex-col mb-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.03),transparent_60%)] pointer-events-none" />

        <h3 className="text-[0.625rem] font-bold text-cyan-500 uppercase tracking-widest mb-0 mt-2 text-center relative z-10 flex items-center justify-center gap-2 opacity-80">
          <Activity className="w-3 h-3" /> Core Balance
        </h3>
        <div className="w-full h-[clamp(15rem,25vw,20rem)] flex items-center justify-center relative z-10">
          <AdvancedHUDV1 scores={scores} isFullWidth={true} />
        </div>
      </motion.div>
```

Replace with:
```jsx
      {/* Top Full Width: Advanced HUD */}
      <motion.div variants={itemVariants} className="w-full flex flex-col mb-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02),transparent_60%)] pointer-events-none" />

        <h3 className="text-[0.625rem] font-bold text-zinc-400 uppercase tracking-widest mb-0 mt-2 text-center relative z-10 flex items-center justify-center gap-2 opacity-80">
          <Activity className="w-3 h-3 text-zinc-400" /> Core Balance
        </h3>
        <div className="w-full h-[clamp(15rem,25vw,20rem)] flex items-center justify-center relative z-10">
          <AdvancedHUDV1 scores={scores} isFullWidth={true} />
        </div>
      </motion.div>
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 137.2

---

### Step 137.4 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run all tests.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 137.3

---

### Step 137.5 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 137.4
