import React from 'react';
import { Settings } from 'lucide-react';

export default function SidebarFooter({ isCollapsed, onOpenSettings }) {
  return (
    <div className="p-2 border-t border-white/[0.05] bg-[#0a0a0c]/90 backdrop-blur-md relative z-10">
      {!isCollapsed ? (
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 text-zinc-400 hover:text-white transition-all text-xs font-mono font-medium cursor-pointer shadow-sm"
          title="Settings (⌘,)"
        >
          <Settings className="w-3.5 h-3.5 text-zinc-400" />
          <span>Settings</span>
          <span className="ml-auto text-[10px] text-zinc-500 font-mono">⌘,</span>
        </button>
      ) : (
        <div className="flex justify-center">
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
