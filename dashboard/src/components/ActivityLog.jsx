import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText,
  FileEdit,
  FilePlus,
  FileX,
  RotateCcw,
  ChevronDown,
  Trash2,
  Clock,
  Calendar,
  CalendarRange,
  CalendarDays,
  AlertTriangle,
  X,
} from "lucide-react";
import { useToast } from "./ToastProvider";
import { clearActivityLog } from "../hooks/useFileWatcher";

const BASE_URL =
  (window.location.port === "5173"
    ? "http://localhost:20226"
    : window.location.origin) + "/api";

const ACTION_CONFIG = {
  CREATED: {
    icon: FilePlus,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Created",
  },
  MODIFIED: {
    icon: FileEdit,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    label: "Modified",
  },
  DELETED: {
    icon: FileX,
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "Deleted",
  },
  RESTORED: {
    icon: RotateCcw,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    label: "Restored",
  },
};

const TIME_RANGES = [
  {
    id: "last_hour",
    label: "Last 1 Hour",
    desc: "Activity from past 60 mins",
    icon: Clock,
  },
  {
    id: "today",
    label: "Today / Last 24 Hours",
    desc: "Activity from past 24 hours",
    icon: Calendar,
  },
  {
    id: "last_7d",
    label: "Last 7 Days",
    desc: "Activity from past week",
    icon: CalendarRange,
  },
  {
    id: "last_30d",
    label: "Last 30 Days",
    desc: "Activity from past month",
    icon: CalendarDays,
  },
  {
    id: "all",
    label: "All Time",
    desc: "Wipe entire logged activity history",
    icon: Trash2,
    danger: true,
  },
];

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (e) {
    return "--:--";
  }
}

function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (e) {
    return "Unknown";
  }
}

function groupByDate(entries) {
  const groups = {};
  for (const entry of entries) {
    const dateKey = formatDate(entry.ts);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(entry);
  }
  return groups;
}

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

  // Fetch initial entries
  const fetchEntries = () => {
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
  };

  useEffect(() => {
    fetchEntries();
  }, [projectId]);

  // Add live entries from SSE
  useEffect(() => {
    if (!liveEntry) return;
    setEntries((prev) => [liveEntry, ...prev]);
    setTotal((prev) => prev + 1);
  }, [liveEntry]);

  // Load more
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
    } catch (e) {}
    setLoadingMore(false);
  };

  // Handle Clear
  const handleClear = async () => {
    if (!projectId) return;
    setClearing(true);
    try {
      const res = await clearActivityLog(projectId, selectedRange);
      const activeRangeObj = TIME_RANGES.find((r) => r.id === selectedRange);
      showToast(
        `Cleared ${res.deletedCount || 0} events (${activeRangeObj?.label || selectedRange})`,
        "success",
      );
      setShowClearModal(false);

      // Instantly filter out deleted entries from view
      if (selectedRange === "all") {
        setEntries([]);
        setTotal(0);
      } else {
        const now = Date.now();
        let thresholdMs = 0;
        if (selectedRange === "last_hour") thresholdMs = 60 * 60 * 1000;
        else if (selectedRange === "today") thresholdMs = 24 * 60 * 60 * 1000;
        else if (selectedRange === "last_7d")
          thresholdMs = 7 * 24 * 60 * 60 * 1000;
        else if (selectedRange === "last_30d")
          thresholdMs = 30 * 24 * 60 * 60 * 1000;

        const cutoff = now - thresholdMs;
        setEntries((prev) =>
          prev.filter((e) => {
            const t = new Date(e.ts).getTime();
            return isNaN(t) || t < cutoff;
          }),
        );
        setTotal(res.remainingCount ?? 0);
      }
    } catch (err) {
      showToast(err.message || "Failed to clear activity log", "error");
    } finally {
      setClearing(false);
    }
  };

  const grouped = groupByDate(entries);

  if (loading) {
    return (
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 animate-pulse">
        <div className="h-6 w-40 bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-8 bg-white/5 rounded-xl" />
          <div className="h-8 bg-white/5 rounded-xl" />
          <div className="h-8 bg-white/5 rounded-xl" />
        </div>
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
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-cyber-card-border shrink-0">
        <h2 className="text-sm font-bold text-cyber-text-primary flex items-center gap-2 font-outfit">
          <ScrollText className="w-3.5 h-3.5 text-cyber-text-primary" />
          <span>Activity Log</span>
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-cyber-text-secondary">
            {total} events
          </span>

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

      {/* Entries */}
      <div
        ref={scrollRef}
        className="flex-1 max-h-[340px] overflow-y-auto custom-scrollbar -mr-1.5 pr-1.5 space-y-3"
      >
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-cyber-text-muted">
            <ScrollText className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No activity recorded yet</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, dateEntries]) => (
            <div key={dateLabel}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyber-text-muted mb-2">
                {dateLabel}
              </div>
              <div className="space-y-1">
                {dateEntries.map((entry, idx) => {
                  const config =
                    ACTION_CONFIG[entry.action] || ACTION_CONFIG.MODIFIED;
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={`${entry.ts}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-cyber-dark/50 transition-colors group border border-transparent hover:border-cyber-card-border"
                    >
                      <span className="text-[11px] font-mono text-cyber-text-muted w-12 shrink-0">
                        {formatTime(entry.ts)}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-md ${config.bg} flex items-center justify-center shrink-0 border border-cyber-card-border group-hover:border-transparent`}
                      >
                        <Icon className={`w-3 h-3 ${config.color}`} />
                      </div>
                      <span className="text-xs text-cyber-text-secondary truncate group-hover:text-cyber-text-primary transition-colors font-mono">
                        {entry.file}
                      </span>
                      {entry.size != null && (
                        <span className="text-[10px] text-cyber-text-muted ml-auto shrink-0">
                          {entry.size > 1024
                            ? `${(entry.size / 1024).toFixed(1)}KB`
                            : `${entry.size}B`}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Load More */}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full py-2 text-xs text-white/40 hover:text-white/70 transition-colors flex items-center justify-center gap-2 font-mono"
          >
            <ChevronDown className="w-3 h-3" />
            {loadingMore
              ? "Loading..."
              : `Load More (${total - entries.length} more)`}
          </button>
        )}
      </div>

      {/* Browser-style Clear History Modal */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-[#121214] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6 relative"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-outfit">
                      Clear Activity History
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      Select a time range to clear recorded logs
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowClearModal(false)}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Time Range Options */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Time Range
                </div>
                {TIME_RANGES.map((range) => {
                  const Icon = range.icon;
                  const isSelected = selectedRange === range.id;
                  return (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setSelectedRange(range.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                        isSelected
                          ? range.danger
                            ? "bg-red-500/10 border-red-500/30 text-white"
                            : "bg-white/[0.08] border-white/20 text-white"
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] text-zinc-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? range.danger
                                ? "bg-red-500/20 text-red-300"
                                : "bg-white/10 text-white"
                              : "bg-white/[0.03] text-zinc-500"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div
                            className={`text-xs font-bold font-outfit ${
                              isSelected
                                ? range.danger
                                  ? "text-red-300"
                                  : "text-white"
                                : "text-zinc-300"
                            }`}
                          >
                            {range.label}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono">
                            {range.desc}
                          </div>
                        </div>
                      </div>

                      {/* Selection radio indicator */}
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? range.danger
                              ? "border-red-400 bg-red-500"
                              : "border-white bg-white"
                            : "border-white/20"
                        }`}
                      >
                        {isSelected && (
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              range.danger ? "bg-black" : "bg-[#121214]"
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400 font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  This will only delete the activity audit log. Your actual
                  project files will not be touched.
                </span>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  disabled={clearing}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={clearing}
                  className={`px-5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedRange === "all"
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                      : "bg-white hover:bg-zinc-200 text-black font-semibold"
                  }`}
                >
                  {clearing ? (
                    <span>Clearing...</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Data</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
