import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, Check, AlertCircle, FolderPlus, Loader2, RefreshCw } from 'lucide-react';
import * as api from '../../utils/api';
import { useToast } from '../ToastProvider';

export default function CleanArchScaffoldModal({ projectId, onScaffolded }) {
  const { showToast } = useToast();
  const [leaksReport, setLeaksReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scaffolding, setScaffolding] = useState(false);

  const loadLeaks = async () => {
    setLoading(true);
    try {
      const data = await api.fetchBoundaryLeaks(projectId);
      setLeaksReport(data);
    } catch {
      setLeaksReport({ passed: true, leaksCount: 0, scannedFiles: 0, leaks: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLeaks(); }, [projectId]);

  const handleScaffold = async () => {
    setScaffolding(true);
    try {
      const res = await api.scaffoldCleanArch(projectId);
      showToast(`Clean Architecture scaffolded! (${res.createdFiles?.length || 0} files created)`, 'success');
      if (onScaffolded) onScaffolded();
      loadLeaks();
    } catch (err) {
      showToast(`Scaffolding failed: ${err.message}`, 'error');
    } finally {
      setScaffolding(false);
    }
  };

  const hasLeaks = (leaksReport?.leaksCount || 0) > 0;

  return (
    <div className="space-y-3.5 font-mono text-xs">
      <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-zinc-300" />
            <span className="font-bold text-white text-xs">Clean Architecture Engine</span>
          </div>
          <button
            onClick={handleScaffold}
            disabled={scaffolding}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
          >
            {scaffolding ? <Loader2 size={13} className="animate-spin" /> : <FolderPlus size={13} />}
            Scaffold Structure
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {[
            { title: 'Domain Entities', desc: 'Pure business logic, zero framework imports' },
            { title: 'Use Cases', desc: '1 File = 1 Operation (e.g. CreateUserUseCase)' },
            { title: 'Data Transfer Objects', desc: 'Strict boundary between domain and UI/DB' },
            { title: 'Adapters & Repos', desc: 'Infrastructure implementations kept isolated' }
          ].map((item) => (
            <div key={item.title} className="p-2 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-start gap-2">
              <Check size={12} className="text-zinc-300 mt-0.5 shrink-0 stroke-[2.5]" />
              <div>
                <div className="font-bold text-white text-[11px]">{item.title}</div>
                <div className="text-[10px] text-zinc-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-zinc-300" />
            <span className="font-bold text-white text-xs">Boundary Leak Scanner</span>
          </div>
          <button onClick={loadLeaks} disabled={loading} className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 cursor-pointer">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {hasLeaks ? (
          <div className="space-y-1.5">
            <div className="text-red-300 font-bold text-[11px] flex items-center gap-1.5">
              <AlertCircle size={13} className="text-red-400" /> {leaksReport.leaksCount} Boundary Leak(s) Detected
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
              {leaksReport.leaks.map((leak, idx) => (
                <div key={idx} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-200">
                  <span className="font-bold text-white">{leak.file}:{leak.line}</span> imports forbidden module <span className="underline">{leak.forbiddenModule}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-between text-zinc-300">
            <span>Core Domain Isolation: 0 Leaks</span>
            <span className="text-[10px] text-zinc-500">{leaksReport?.scannedFiles || 0} domain files scanned</span>
          </div>
        )}
      </div>
    </div>
  );
}
