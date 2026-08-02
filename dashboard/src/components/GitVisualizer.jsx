import React, { useState, useEffect } from 'react';
import { GitCommit, Clock, RotateCcw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import * as api from '../utils/api';
import { useToast } from './ToastProvider';
import ConfirmModal from './ConfirmModal';

export default function GitVisualizer({ projectId, onRefresh }) {
  const { showToast } = useToast();
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rollingBack, setRollingBack] = useState(false);
  const [confirmHash, setConfirmHash] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.fetchProjectCheckpoints(projectId);
        if (!cancelled) setCheckpoints(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    setLoading(true);
    load();
    const interval = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [projectId]);

  const handleRollback = async () => {
    if (!confirmHash) return;
    setRollingBack(true);
    try {
      await api.rollbackCheckpoint(projectId, confirmHash);
      showToast('Rollback successful!', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(`Rollback failed: ${err.message}`, 'error');
    } finally {
      setRollingBack(false);
      setConfirmHash(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (checkpoints.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-white/50 italic font-mono text-xs">
        No checkpoints found. Use `./l cp save "message"` to create one.
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-full py-2">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-white/15"></div>
        <div className="space-y-4">
          {checkpoints.map((cp, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={cp.hash}
              className="flex items-start gap-4 group relative z-10"
            >
              <div className="w-8 h-8 rounded-full bg-[#09090b] border border-white/30 flex items-center justify-center shrink-0 shadow-sm mt-1 group-hover:border-white transition-colors z-10">
                <div className="w-2 h-2 rounded-full bg-white transition-colors"></div>
              </div>
              <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl p-4 group-hover:border-white/25 group-hover:bg-white/[0.05] transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <span className="font-mono text-xs text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 shrink-0 font-bold">{cp.hash}</span>
                    <span className="text-xs text-white/60 flex items-center gap-1 shrink-0 font-mono">
                      <Clock className="w-3 h-3 text-white/40" /> {cp.timeAgo}
                    </span>
                    <span className="text-xs text-white/50 truncate font-mono">{cp.author}</span>
                  </div>
                  <div className="text-white font-medium text-sm truncate pr-2 font-mono" title={cp.message}>
                    {cp.message.replace(/^(?:aicp\/[^\s]+|checkpoint:)\s*/i, '')}
                  </div>
                </div>
                <button
                  onClick={() => setConfirmHash(cp.hash)}
                  disabled={rollingBack}
                  className="px-3.5 py-2 bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all border border-white/10 hover:border-red-500/30 flex items-center justify-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto mt-2 sm:mt-0 cursor-pointer"
                >
                  {rollingBack ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>Rollback</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(confirmHash)}
        title="Rollback Checkpoint"
        message={`Are you sure you want to rollback to checkpoint ${confirmHash}? This will reset local files to that state.`}
        confirmText="Yes, Rollback"
        confirmStyle="danger"
        onConfirm={handleRollback}
        onCancel={() => setConfirmHash(null)}
      />
    </>
  );
}
