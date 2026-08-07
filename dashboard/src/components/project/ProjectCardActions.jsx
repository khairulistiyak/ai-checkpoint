import React from "react";
import { Layers, BookmarkPlus, Settings, Trash2 } from "lucide-react";
import ExportButton from "../ExportButton";

export default function ProjectCardActions({
  project,
  onOpenArchitect,
  handleQuickCheckpoint,
  onOpenConfig,
  onRemove,
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
      {project.hasPlanFiles && (
        <button
          onClick={() => onOpenArchitect && onOpenArchitect()}
          title="Open Full Architectural Plan Blueprint Modal"
          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyber-accent/10 to-blue-500/10 hover:from-cyber-accent/20 hover:to-blue-500/20 border border-cyber-accent/20 text-cyber-accent hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(var(--cyber-accent-rgb),0.1)] hover:shadow-[0_0_15px_rgba(var(--cyber-accent-rgb),0.25)]"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Architect View</span>
        </button>
      )}

      <button
        onClick={handleQuickCheckpoint}
        title="Copy snapshot command: ./l cp save"
        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
      >
        <BookmarkPlus className="w-3.5 h-3.5 text-white/60" />
        <span className="hidden sm:inline">Save Snapshot</span>
      </button>

      <ExportButton project={project} />

      <button
        onClick={onOpenConfig}
        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer shadow-sm"
        title="Project Rules & Config Editor"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onRemove}
        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer shadow-sm"
        title="Remove Project from Workspace"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
