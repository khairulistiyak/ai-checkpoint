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
        <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
      </div>
    );
  }

  if (checkpoints.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-slate-400 italic">
        No checkpoints found. Use `./l cp save "message"` to create one.
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-full py-2">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-700/50"></div>
        <div className="space-y-6">
          {checkpoints.map((cp, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={cp.hash}
              className="flex items-start gap-4 group relative z-10"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-primary-500/50 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.2)] mt-1 group-hover:border-accent-400 transition-colors z-10">
                <div className="w-2 h-2 rounded-full bg-primary-400 group-hover:bg-accent-400 transition-colors"></div>
              </div>
              <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-4 group-hover:border-slate-600 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-accent-300 bg-accent-500/10 px-2 py-0.5 rounded border border-accent-500/20 shrink-0">{cp.hash}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" /> {cp.timeAgo}
                    </span>
                    <span className="text-xs text-slate-500 truncate">{cp.author}</span>
                  </div>
                  <div className="text-slate-200 text-sm truncate pr-2" title={cp.message}>{cp.message.replace(/^(?:aicp\/[^\s]+|checkpoint:)\s*/i, '')}</div>
                </div>
                <button
                  onClick={() => setConfirmHash(cp.hash)}
                  disabled={rollingBack}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg text-xs font-medium transition-colors border border-transparent hover:border-red-500/30 flex items-center justify-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto mt-2 sm:mt-0"
                >
                  {rollingBack ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  Rollback
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <ConfirmModal
        isOpen={!!confirmHash}
        title="Rollback Checkpoint"
        message={`This will reset the project to checkpoint ${confirmHash}. All unsaved changes will be lost.`}
        confirmText="Yes, Rollback"
        cancelText="Cancel"
        danger={true}
        onConfirm={handleRollback}
        onCancel={() => setConfirmHash(null)}
      />
    </>
  );
}
