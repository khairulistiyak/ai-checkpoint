import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function TrendLineChart({ history }) {
  const { pathData, areaPathData, points } = useMemo(() => {
    if (!history || history.length < 2) return { pathData: null, areaPathData: null, points: [] };

    const pts = history.map((h, i) => ({
      x: (i / (history.length - 1)) * 100,
      y: 100 - h.averageScore,
      score: h.averageScore,
      date: new Date(h.timestamp).toLocaleString()
    }));

    // Generate smooth bezier curve (Catmull-Rom to Bezier approximation or simple smooth curve)
    // For simplicity and performance, using a basic cubic bezier smoothing
    const lineCommand = (point, i, a) => {
      const length = (element) => Math.sqrt(Math.pow(element.x, 2) + Math.pow(element.y, 2));
      const controlPoint = (current, previous, next, reverse) => {
        const p = previous || current;
        const n = next || current;
        const smoothing = 0.2;
        const o = { x: n.x - p.x, y: n.y - p.y };
        const angle = Math.atan2(o.y, o.x);
        const l = length(o) * smoothing;
        const x = current.x + Math.cos(angle + (reverse ? Math.PI : 0)) * l;
        const y = current.y + Math.sin(angle + (reverse ? Math.PI : 0)) * l;
        return { x, y };
      };

      const cps = controlPoint(a[i - 1], a[i - 2], point, false);
      const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
      return `C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
    };

    const d = pts.reduce((acc, point, i, a) => i === 0 ? `M ${point.x},${point.y}` : `${acc} ${lineCommand(point, i, a)}`, '');
    const areaD = `${d} L 100,100 L 0,100 Z`;

    return { pathData: d, areaPathData: areaD, points: pts };
  }, [history]);

  return (
    <div className="h-full w-full relative font-mono text-xs md:text-sm">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.2)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
          </linearGradient>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {!pathData ? (
          <text x="50" y="50" textAnchor="middle" fill="#52525b" fontSize="4">Not enough history yet</text>
        ) : (
          <>
            {/* Area under curve */}
            <motion.path
              d={areaPathData}
              fill="url(#trendArea)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            />

            {/* Glowing line */}
            <motion.path
              d={pathData}
              fill="none"
              stroke="#818cf8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Solid core line */}
            <motion.path
              d={pathData}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Interactive Data Points */}
            {points.map((p, i) => (
              <motion.circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="1.5"
                fill="#ffffff"
                stroke="#4f46e5"
                strokeWidth="0.5"
                className="hover:scale-125 transition-transform cursor-pointer shadow-xl"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1 + i * 0.1, type: "spring" }}
              >
                <title>{p.date} - Score: {p.score}</title>
              </motion.circle>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
