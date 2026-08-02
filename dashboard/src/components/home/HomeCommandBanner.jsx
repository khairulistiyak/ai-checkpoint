import React from 'react';
import { PlusCircle, Layers } from 'lucide-react';
import { useHashRoute } from '../../hooks/useHashRoute';

export default function HomeCommandBanner({ onAddProject }) {
  const { navigate } = useHashRoute();

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="space-y-2 text-left">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
            STUDIO MONOCHROME v1.0 • EXECUTIVE DASHBOARD
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-outfit">
          Workspace Command Center
        </h1>
        <p className="text-xs sm:text-sm font-mono text-white/60 max-w-lg leading-relaxed">
          Select an active project below to inspect execution progress, verify checkpoints, and architect AI blueprints.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('#/library')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all text-xs font-mono uppercase tracking-wider font-bold cursor-pointer shadow-sm"
        >
          <Layers className="w-4 h-4" />
          <span>Library</span>
        </button>
        <button
          onClick={onAddProject}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 border border-white transition-all text-xs font-mono uppercase tracking-wider font-bold cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>
    </div>
  );
}
