import React, { useState, useEffect, useMemo } from "react";
import {
  GitCommit,
  Clock,
  RotateCcw,
  Loader2,
  Search,
  Copy,
  Check,
  Shield,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as api from "../utils/api";
import { useToast } from "./ToastProvider";
import ConfirmModal from "./ConfirmModal";

export default function GitVisualizer({ projectId, onRefresh }) {
  const { showToast } = useToast();
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rollingBack, setRollingBack] = useState(false);
  const [confirmHash, setConfirmHash] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedHash, setCopiedHash] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.fetchProjectCheckpoints(projectId);
        if (!cancelled) setCheckpoints(data || []);
      } catch (err) {
        console.error("Failed to load git checkpoints:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    setLoading(true);
    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [projectId]);

  const handleRollback = async () => {
    if (!confirmHash) return;
    setRollingBack(true);
    try {
      await api.rollbackCheckpoint(projectId, confirmHash);
      showToast(
        `Rollback to ${confirmHash.slice(0, 7)} successful!`,
        "success",
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(`Rollback failed: ${err.message}`, "error");
    } finally {
      setRollingBack(false);
      setConfirmHash(null);
    }
  };

  const handleCopyHash = (hash, e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      showToast(`Copied commit ${hash.slice(0, 7)}`, "info");
      setTimeout(() => setCopiedHash(null), 2000);
    }
  };

  const filteredCheckpoints = useMemo(() => {
    if (!searchQuery.trim()) return checkpoints;
    const q = searchQuery.toLowerCase();
    return checkpoints.filter(
      (cp) =>
        cp.hash.toLowerCase().includes(q) ||
        (cp.message && cp.message.toLowerCase().includes(q)) ||
        (cp.author && cp.author.toLowerCase().includes(q)),
    );
  }, [checkpoints, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-white/50">
        <Loader2 className="w-8 h-8 animate-spin text-white mb-3" />
        <span className="text-xs font-mono">Loading Git snapshots...</span>
      </div>
    );
  }

  if (checkpoints.length === 0) {
    return (
      <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-8 text-center text-white/60 bg-white/[0.02] border border-white/5 rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
          <GitCommit className="w-6 h-6 text-white/40" />
        </div>
        <h4 className="text-sm font-bold text-white mb-1 font-outfit">
          No Checkpoints Recorded Yet
        </h4>
        <p className="text-xs text-white/40 max-w-sm mb-4">
          Save an instant recovery snapshot before making changes.
        </p>
        <button
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText('./l cp save "Initial checkpoint"');
              showToast("Copied checkpoint command to clipboard!", "success");
            }
          }}
          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-mono flex items-center gap-2 cursor-pointer transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>./l cp save "Initial checkpoint"</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and Stats Bar */}
      <div className="flex items-center justify-between gap-2.5 mb-2.5 pb-2 border-b border-cyber-card-border shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-cyber-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search snapshots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-cyber-dark/50 border border-cyber-card-border text-xs text-cyber-text-primary placeholder-cyber-text-muted focus:outline-none focus:border-cyber-accent/30 font-mono transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-cyber-text-secondary bg-cyber-dark/50 px-2 py-0.5 rounded-md border border-cyber-card-border">
            {filteredCheckpoints.length} / {checkpoints.length} Snapshots
          </span>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative flex-1 py-1 pr-1 overflow-y-auto custom-scrollbar max-h-[340px]">
        <div className="absolute left-[9px] top-4 bottom-2 w-px bg-cyber-card-border" />
        <div className="space-y-2">
          {filteredCheckpoints.map((cp, idx) => {
            const isLatest = idx === 0 && !searchQuery;
            const isCopied = copiedHash === cp.hash;

            return (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                key={cp.hash}
                className="flex items-start gap-2.5 group relative z-10"
              >
                {/* Sleek Node Dot */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1.5 z-10 transition-all bg-cyber-card border ${
                    isLatest
                      ? "border-cyber-accent"
                      : "border-cyber-card-border group-hover:border-cyber-text-secondary"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${isLatest ? "bg-cyber-accent" : "bg-cyber-text-muted group-hover:bg-cyber-text-secondary"}`}
                  />
                </div>

                {/* Card */}
                <div className="flex-1 bg-cyber-dark/30 border border-cyber-card-border rounded-xl p-2.5 group-hover:border-cyber-accent/20 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <button
                        onClick={(e) => handleCopyHash(cp.hash, e)}
                        title="Click to copy full commit hash"
                        className="font-mono text-[10px] text-cyber-text-primary bg-cyber-accent/10 hover:bg-cyber-accent/20 px-1.5 py-0.5 rounded border border-cyber-accent/20 shrink-0 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>{cp.hash.slice(0, 7)}</span>
                        {isCopied ? (
                          <Check className="w-2.5 h-2.5 text-workflow-success" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 text-cyber-text-muted" />
                        )}
                      </button>

                      {isLatest && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-workflow-success/10 text-workflow-success border border-workflow-success/20 font-bold uppercase tracking-wider">
                          Latest Head
                        </span>
                      )}

                      <span className="text-[10px] text-cyber-text-secondary flex items-center gap-1 shrink-0 font-mono">
                        <Clock className="w-2.5 h-2.5 text-cyber-text-muted" />{" "}
                        {cp.timeAgo || "recent"}
                      </span>

                      {cp.author && (
                        <span className="text-[10px] text-cyber-text-muted truncate font-mono hidden md:inline">
                          by {cp.author}
                        </span>
                      )}
                    </div>

                    <div
                      className="text-cyber-text-primary text-xs font-mono break-words leading-relaxed"
                      title={cp.message}
                    >
                      {cp.message.replace(
                        /^(?:aicp\/[^\s]+|checkpoint:)\s*/i,
                        "",
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setConfirmHash(cp.hash)}
                    disabled={rollingBack}
                    className="px-2.5 py-1 bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-300 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all border border-white/10 hover:border-red-500/30 flex items-center justify-center gap-1 shrink-0 self-end sm:self-auto w-full sm:w-auto cursor-pointer"
                  >
                    {rollingBack ? (
                      <Loader2 className="w-3 h-3 animate-spin text-white" />
                    ) : (
                      <RotateCcw className="w-3 h-3" />
                    )}
                    <span>Rollback</span>
                  </button>
                </div>
              </motion.div>
            );
          })}

          {filteredCheckpoints.length === 0 && (
            <div className="p-6 text-center text-white/40 font-mono text-xs">
              No snapshots matched "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(confirmHash)}
        title="Rollback Git Checkpoint"
        message={`Are you sure you want to rollback to checkpoint ${confirmHash?.slice(
          0,
          7,
        )}? This will safely revert project files to this state.`}
        confirmText="Yes, Rollback"
        confirmStyle="danger"
        onConfirm={handleRollback}
        onCancel={() => setConfirmHash(null)}
      />
    </div>
  );
}
