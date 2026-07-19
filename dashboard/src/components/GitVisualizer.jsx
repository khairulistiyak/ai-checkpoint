import React, { useState, useEffect } from 'react';
import { GitCommit, Clock, RotateCcw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import * as api from '../utils/api';

export default function GitVisualizer({ projectId, onRefresh }) {
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rollingBack, setRollingBack] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await api.fetchProjectCheckpoints(projectId);
        setCheckpoints(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [projectId]);

  const handleRollback = async (hash) => {
    if (!confirm(`WARNING: This will reset the project to checkpoint ${hash}. Unsaved changes will be lost. Are you sure?`)) return;
    
    setRollingBack(true);
    try {
      await api.rollbackCheckpoint(projectId, hash);
      alert('Rollback successful!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Rollback failed: ${err.message}`);
    } finally {
      setRollingBack(false);
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
        No checkpoints found. Ensure you are using `aicp/` or `checkpoint:` tags.
      </div>
    );
  }

  return (
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
              <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-4 group-hover:border-slate-600 transition-colors flex justify-between items-center gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-accent-300 bg-accent-500/10 px-2 py-0.5 rounded border border-accent-500/20 shrink-0">{cp.hash}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" /> {cp.timeAgo}
                    </span>
                    <span className="text-xs text-slate-500 truncate">{cp.author}</span>
                  </div>
                  <div className="text-slate-200 text-sm truncate pr-2">{cp.message.replace(/^(?:aicp\/[^\s]+|checkpoint:)\s*/i, '')}</div>
                </div>
                
                <button
                  onClick={() => handleRollback(cp.hash)}
                  disabled={rollingBack}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white border border-red-500/20"
                  title="Rollback to this checkpoint"
                >
                  <RotateCcw className={`w-4 h-4 ${rollingBack ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
  );
}
