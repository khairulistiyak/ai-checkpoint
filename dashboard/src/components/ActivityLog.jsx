import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActivityLogClearModal from "./activity/ActivityLogClearModal";
import ActivityLogList from "./activity/ActivityLogList";
import { ScrollText, Trash2 } from "lucide-react";
import { useToast } from "./ToastProvider";
import { clearActivityLog } from "../hooks/useFileWatcher";
import {
  TIME_RANGES,
  groupByDate,
  getRangeCutoffMs,
} from "./activity/activity-constants";

const BASE_URL =
  (window.location.port === "5173"
    ? "http://localhost:20226"
    : window.location.origin) + "/api";

export default function ActivityLog({ projectId, liveEntry }) {
  const { showToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedRange, setSelectedRange] = useState("today");
  const [clearing, setClearing] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetch(`${BASE_URL}/projects/${projectId}/activity-log?limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries || []);
        setTotal(data.total || 0);
        setHasMore(data.hasMore || false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (!liveEntry) return;
    setEntries((prev) => [liveEntry, ...prev]);
    setTotal((prev) => prev + 1);
  }, [liveEntry]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `${BASE_URL}/projects/${projectId}/activity-log?limit=50&offset=${entries.length}`,
      );
      const data = await res.json();
      setEntries((prev) => [...prev, ...(data.entries || [])]);
      setHasMore(data.hasMore || false);
    } catch (e) { /* parse error ignored */ }
    setLoadingMore(false);
  };

  const handleClear = async () => {
    if (!projectId) return;
    setClearing(true);
    try {
      const res = await clearActivityLog(projectId, selectedRange);
      const activeRange = TIME_RANGES.find((r) => r.id === selectedRange);
      showToast(`Cleared ${res.deletedCount || 0} events (${activeRange?.label || selectedRange})`, "success");
      setShowClearModal(false);
      if (selectedRange === "all") {
        setEntries([]);
        setTotal(0);
      } else {
        const cutoff = Date.now() - getRangeCutoffMs(selectedRange);
        setEntries((prev) => prev.filter((e) => isNaN(new Date(e.ts).getTime()) || new Date(e.ts).getTime() < cutoff));
        setTotal(res.remainingCount ?? 0);
      }
    } catch (err) {
      showToast(err.message || "Failed to clear activity log", "error");
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 animate-pulse">
        <div className="h-6 w-40 bg-white/10 rounded mb-4" /><div className="space-y-3"><div className="h-8 bg-white/5 rounded-xl" /><div className="h-8 bg-white/5 rounded-xl" /></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.25, ease: "easeOut" }}
      className="bg-cyber-card/90 border border-cyber-card-border rounded-2xl p-3.5 sm:p-4 relative flex flex-col shadow-sm h-full"
    >
      <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-cyber-card-border shrink-0">
        <h2 className="text-sm font-bold text-cyber-text-primary flex items-center gap-2 font-outfit">
          <ScrollText className="w-3.5 h-3.5 text-cyber-text-primary" />
          <span>Activity Log</span>
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-cyber-text-secondary">{total} events</span>
          {total > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              title="Clear Activity History"
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono text-cyber-text-secondary hover:text-red-400 bg-cyber-dark/50 hover:bg-red-500/10 border border-cyber-card-border hover:border-red-500/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <ActivityLogList
        scrollRef={scrollRef}
        entries={entries}
        grouped={groupByDate(entries)}
        total={total}
        hasMore={hasMore}
        loadMore={loadMore}
        loadingMore={loadingMore}
      />

      <AnimatePresence>
        <ActivityLogClearModal
          show={showClearModal}
          onClose={() => setShowClearModal(false)}
          onClear={handleClear}
          clearing={clearing}
          timeRanges={TIME_RANGES}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
        />
      </AnimatePresence>
    </motion.div>
  );
}
