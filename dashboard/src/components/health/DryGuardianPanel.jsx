import React, { useState, useEffect } from 'react';
import { Layers, Search, Sparkles, Copy, Check, Sliders, RefreshCw } from 'lucide-react';
import { fetchDryAnalysis, fetchUtilityIndex, fetchRefactorProposal } from '../../utils/api';

export default function DryGuardianPanel({ projectId }) {
  const [threshold, setThreshold] = useState(75);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [utils, setUtils] = useState([]);
  const [activeTab, setActiveTab] = useState('duplicates');
  const [proposals, setProposals] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchDryAnalysis(projectId, { threshold });
      setData(res);
    } catch {} finally { setLoading(false); }
  };

  const loadUtils = async (q) => {
    try {
      const res = await fetchUtilityIndex(projectId, q);
      setUtils(res.results || []);
    } catch {}
  };

  useEffect(() => { loadData(); }, [projectId, threshold]);
  useEffect(() => { if (activeTab === 'utils') loadUtils(query); }, [projectId, query, activeTab]);

  const handleGetProposal = async (idx, pair) => {
    try {
      const res = await fetchRefactorProposal(projectId, pair);
      setProposals(prev => ({ ...prev, [idx]: res }));
    } catch {}
  };

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const scoreColor = (data?.dryScore || 0) >= 90 ? '#10b981' : (data?.dryScore || 0) >= 70 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="bg-[#121214] border border-white/[0.08] rounded-2xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Layers className="w-4 h-4 text-zinc-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">DRY Code Redundancy Guardian</h3>
            <p className="text-xs font-mono text-zinc-400">Multi-layer fingerprinting & duplicate logic prevention.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-300">
            <Sliders size={13} className="text-zinc-400" />
            <span>Sensitivity: {threshold}%</span>
            <input type="range" min="50" max="95" step="5" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-16 accent-zinc-300 h-1 bg-white/10 rounded cursor-pointer" />
          </div>
          <button onClick={loadData} disabled={loading} className="p-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-zinc-300 transition-all cursor-pointer">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-black/30 border border-white/[0.06] p-3.5 rounded-xl">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">DRY Score</div>
          <div className="text-2xl font-bold font-mono tracking-tight mt-1" style={{ color: scoreColor }}>{data?.dryScore ?? '--'}/100</div>
        </div>
        <div className="bg-black/30 border border-white/[0.06] p-3.5 rounded-xl">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Functions Scanned</div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight mt-1">{data?.functionsScanned ?? '--'}</div>
        </div>
        <div className="bg-black/30 border border-white/[0.06] p-3.5 rounded-xl">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Duplicate Pairs</div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight mt-1">{data?.duplicatesCount ?? '--'}</div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/[0.06] pb-2">
        <button onClick={() => setActiveTab('duplicates')} className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${activeTab === 'duplicates' ? 'bg-white/10 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}>Duplicates ({data?.duplicatesCount || 0})</button>
        <button onClick={() => setActiveTab('utils')} className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${activeTab === 'utils' ? 'bg-white/10 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}>Utility Explorer</button>
      </div>

      {activeTab === 'duplicates' && (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {(!data?.duplicates || data.duplicates.length === 0) ? (
            <div className="text-center py-8 text-xs font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 rounded-xl">Perfect DRY compliance! No duplicate logic detected at {threshold}% threshold.</div>
          ) : (
            data.duplicates.map((dup, i) => (
              <div key={i} className="bg-black/20 border border-white/[0.06] rounded-xl p-3.5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{dup.funcA.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">{Math.round(dup.score * 100)}% match ({dup.type})</span>
                </div>
                <div className="text-zinc-400 space-y-0.5 text-[11px]">
                  <div>├─ {dup.funcA.file}:{dup.funcA.line}</div>
                  <div>└─ {dup.funcB.file}:{dup.funcB.line}</div>
                </div>
                {!proposals[i] ? (
                  <button onClick={() => handleGetProposal(i, dup)} className="flex items-center gap-1.5 text-[11px] text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-all cursor-pointer">
                    <Sparkles size={11} /> Propose Shared Extraction
                  </button>
                ) : (
                  <div className="mt-2 p-2.5 bg-black/40 rounded-lg border border-white/10 space-y-2 text-[11px]">
                    <div className="text-zinc-300 font-semibold">{proposals[i].guidance}</div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Target: {proposals[i].targetFile}</span>
                      <button onClick={() => handleCopy(`prop-${i}`, proposals[i].proposedModuleContent)} className="flex items-center gap-1 text-zinc-300 hover:text-white cursor-pointer">
                        {copiedKey === `prop-${i}` ? <Check size={11} /> : <Copy size={11} />} Copy Code
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'utils' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search reusable utilities (e.g. walk, date, hash)..." className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/20" />
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {utils.map((u, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-black/20 border border-white/[0.04] text-xs font-mono">
                <div>
                  <div className="text-white font-semibold">{u.name}({u.params})</div>
                  <div className="text-[10px] text-zinc-500">{u.file}:{u.line} {u.docSummary ? `— ${u.docSummary}` : ''}</div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${u.exported ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-white/5 text-zinc-400'}`}>{u.exported ? 'export' : 'local'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
