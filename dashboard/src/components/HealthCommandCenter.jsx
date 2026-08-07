import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const BASE = window.location.origin;

export default function HealthCommandCenter({ projectId }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealth = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/api/projects/${projectId}/health`);
      if (!res.ok) throw new Error('Failed to fetch health');
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  const scoreColor = !health ? '#888' : health.score >= 90 ? '#4ade80' : health.score >= 60 ? '#facc15' : '#f87171';

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} style={{ color: scoreColor }} />
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0' }}>Health Center</span>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '6px 14px', color: '#94a3b8', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Scanning...' : 'Re-scan'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', color: '#f87171', marginBottom: '16px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {health && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', marginBottom: '16px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '48px', fontWeight: 700, color: scoreColor }}>{health.score}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>/100 — {health.filesScanned} files scanned</div>
            <div style={{ marginTop: '8px', fontSize: '14px', color: health.passed ? '#4ade80' : '#f87171' }}>
              {health.passed ? '✅ All Clear' : '⚠️ Issues Found'}
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Syntax', value: health.breakdown.syntaxErrors, icon: health.breakdown.syntaxErrors === 0 ? CheckCircle2 : XCircle },
              { label: 'Imports', value: health.breakdown.brokenImports, icon: health.breakdown.brokenImports === 0 ? CheckCircle2 : AlertTriangle },
              { label: 'Rule 0', value: health.breakdown.rule0Violations, icon: health.breakdown.rule0Violations === 0 ? CheckCircle2 : AlertTriangle },
              { label: 'Critical', value: health.breakdown.criticalSecurity, icon: health.breakdown.criticalSecurity === 0 ? CheckCircle2 : XCircle },
              { label: 'Warnings', value: health.breakdown.warningSecurity, icon: health.breakdown.warningSecurity === 0 ? CheckCircle2 : AlertTriangle },
            ].map(item => {
              const Icon = item.icon;
              const ok = item.value === 0;
              return (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <Icon size={16} style={{ color: ok ? '#4ade80' : '#f87171', marginBottom: '4px' }} />
                  <div style={{ fontSize: '20px', fontWeight: 600, color: ok ? '#4ade80' : '#f87171' }}>{item.value}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{item.label}</div>
                </div>
              );
            })}
          </div>

          {health.issues.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px', maxHeight: '200px', overflowY: 'auto' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Issues ({health.issues.length})</div>
              {health.issues.slice(0, 20).map((issue, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#94a3b8', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#f87171', flexShrink: 0 }}>•</span>
                  <span style={{ color: '#64748b', flexShrink: 0 }}>{(issue.file || '').split('/').pop()}{issue.line ? `:${issue.line}` : ''}</span>
                  <span>{issue.error || issue.msg || issue.type}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!health && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
          Click "Re-scan" to run health check
        </div>
      )}
    </div>
  );
}
