import React, { useState, useEffect, useRef } from 'react';
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

  const reorderTimer = useRef(null);

  const handleReorder = (newItems) => {
    setItems(newItems);
    if (onReorder) {
      clearTimeout(reorderTimer.current);
      reorderTimer.current = setTimeout(() => {
        onReorder(newItems.map(p => p.id));
      }, 500);
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
                    <div className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer ${isSelected
                      ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/10 border border-primary-500/30 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                      : 'hover:bg-white/[0.04] text-slate-400 border border-transparent hover:border-white/[0.05] hover:translate-x-1'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-gradient-to-b from-primary-400 to-accent-400 shadow-[0_0_12px_rgba(217,70,239,0.8)] rounded-r-full"
                        />
                      )}

                      <div className="flex items-center gap-3 overflow-hidden flex-1" onClick={() => onSelect(p.id)}>
                        <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1 -ml-2 rounded" onPointerDown={(e) => e.stopPropagation()}>
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${statusColor} shrink-0 shadow-[0_0_8px_currentColor] opacity-80 group-hover:opacity-100 transition-opacity`}
                        />
                        <span className={`truncate font-medium text-[13px] tracking-wide group-hover:text-white transition-colors ${isSelected ? 'font-bold' : ''}`}>
                          {p.name}
                        </span>
                      </div>

                      {p.isInstalled && (
                        <span className={`text-[10px] font-mono px-2 py-1 rounded-md transition-all border ${isSelected ? 'bg-primary-500/30 border-primary-500/40 text-primary-200 shadow-inner' : 'bg-white/[0.03] border-white/5 text-slate-500 group-hover:bg-white/[0.08] group-hover:text-slate-300'}`}>
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
