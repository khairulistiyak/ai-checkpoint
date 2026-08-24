import React from 'react';
import { Brain, Plus, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function SidebarHeader({
  itemsCount, isCollapsed, setIsCollapsed, onAddProject, setIsMobileMenuOpen
}) {
  const isElectron = typeof window !== 'undefined' && (
    window.navigator?.userAgent?.includes('Electron') ||
    new URLSearchParams(window.location.search).has('port')
  );

  return (
    <div
      className={`p-3 sm:px-3.5 sm:py-3 border-b border-white/[0.05] bg-[#0a0a0c]/90 backdrop-blur-md relative z-10 flex items-center select-none ${
        isElectron ? 'pt-8' : ''
      } ${
        isCollapsed ? 'justify-center flex-col gap-2.5' : 'justify-between gap-2'
      }`}
    >
      {!isCollapsed ? (
        <>
          {/* Brand Mark & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-sm">
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
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onAddProject}
              className="w-7 h-7 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Add Workspace (New)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden md:flex w-7 h-7 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08] text-zinc-400 hover:text-white items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
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
        <div className="flex flex-col items-center gap-2 py-0.5">
          <div
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-sm cursor-pointer"
            onClick={() => setIsCollapsed(false)}
            title="VEYLX STUDIO — Expand Sidebar"
          >
            <Brain className="w-4 h-4 text-zinc-100" />
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Expand Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onAddProject}
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/[0.10] text-zinc-200 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Add Workspace"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
