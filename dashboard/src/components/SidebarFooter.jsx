import React from 'react';
import { Settings } from 'lucide-react';

export default function SidebarFooter({ isCollapsed, onOpenSettings }) {
  return (
    <div className="p-2 border-t border-white/[0.05] bg-[#0a0a0c]/90 backdrop-blur-md relative z-10">
      {!isCollapsed ? (
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 text-zinc-400 hover:text-white transition-all text-xs font-mono font-medium cursor-pointer shadow-sm"
            title="Settings (⌘,)"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>Settings</span>
          </button>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 pr-1.5 select-none">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="hidden sm:inline">Online</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/[0.08]"
            title="Settings (⌘,)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
