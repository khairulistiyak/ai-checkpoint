import React from 'react';

// Simplified World Map Continents SVG Path Data (800x400 Equirectangular Projection)
const CONTINENT_PATHS = [
  // North America
  "M 120 70 L 190 60 L 250 80 L 270 120 L 240 160 L 190 190 L 170 170 L 160 130 L 120 100 Z M 160 50 L 210 40 L 260 50 L 240 70 Z",
  // Central & South America
  "M 190 190 L 220 220 L 250 250 L 270 300 L 240 360 L 210 340 L 190 280 L 180 230 Z",
  // Europe
  "M 390 80 L 440 70 L 490 80 L 480 120 L 430 130 L 400 110 Z M 420 50 L 450 40 L 470 60 L 440 70 Z",
  // Africa
  "M 390 140 L 480 130 L 520 180 L 490 270 L 440 310 L 410 250 L 380 180 Z",
  // Asia
  "M 490 80 L 600 60 L 720 70 L 750 130 L 680 190 L 610 180 L 540 160 L 490 130 Z M 640 190 L 680 210 L 660 250 L 620 220 Z",
  // Australia & Oceania
  "M 650 270 L 730 260 L 750 310 L 680 330 L 640 300 Z M 740 320 L 760 320 L 750 350 Z"
];

export function WorldMapSvg({ sessions = [] }) {
  // Convert Latitude (-90 to +90) and Longitude (-180 to +180) to SVG Coordinates (800x400)
  const getCoords = (lat, lon) => {
    const x = ((lon + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return {
      x: Math.max(15, Math.min(785, x)),
      y: Math.max(15, Math.min(385, y))
    };
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, #09090b 0%, #121215 100%)',
      border: '1px solid #27272a',
      borderRadius: '16px',
      padding: '20px',
      position: 'relative',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ color: '#f4f4f5', margin: 0, fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🗺️</span> Global Real-Time Visitor Map
          </h3>
          <span style={{ color: '#71717a', fontSize: '12px' }}>Latitude/Longitude Precise Coordinate Mapping</span>
        </div>
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }}></span>
          <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 600 }}>{sessions.length} Active Nodes</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', border: '1px solid #1f1f23', background: '#0e0e11' }}>
        <svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            {/* Radar Pulse Effect */}
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>

            {/* Grid Pattern */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="800" height="400" fill="url(#gridPattern)" />

          {/* Lat/Lon Equator & Prime Meridian Lines */}
          <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(99, 102, 241, 0.2)" strokeDasharray="4 4" strokeWidth="1" />
          <line x1="400" y1="0" x2="400" y2="400" stroke="rgba(99, 102, 241, 0.2)" strokeDasharray="4 4" strokeWidth="1" />

          {/* Real Continent Vector Shapes */}
          {CONTINENT_PATHS.map((pathD, idx) => (
            <path
              key={idx}
              d={pathD}
              fill="#1e1e24"
              stroke="#2d2d38"
              strokeWidth="1.2"
              style={{ transition: 'all 0.3s ease' }}
            />
          ))}

          {/* Plot Active Live Sessions as Nodes */}
          {sessions.map((s, idx) => {
            const { x, y } = getCoords(s.lat || 23.8103, s.lon || 90.4125);
            return (
              <g key={s.sessionId || idx} style={{ cursor: 'pointer' }}>
                {/* Outer Expanding Pulse */}
                <circle cx={x} cy={y} r="16" fill="url(#nodeGlow)" opacity="0.6">
                  <animate attributeName="r" values="6;22;6" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.5s" repeatCount="indefinite" />
                </circle>

                {/* Outer Ring */}
                <circle cx={x} cy={y} r="6" fill="none" stroke="#22c55e" strokeWidth="1.5" />

                {/* Inner Core Solid Dot */}
                <circle cx={x} cy={y} r="3.5" fill="#4ade80" />

                {/* Hover Tooltip */}
                <title>{`${s.flag || '📍'} ${s.city || 'Unknown'}, ${s.country || 'Location'} (${s.lat?.toFixed(2)}°, ${s.lon?.toFixed(2)}°)\nDevice: ${s.device || 'Desktop'} | Browser: ${s.browser || 'Chrome'}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
