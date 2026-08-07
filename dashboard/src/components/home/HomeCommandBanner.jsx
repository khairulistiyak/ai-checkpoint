import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function HomeCommandBanner({ onAddProject }) {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#121214] border border-white/[0.08] hover:border-white/[0.15] rounded-3xl p-6 sm:p-8 shadow-sm transition-all">
      <div className="space-y-2 text-left">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 font-mono text-[10px] font-bold uppercase tracking-wider">
            STUDIO MONOCHROME v2.0 • EXECUTIVE DASHBOARD
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-outfit">
          Workspace Command Center
        </h1>
        <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-lg leading-relaxed">
          Select an active project below to inspect execution progress, verify checkpoints, and architect AI blueprints.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <button
          onClick={onAddProject}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ededef] hover:bg-white text-zinc-950 transition-all text-xs font-mono uppercase tracking-wider font-bold cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>
    </div>
  );
}
