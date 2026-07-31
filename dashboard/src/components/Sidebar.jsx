import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Plus, X } from 'lucide-react';
import { useSidebarReorder } from '../hooks/use-sidebar-reorder.js';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import SidebarItem from './SidebarItem';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Sidebar({ projects, selectedId, onSelect, onAddProject, onReorder, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { items, handleReorder } = useSidebarReorder(projects, onReorder);
  const [searchQuery, setSearchQuery] = useState('');
  const isSearching = searchQuery.trim().length > 0;
  
  const displayedItems = useMemo(() => {
    return items.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [items, searchQuery]);
  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`bg-[#0f172a]/95 md:bg-[#0f172a]/60 backdrop-blur-2xl border-r border-white/[0.05] flex flex-col overflow-hidden transition-transform duration-300 z-50 fixed inset-y-0 left-0 h-full w-80 max-w-[85vw] shrink-0 md:z-auto md:relative md:inset-auto md:h-full md:w-60 lg:w-72 xl:w-80 md:max-w-none md:translate-x-0 md:rounded-2xl md:border md:shadow-2xl ${
          isMobileMenuOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.8)]' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none"></div>

        <div className="p-4 sm:p-5 border-b border-white/[0.05] bg-[#020617]/50 relative z-10 flex items-center justify-between gap-2">
          <h2 className="text-xs sm:text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 uppercase tracking-[0.2em] flex items-center gap-2 truncate">
            <LayoutDashboard className="w-4 h-4 text-primary-400 shrink-0" />
            <span>Projects</span>
          </h2>
          <div className="flex items-center gap-1 shrink-0">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onAddProject}
              className="p-2 sm:p-1.5 hover:bg-white/10 rounded-xl sm:rounded-lg text-slate-300 hover:text-white transition-colors min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
              title="Add Project"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-2 sm:p-1.5 hover:bg-white/10 rounded-xl sm:rounded-lg text-slate-400 hover:text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 relative z-10 custom-scrollbar">
          <div className="mb-3 sm:mb-4">
            <input 
              type="text" 
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#020617]/50 border border-white/[0.05] rounded-xl py-2.5 sm:py-2 px-3.5 sm:px-3 text-base sm:text-sm focus:outline-none focus:border-violet-500 text-white placeholder-slate-500 transition-colors"
            />
          </div>
          {displayedItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center p-6 text-slate-500 text-sm italic"
            >
              No projects found.
            </motion.div>
          ) : (
            <Reorder.Group as="ul" variants={containerVariants} initial="hidden" animate="show" axis="y" values={displayedItems} onReorder={isSearching ? () => {} : handleReorder} className="space-y-2">
              {displayedItems.map(p => (
                <SidebarItem key={p.id} p={p} selectedId={selectedId} onSelect={onSelect} isSearching={isSearching} />
              ))}
            </Reorder.Group>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-white/[0.05] bg-[#020617]/50 relative z-10">
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
            <span className="bg-gradient-to-r from-slate-400 to-slate-500 bg-clip-text text-transparent truncate">System Online</span>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
