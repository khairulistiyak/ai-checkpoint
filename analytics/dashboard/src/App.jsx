import React from 'react';
import { useLiveStream } from './hooks/useLiveStream';
import { WorldMapSvg } from './components/WorldMapSvg';

export default function App() {
  const { liveCount, todayTotal, activeSessions, connected, countries } = useLiveStream();

  return (
    <div style={{ background: '#09090b', color: '#f4f4f5', minHeight: '100vh', fontFamily: 'sans-serif', padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #27272a', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)', margin: 0, fontWeight: 700 }}>🌍 AI Checkpoint Live Analytics</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>Real-time telemetry stream & traffic monitor</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#18181b', padding: '0.375rem 0.75rem', borderRadius: '1.25rem', border: '1px solid #27272a' }}>
          <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444' }}></span>
          <span style={{ fontSize: '0.75rem', color: '#e4e4e7' }}>{connected ? 'LIVE' : 'DISCONNECTED'}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12.5rem, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#18181b', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #27272a' }}>
          <div style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>Live Users Online</div>
          <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#22c55e', marginTop: '0.25rem' }}>{liveCount}</div>
        </div>
        <div style={{ background: '#18181b', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #27272a' }}>
          <div style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>Total Visitors Today</div>
          <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#3b82f6', marginTop: '0.25rem' }}>{todayTotal}</div>
        </div>
      </div>

      <WorldMapSvg sessions={activeSessions} />
    </div>
  );
}
