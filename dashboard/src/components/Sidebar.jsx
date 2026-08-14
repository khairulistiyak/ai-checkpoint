import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useSidebarReorder } from '../hooks/use-sidebar-reorder.js';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import SidebarItem from './SidebarItem';
import SidebarHeader from './SidebarHeader';
import SidebarFooter from './SidebarFooter';
import { InputField } from './ui/InputField';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

export default function Sidebar({
  projects,
  selectedId,
  onSelect,
  onAddProject,
  onReorder,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) {
  const { items, handleReorder } = useSidebarReorder(projects, onReorder);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isSearching = searchQuery.trim().length > 0;

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  const displayedItems = useMemo(() => {
    return items.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [items, searchQuery]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity"
          />
        )}
      </AnimatePresence>

      <aside
        className={`bg-[#09090b] border-r border-white/10 flex flex-col overflow-hidden transition-all duration-300 ease-in-out z-50 fixed inset-y-0 left-0 h-full shrink-0 
          md:z-auto md:relative md:inset-auto md:h-full md:rounded-none md:border-r md:border-t-0 md:border-b-0 md:border-l-0 md:shadow-none ${
            isMobileMenuOpen
              ? 'translate-x-0 w-80 max-w-[85vw] shadow-[0_0_50px_rgba(0,0,0,0.9)]'
              : '-translate-x-full md:translate-x-0'
          } ${
            isCollapsed ? 'md:w-16 lg:w-16' : 'md:w-64 lg:w-72'
          }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/30 pointer-events-none" />

        <SidebarHeader
          itemsCount={items.length}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onAddProject={onAddProject}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Sidebar Body */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 relative z-10 custom-scrollbar">
          {!isCollapsed ? (
            <div className="mb-3 flex flex-col gap-3">
              <InputField
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          ) : (
            <div className="mb-3 flex justify-center">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Search Projects"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          )}

          {displayedItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-4 text-zinc-500 text-xs italic"
            >
              {isCollapsed ? '—' : 'No projects found.'}
            </motion.div>
          ) : (
            <Reorder.Group
              as="ul"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              axis="y"
              values={displayedItems}
              onReorder={isSearching || isCollapsed ? () => {} : handleReorder}
              className="space-y-1.5"
            >
              {displayedItems.map((p) => (
                <SidebarItem
                  key={p.id}
                  p={p}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  isSearching={isSearching}
                  isCollapsed={isCollapsed}
                />
              ))}
            </Reorder.Group>
          )}
        </div>

        <SidebarFooter isCollapsed={isCollapsed} />
      </aside>
    </>
  );
}
