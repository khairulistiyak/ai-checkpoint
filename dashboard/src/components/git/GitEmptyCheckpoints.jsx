import React from "react";
import { GitCommit, Copy } from "lucide-react";

export default function GitEmptyCheckpoints({ onCopyCommand }) {
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
        onClick={onCopyCommand}
        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-mono flex items-center gap-2 cursor-pointer transition-all"
      >
        <Copy className="w-3.5 h-3.5" />
        <span>./l cp save "Initial checkpoint"</span>
      </button>
    </div>
  );
}
