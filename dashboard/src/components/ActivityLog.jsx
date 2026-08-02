import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, FileEdit, FilePlus, FileX, RotateCcw, ChevronDown } from 'lucide-react';

const BASE_URL = (window.location.port === '5173'
  ? 'http://localhost:20226'
  : window.location.origin) + '/api';

const ACTION_CONFIG = {
  CREATED:  { icon: FilePlus,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Created' },
  MODIFIED: { icon: FileEdit,   color: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'Modified' },
  DELETED:  { icon: FileX,      color: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Deleted' },
  RESTORED: { icon: RotateCcw,  color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  label: 'Restored' },
};

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (e) {
    return '--:--';
  }
}

function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Unknown';
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
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef(null);

  // Fetch initial entries
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetch(`${BASE_URL}/projects/${projectId}/activity-log?limit=50`)
      .then(r => r.json())
      .then(data => {
        setEntries(data.entries || []);
        setTotal(data.total || 0);
        setHasMore(data.hasMore || false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  // Add live entries from SSE
  useEffect(() => {
    if (!liveEntry) return;
    setEntries(prev => [liveEntry, ...prev]);
    setTotal(prev => prev + 1);
  }, [liveEntry]);

  // Load more
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `${BASE_URL}/projects/${projectId}/activity-log?limit=50&offset=${entries.length}`
      );
      const data = await res.json();
      setEntries(prev => [...prev, ...(data.entries || [])]);
      setHasMore(data.hasMore || false);
    } catch (e) {}
    setLoadingMore(false);
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
      className="bg-[#121214] border border-white/10 rounded-3xl p-6 relative flex flex-col shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10">
        <h2 className="text-base font-bold text-white flex items-center gap-2.5 font-outfit">
          <ScrollText className="w-4 h-4 text-white" />
          <span>Activity Log</span>
        </h2>
        <span className="text-xs font-mono text-white/50">
          {total} events
        </span>
      </div>

      {/* Entries */}
      <div ref={scrollRef} className="max-h-[320px] overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-4">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-white/30">
            <ScrollText className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No activity recorded yet</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, dateEntries]) => (
            <div key={dateLabel}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">
                {dateLabel}
              </div>
              <div className="space-y-1">
                {dateEntries.map((entry, idx) => {
                  const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.MODIFIED;
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={`${entry.ts}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
                    >
                      <span className="text-[11px] font-mono text-white/30 w-12 shrink-0">
                        {formatTime(entry.ts)}
                      </span>
                      <div className={`w-6 h-6 rounded-md ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-3 h-3 ${config.color}`} />
                      </div>
                      <span className="text-xs text-white/70 truncate group-hover:text-white transition-colors font-mono">
                        {entry.file}
                      </span>
                      {entry.size != null && (
                        <span className="text-[10px] text-white/20 ml-auto shrink-0">
                          {entry.size > 1024 ? `${(entry.size / 1024).toFixed(1)}KB` : `${entry.size}B`}
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
            {loadingMore ? 'Loading...' : `Load More (${total - entries.length} more)`}
          </button>
        )}
      </div>
    </motion.div>
  );
}
