import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Plus, Activity, GripVertical } from 'lucide-react';
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

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
        className={`w-72 bg-[#0f172a]/60 backdrop-blur-2xl border-r border-white/[0.05] flex flex-col overflow-hidden transition-transform duration-300 z-50 md:z-auto md:relative md:top-0 md:left-0 md:h-full md:translate-x-0 md:rounded-2xl md:border md:shadow-2xl ${isMobileMenuOpen
          ? 'translate-x-0 fixed left-0 top-16 bottom-6 rounded-r-2xl'
          : '-translate-x-full fixed left-0 top-16 bottom-6'
          }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none"></div>

        <div className="p-5 border-b border-white/[0.05] bg-[#020617]/50 relative z-10 flex items-center justify-between">
          <h2 className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-primary-400" />
            Projects
          </h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAddProject}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Add Project"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 relative z-10 custom-scrollbar">
          <div className="mb-4">
            <input 
              type="text" 
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#020617]/50 border border-white/[0.05] rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-violet-500 text-white placeholder-slate-500"
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

        <div className="p-5 border-t border-white/[0.05] bg-[#020617]/50 relative z-10">
          <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
            <span className="bg-gradient-to-r from-slate-400 to-slate-500 bg-clip-text text-transparent">System Online</span>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
