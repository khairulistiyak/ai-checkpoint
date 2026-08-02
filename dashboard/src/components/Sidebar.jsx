import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Plus, X, Layers } from 'lucide-react';
import { useSidebarReorder } from '../hooks/use-sidebar-reorder.js';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import SidebarItem from './SidebarItem';
import { GlassButton } from './ui/GlassButton';
import { InputField } from './ui/InputField';

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
        className={`bg-[#09090b] border-r border-white/10 flex flex-col overflow-hidden transition-transform duration-300 z-50 fixed inset-y-0 left-0 h-full w-80 max-w-[85vw] shrink-0 md:z-auto md:relative md:inset-auto md:h-full md:w-64 lg:w-72 md:max-w-none md:translate-x-0 md:rounded-none md:border-r md:border-t-0 md:border-b-0 md:border-l-0 md:shadow-none ${
          isMobileMenuOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.8)]' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#09090b] relative z-10 flex items-center justify-between gap-2">
          <h2 className="text-xs sm:text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 truncate">
            <LayoutDashboard className="w-4 h-4 text-white shrink-0" />
            <span>Projects</span>
          </h2>
          <div className="flex items-center gap-1 shrink-0">
            <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
              <GlassButton
                variant="ghost"
                onClick={onAddProject}
                className="!p-2 sm:!p-1.5 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 text-white"
                title="Add Project"
              >
                <Plus className="w-5 h-5 text-white" />
              </GlassButton>
            </motion.div>
            <GlassButton
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden !p-2 sm:!p-1.5 min-h-[40px] min-w-[40px] text-white"
              title="Close Sidebar"
            >
              <X className="w-5 h-5 text-white" />
            </GlassButton>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 relative z-10 custom-scrollbar">
          <div className="mb-3 sm:mb-4 flex flex-col gap-3">
            <button 
              onClick={() => onSelect('library')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                selectedId === 'library' 
                  ? 'bg-white/10 border-white text-white font-bold shadow-sm' 
                  : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/10'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span className="text-sm font-semibold truncate">Component Library</span>
            </button>

            <InputField 
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        <div className="p-4 sm:p-5 border-t border-cyber-card-border bg-cyber-dark/50 relative z-10">
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-[10px] font-bold text-cyber-text-secondary uppercase tracking-widest">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
            </span>
            <span className="text-cyber-text-secondary truncate">System Online</span>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
