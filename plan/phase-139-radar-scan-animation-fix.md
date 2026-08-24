# Phase 139: AI Intelligence Radar Scan Animation Fix & Polish

> **Objective:** Fix the stationary/non-animating radar sweep line in `AdvancedHUDV1.jsx` by implementing hardware-accelerated CSS rotation with explicit SVG center coordinates (`transformOrigin: '50px 50px'`), adding a subtle radar sweep ray, and adjusting speed to 6s for visible, elegant animation. Zero regressions.

---

## 📋 Execution Steps

### Step 139.1 — Fix SVG Radar Sweep Animation (`dashboard/src/components/intelligence/AdvancedHUDV1.jsx`)
- **File**: `dashboard/src/components/intelligence/AdvancedHUDV1.jsx`
- **Action**: EDIT
- **Content**: Replace non-triggering Framer Motion SVG `<motion.g>` with hardware-accelerated CSS animation (`animate-[spin_6s_linear_infinite]`) with exact SVG `transformOrigin: '50px 50px'` and an elegant scanning needle ray. Ensure file stays <= 150 lines.

Replace lines 87-101 with:
```jsx
          {/* Rotating scan sweep */}
          <g
            className="animate-[spin_6s_linear_infinite]"
            style={{ transformOrigin: '50px 50px' }}
          >
            <path
              d={`M 50 ${center - radius + 4} A ${radius - 4} ${radius - 4} 0 0 1 ${center + radius - 4} 50`}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.85"
              strokeLinecap="round"
            />
            <line
              x1={center}
              y1={center}
              x2={center}
              y2={center - radius + 4}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
              strokeDasharray="1 1"
            />
          </g>
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 139.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 139.1

---

### Step 139.3 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 139.2
