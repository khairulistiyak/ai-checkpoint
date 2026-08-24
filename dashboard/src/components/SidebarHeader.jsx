import React from 'react';
import { LayoutDashboard, Plus, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function SidebarHeader({
  itemsCount, isCollapsed, setIsCollapsed, onAddProject, setIsMobileMenuOpen
}) {
  return (
    <div
      className={`p-3 sm:p-3.5 border-b border-white/[0.05] bg-[#0a0a0c]/90 backdrop-blur-md relative z-10 flex items-center ${
        isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between gap-2'
      }`}
    >
      {!isCollapsed ? (
        <>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5.5 h-5.5 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 shrink-0 shadow-sm p-1">
              <LayoutDashboard className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span className="text-xs font-mono font-bold text-zinc-200 tracking-wider uppercase truncate">
              Workspaces
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-400 font-medium">
              {itemsCount}
            </span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={onAddProject}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              title="Add Workspace"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden md:flex p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              title="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-1">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
            title="Expand Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onAddProject}
            className="p-1.5 text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all shadow-sm cursor-pointer"
            title="Add Workspace"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
