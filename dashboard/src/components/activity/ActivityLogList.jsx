import React from "react";
import { ScrollText, ChevronDown } from "lucide-react";
import ActivityLogEntry from "./ActivityLogEntry";
import { ACTION_CONFIG, formatTime } from "./activity-constants";

export default function ActivityLogList({
  scrollRef,
  entries,
  grouped,
  total,
  hasMore,
  loadMore,
  loadingMore,
}) {
  return (
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
                return (
                  <ActivityLogEntry
                    key={`${entry.ts}-${idx}`}
                    entry={entry}
                    config={config}
                    formatTime={formatTime}
                  />
                );
              })}
            </div>
          </div>
        ))
      )}

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
  );
}
