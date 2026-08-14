import React from 'react';

export default function SidebarFooter({ isCollapsed }) {
  return (
    <div className="p-3 border-t border-white/10 bg-black/40 relative z-10">
      {!isCollapsed ? (
        <div className="flex items-center justify-center gap-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          </span>
          <span className="truncate">System Online</span>
        </div>
      ) : (
        <div className="flex justify-center">
          <span className="relative flex h-2.5 w-2.5" title="System Online">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          </span>
        </div>
      )}
    </div>
  );
}
