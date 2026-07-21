import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, Activity, GripVertical } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

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
  const [items, setItems] = useState(projects);

  // Sync internal state when external projects prop changes (e.g. initial load or new project)
  useEffect(() => {
    setItems(projects);
  }, [projects]);

  const handleReorder = (newItems) => {
    setItems(newItems);
    if (onReorder) {
      onReorder(newItems.map(p => p.id));
    }
  };
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
        className={`w-72 bg-[#0a0f1c]/70 backdrop-blur-xl border border-white/[0.05] flex flex-col h-[calc(100vh-8rem)] overflow-hidden transition-transform duration-300 z-50 md:z-auto ${isMobileMenuOpen
          ? 'translate-x-0 fixed left-0 top-20 bottom-6 rounded-r-2xl border-l-0'
          : '-translate-x-full fixed left-0 top-20 bottom-6 md:translate-x-0 md:relative md:rounded-xl'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>

        <div className="p-5 border-b border-white/[0.08] bg-[#0A0A0A] relative z-10 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
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
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center p-6 text-slate-500 text-sm italic"
            >
              No projects added yet.
            </motion.div>
          ) : (
            <Reorder.Group as="ul" variants={containerVariants} initial="hidden" animate="show" axis="y" values={items} onReorder={handleReorder} className="space-y-2">
              {items.map(p => {
                const isSelected = selectedId === p.id;
                const progress = p.progress?.overall?.percentage || 0;

                let statusColor = "bg-slate-600";
                if (!p.isInstalled) statusColor = "bg-red-500";
                else if (progress === 100) statusColor = "bg-emerald-500";
                else if (progress > 0) statusColor = "bg-blue-500";
                else statusColor = "bg-slate-400";

                return (
                  <Reorder.Item
                    key={p.id}
                    value={p}
                    className="relative"
                    as="li"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer ${isSelected
                        ? 'bg-white/[0.05] border border-white/[0.1] text-white'
                        : 'hover:bg-white/[0.03] text-slate-400 border border-transparent hover:border-white/[0.05]'
                      }`}
                    >
                      {isSelected && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className="absolute left-0 top-0 bottom-0 w-[3px] bg-white rounded-r-full"
                        />
                      )}

                      <div className="flex items-center gap-3 overflow-hidden flex-1" onClick={() => onSelect(p.id)}>
                        <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1 -ml-2 rounded" onPointerDown={(e) => e.stopPropagation()}>
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div 
                          className={`w-2 h-2 rounded-full ${statusColor} shrink-0`}
                        />
                        <span className={`truncate font-medium text-sm group-hover:text-white transition-colors ${isSelected ? 'font-bold' : ''}`}>
                          {p.name}
                        </span>
                      </div>

                      {p.isInstalled && (
                        <span className={`text-[10px] font-mono px-2 py-1 rounded transition-colors border ${isSelected ? 'bg-white/[0.1] border-white/[0.1] text-white' : 'bg-transparent border-white/[0.05] text-slate-500 group-hover:bg-white/[0.05]'}`}>
                          {progress}%
                        </span>
                      )}
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          )}
        </div>

        <div className="p-5 border-t border-white/[0.08] bg-[#0A0A0A] relative z-10">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
            </span>
            <span className="uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
