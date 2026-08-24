import React from "react";
import { Settings, Trash2, Activity } from "lucide-react";

export default function ProjectCardActions({
  onOpenConfig,
  onOpenActivityLog,
  onRemove,
}) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={() => onOpenActivityLog && onOpenActivityLog()}
        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 hover:text-white transition-all text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
        title="Open Live Activity Log & Execution Stream"
      >
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Activity Log</span>
      </button>

      <button
        onClick={onOpenConfig}
        className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm"
        title="Project Rules & Config Editor"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onRemove}
        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer shadow-sm"
        title="Remove Project from Workspace"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
