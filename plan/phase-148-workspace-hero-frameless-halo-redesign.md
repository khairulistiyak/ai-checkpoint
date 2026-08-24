# Phase 148: Workspace Hero Progress Indicator — Frameless Radial Halo Redesign

> **Objective:** Upgrade the workspace hero progress indicator in `ProjectCard.jsx` and `ProgressRing.jsx` to Concept 1 (Frameless Radial Halo), eliminating the square container box for a seamless, floating glowing radial gauge. Zero regressions.

---

## 📋 Execution Steps

### Step 148.1 — Redesign ProgressRing to Frameless Radial Halo (`dashboard/src/components/ProgressRing.jsx`)
- **File**: `dashboard/src/components/ProgressRing.jsx`
- **Action**: EDIT
- **Content**: Implement frameless halo styling with React `useId`, soft glowing track drop shadow, and crisp centered percentage. Keep file <= 150 lines.

Replace the file with:
```jsx
import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ProgressRing({ percentage, size = 46, strokeWidth = 3.5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isDone = percentage === 100;
  const rawId = useId();
  const gradientId = `progress-halo-${rawId.replace(/:/g, '')}`;

  const gradientStops = isDone
    ? { start: '#10b981', end: '#06b6d4' } // Emerald to Cyan
    : { start: '#6366f1', end: '#a855f7' }; // Indigo to Purple

  return (
    <div className="relative flex items-center justify-center shrink-0 select-none" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStops.start} />
            <stop offset="100%" stopColor={gradientStops.end} />
          </linearGradient>
        </defs>

        {/* Halo Track Circle */}
        <circle
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Animated Halo Glow Circle */}
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
            filter: `drop-shadow(0 0 7px ${gradientStops.start}50)`
          }}
        />
      </svg>

      {/* Centered Percentage Value */}
      <div className="absolute inset-0 flex items-center justify-center text-white font-mono font-bold">
        {isDone ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <span style={{ fontSize: Math.max(size * 0.25, 11) }} className="text-zinc-100 tracking-tighter">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 148.2 — Mount Frameless Radial Halo in ProjectCard (`dashboard/src/components/ProjectCard.jsx`)
- **File**: `dashboard/src/components/ProjectCard.jsx`
- **Action**: EDIT
- **Content**: Mount the frameless radial halo directly without the outer square box. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 148.1

---

### Step 148.3 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 148.2

---

### Step 148.4 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 148.3
