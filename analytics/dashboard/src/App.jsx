import React from 'react';
import { useLiveStream } from './hooks/useLiveStream';
import { WorldMapSvg } from './components/WorldMapSvg';

export default function App() {
  const { liveCount, todayTotal, activeSessions, connected, countries } = useLiveStream();

  return (
    <div style={{ background: '#09090b', color: '#f4f4f5', minHeight: '100vh', fontFamily: 'sans-serif', padding: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #27272a', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0, fontWeight: 700 }}>🌍 AI Checkpoint Live Analytics</h1>
          <p style={{ color: '#a1a1aa', fontSize: '13px', margin: '4px 0 0' }}>Real-time telemetry stream & traffic monitor</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#18181b', padding: '6px 12px', borderRadius: '20px', border: '1px solid #27272a' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444' }}></span>
          <span style={{ fontSize: '12px', color: '#e4e4e7' }}>{connected ? 'LIVE' : 'DISCONNECTED'}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#18181b', padding: '16px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ color: '#a1a1aa', fontSize: '12px' }}>Live Users Online</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#22c55e', marginTop: '4px' }}>{liveCount}</div>
        </div>
        <div style={{ background: '#18181b', padding: '16px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ color: '#a1a1aa', fontSize: '12px' }}>Total Visitors Today</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>{todayTotal}</div>
        </div>
      </div>

      <WorldMapSvg sessions={activeSessions} />
    </div>
  );
}
