import React from "react";
import { Layers, BookmarkPlus, Settings, Trash2, BrainCircuit, Activity } from "lucide-react";
import ExportButton from "../ExportButton";

export default function ProjectCardActions({
  project,
  onOpenArchitect,
  handleQuickCheckpoint,
  onOpenConfig,
  onOpenIntelligence,
  onOpenActivityLog,
  onRemove,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      {project.hasPlanFiles && (
        <button
          onClick={() => onOpenArchitect && onOpenArchitect()}
          title="Open Full Architectural Plan Blueprint Modal"
          className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Architect View</span>
        </button>
      )}

      <button
        onClick={handleQuickCheckpoint}
        title="Copy snapshot command: ./l cp save"
        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
      >
        <BookmarkPlus className="w-3.5 h-3.5 text-zinc-400" />
        <span className="hidden sm:inline">Save Snapshot</span>
      </button>

      <button
        onClick={() => onOpenIntelligence && onOpenIntelligence()}
        className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
        title="Open AI Intelligence Hub"
      >
        <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
        <span className="hidden sm:inline">Intelligence Hub</span>
      </button>

      <button
        onClick={() => onOpenActivityLog && onOpenActivityLog()}
        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
        title="Open Live Activity Log & Execution Stream"
      >
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Activity Log</span>
      </button>

      <ExportButton project={project} />

      <button
        onClick={onOpenConfig}
        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm"
        title="Project Rules & Config Editor"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onRemove}
        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer shadow-sm"
        title="Remove Project from Workspace"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
