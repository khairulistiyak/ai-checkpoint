import React, { useState, useEffect, useMemo } from "react";
import { Loader2, Search } from "lucide-react";
import * as api from "../utils/api";
import { useToast } from "./ToastProvider";
import ConfirmModal from "./ConfirmModal";
import GitCommitCard from "./git/GitCommitCard";
import GitEmptyCheckpoints from "./git/GitEmptyCheckpoints";

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
    return () => { cancelled = true; clearInterval(interval); };
  }, [projectId]);

  const handleRollback = async () => {
    if (!confirmHash) return;
    setRollingBack(true);
    try {
      await api.rollbackCheckpoint(projectId, confirmHash);
      showToast(`Rollback to ${confirmHash.slice(0, 7)} successful!`, "success");
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
      <GitEmptyCheckpoints
        onCopyCommand={() => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText('./l cp save "Initial checkpoint"');
            showToast("Copied checkpoint command to clipboard!", "success");
          }
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
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
        <span className="text-[10px] font-mono text-cyber-text-secondary bg-cyber-dark/50 px-2 py-0.5 rounded-md border border-cyber-card-border">
          {filteredCheckpoints.length} / {checkpoints.length} Snapshots
        </span>
      </div>

      <div className="relative flex-1 py-1 pr-1 overflow-y-auto custom-scrollbar max-h-[340px]">
        <div className="absolute left-[9px] top-4 bottom-2 w-px bg-cyber-card-border" />
        <div className="space-y-2">
          {filteredCheckpoints.map((cp, idx) => (
            <GitCommitCard
              key={cp.hash}
              cp={cp}
              idx={idx}
              isLatest={idx === 0 && !searchQuery}
              isCopied={copiedHash === cp.hash}
              handleCopyHash={handleCopyHash}
              setConfirmHash={setConfirmHash}
              rollingBack={rollingBack}
            />
          ))}
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
        message={`Are you sure you want to rollback to checkpoint ${confirmHash?.slice(0, 7)}? This will safely revert project files to this state.`}
        confirmText="Yes, Rollback"
        confirmStyle="danger"
        onConfirm={handleRollback}
        onCancel={() => setConfirmHash(null)}
      />
    </div>
  );
}
