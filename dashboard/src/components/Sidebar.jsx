import React from 'react';
import { Folder, Plus, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ projects, selectedId, onSelect, onAddProject }) {
  return (
    <aside className="w-72 glass-panel rounded-2xl flex flex-col h-[calc(100vh-8rem)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800/20 to-transparent pointer-events-none"></div>
      
      <div className="p-6 border-b border-slate-700/50 flex items-center justify-between relative z-10">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Folder className="w-4 h-4 text-violet-400" /> Projects ({projects.length})
        </h2>
        <button 
          onClick={onAddProject}
          className="p-1.5 hover:bg-violet-600/20 rounded-lg text-slate-300 hover:text-violet-300 transition-colors"
          title="Add Project"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 relative z-10">
        {projects.length === 0 ? (
          <div className="text-center p-6 text-slate-500 text-sm italic">
            No projects added yet.
          </div>
        ) : (
          projects.map(p => {
            const isSelected = selectedId === p.id;
            const progress = p.progress?.overall?.percentage || 0;
            
            let statusColor = "bg-slate-600 shadow-slate-600/50";
            if (!p.isInstalled) statusColor = "bg-red-500 shadow-red-500/50";
            else if (progress === 100) statusColor = "bg-emerald-500 shadow-emerald-500/50";
            else if (progress > 0) statusColor = "bg-fuchsia-500 shadow-fuchsia-500/50";
            else statusColor = "bg-violet-500 shadow-violet-500/50";

            return (
              <motion.button
                key={p.id}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(p.id)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-300 relative overflow-hidden group ${
                  isSelected 
                    ? 'bg-gradient-to-r from-violet-600/30 to-fuchsia-600/10 border border-violet-500/50 text-white shadow-lg' 
                    : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-400 to-fuchsia-400 rounded-l-xl"></div>
                )}
                
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-3 h-3 rounded-full ${statusColor} shadow-[0_0_10px_currentColor] transition-colors`}></div>
                  <span className={`truncate font-medium text-sm group-hover:text-white transition-colors ${isSelected ? 'font-bold' : ''}`}>
                    {p.name}
                  </span>
                </div>
                
                {p.isInstalled && (
                  <span className={`text-xs font-mono px-2 py-1 rounded-md transition-colors ${isSelected ? 'bg-violet-500/20 text-violet-200' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                    {progress}%
                  </span>
                )}
              </motion.button>
            );
          })
        )}
      </div>
      
      <div className="p-5 border-t border-slate-700/50 bg-slate-900/50 relative z-10">
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="uppercase tracking-widest text-emerald-400/80">System Online</span>
        </div>
      </div>
    </aside>
  );
}
