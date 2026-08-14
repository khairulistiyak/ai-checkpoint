import React from 'react';
import { LayoutDashboard, Plus, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassButton } from './ui/GlassButton';

export default function SidebarHeader({
  itemsCount,
  isCollapsed,
  setIsCollapsed,
  onAddProject,
  setIsMobileMenuOpen,
}) {
  return (
    <div
      className={`p-3.5 sm:p-4 border-b border-white/10 bg-[#09090b]/90 backdrop-blur-md relative z-10 flex items-center ${
        isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between gap-2'
      }`}
    >
      {!isCollapsed ? (
        <>
          <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0 shadow-sm">
              <LayoutDashboard className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="truncate">Projects</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 font-normal">
              {itemsCount}
            </span>
          </h2>
          <div className="flex items-center gap-1 shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <GlassButton
                variant="ghost"
                onClick={onAddProject}
                className="!p-1.5 text-white hover:bg-white/10 rounded-xl"
                title="Add New Project"
              >
                <Plus className="w-4 h-4 text-white" />
              </GlassButton>
            </motion.div>

            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden md:flex p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>

            <GlassButton
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden !p-1.5 text-white hover:bg-white/10"
              title="Close Sidebar"
            >
              <X className="w-5 h-5 text-white" />
            </GlassButton>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-1">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Expand Sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
          <button
            onClick={onAddProject}
            className="p-2 text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all shadow-sm cursor-pointer"
            title="Add Project"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
