import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, X, AlertTriangle } from 'lucide-react';

export default function ActivityLogClearModal({
  show,
  onClose,
  onClear,
  clearing,
  timeRanges,
  selectedRange,
  setSelectedRange,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-[#121214] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 relative"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-outfit">Clear Activity History</h3>
              <p className="text-xs text-zinc-400 font-mono">Select a time range to clear recorded logs</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Time Range</div>
          {timeRanges.map((range) => {
            const Icon = range.icon;
            const isSelected = selectedRange === range.id;
            return (
              <button
                key={range.id}
                type="button"
                onClick={() => setSelectedRange(range.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                  isSelected
                    ? range.danger ? "bg-red-500/10 border-red-500/30 text-white" : "bg-white/[0.08] border-white/20 text-white"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? range.danger ? "bg-red-500/20 text-red-300" : "bg-white/10 text-white" : "bg-white/[0.03] text-zinc-500"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold font-outfit ${isSelected ? range.danger ? "text-red-300" : "text-white" : "text-zinc-300"}`}>{range.label}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">{range.desc}</div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                  isSelected ? range.danger ? "border-red-400 bg-red-500" : "border-white bg-white" : "border-white/20"
                }`}>
                  {isSelected && <div className={`w-1.5 h-1.5 rounded-full ${range.danger ? "bg-black" : "bg-[#121214]"}`} />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400 font-mono">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>This won&apos;t affect git commits or project files.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={clearing} className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer">Cancel</button>
          <button
            type="button"
            onClick={onClear}
            disabled={clearing}
            className={`px-5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              selectedRange === "all" ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20" : "bg-white hover:bg-zinc-200 text-black font-semibold"
            }`}
          >
            {clearing ? <span>Clearing...</span> : <><Trash2 className="w-3.5 h-3.5" /><span>Clear Data</span></>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
