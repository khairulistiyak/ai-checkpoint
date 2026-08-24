import React from 'react';
import { Brain, Plus, X } from 'lucide-react';

export default function SidebarHeader({
  itemsCount, isCollapsed, setIsCollapsed, onAddProject, setIsMobileMenuOpen
}) {
  return (
    <div
      className={`p-3 sm:px-3.5 sm:py-3 border-b border-white/[0.05] bg-[#0a0a0c]/90 backdrop-blur-md relative z-10 flex items-center select-none app-drag ${
        isCollapsed ? 'justify-center flex-col gap-2.5' : 'justify-between gap-2'
      }`}
    >
      {!isCollapsed ? (
        <>
          {/* Brand Mark & Title (Click to toggle sidebar) */}
          <div
            onClick={() => setIsCollapsed(true)}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group hover:opacity-85 transition-opacity app-no-drag"
            title="VEYLX STUDIO — Click to collapse sidebar"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 flex items-center justify-center text-white shrink-0 shadow-sm transition-all">
              <Brain className="w-4 h-4 text-zinc-100" />
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm font-bold tracking-tight text-white font-outfit truncate">
                VEYLX
              </span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-400 uppercase font-semibold">
                STUDIO
              </span>
            </div>
          </div>

          {/* Action Buttons Micro-Cluster */}
          <div className="flex items-center gap-1 shrink-0 app-no-drag">
            <button
              onClick={onAddProject}
              className="w-7 h-7 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Add Workspace (New)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden w-7 h-7 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Close Sidebar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-0.5 app-no-drag">
          <div
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-white shrink-0 shadow-sm cursor-pointer transition-all"
            onClick={() => setIsCollapsed(false)}
            title="VEYLX STUDIO — Click to expand sidebar"
          >
            <Brain className="w-4 h-4 text-zinc-100" />
          </div>
          <button
            onClick={onAddProject}
            className="w-8 h-8 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Add Workspace"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
