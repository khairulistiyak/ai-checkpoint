import React from 'react';

export default function SidebarFooter({ isCollapsed }) {
  return (
    <div className="p-2.5 border-t border-white/[0.05] bg-[#0a0a0c]/90 backdrop-blur-md relative z-10">
      {!isCollapsed ? (
        <div className="flex items-center justify-center gap-2 text-[9.5px] font-mono font-medium text-zinc-500 uppercase tracking-wider">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
          </span>
          <span className="truncate">System Online</span>
        </div>
      ) : (
        <div className="flex justify-center">
          <span className="relative flex h-2 w-2" title="System Online">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        </div>
      )}
    </div>
  );
}
