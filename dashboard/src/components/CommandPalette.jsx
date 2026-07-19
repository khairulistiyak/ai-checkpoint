import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Folder, Zap, Settings, Command } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, projects, onSelectProject, onOpenSettings }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Filter items
  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  
  const staticActions = [
    { id: 'settings', name: 'Preferences & Theme', icon: Settings, action: onOpenSettings },
  ].filter(a => a.name.toLowerCase().includes(query.toLowerCase()));

  const allItems = [
    ...filteredProjects.map(p => ({ ...p, type: 'project' })),
    ...staticActions.map(a => ({ ...a, type: 'action' }))
  ];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : allItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allItems[selectedIndex];
        if (selected) {
          executeItem(selected);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allItems, selectedIndex]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const executeItem = (item) => {
    if (item.type === 'project') {
      onSelectProject(item.id);
    } else if (item.type === 'action') {
      item.action();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-0 md:pt-[15vh]">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2 }}
        className="glass-card w-full max-w-2xl h-full md:h-auto bg-slate-900/95 border-0 md:border md:border-slate-700/80 shadow-2xl relative z-10 overflow-hidden flex flex-col md:max-h-[70vh] rounded-none md:rounded-2xl"
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-700/50">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search projects, actions..."
            className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 text-lg placeholder-slate-500"
          />
          <div className="flex items-center gap-1 text-xs text-slate-500 font-mono bg-slate-800 px-2 py-1 rounded">
            <Command className="w-3 h-3" /> K
          </div>
        </div>

        <div className="overflow-y-auto p-2">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No results found for "{query}"
            </div>
          ) : (
            <ul className="space-y-1">
              {allItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const Icon = item.type === 'project' ? Folder : item.icon;
                
                return (
                  <li 
                    key={item.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => executeItem(item)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-accent-600/20 text-white border border-accent-500/30' 
                        : 'text-slate-400 hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-accent-400' : 'text-slate-500'}`} />
                    <div className="flex-1">
                      <div className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {item.name}
                      </div>
                      {item.type === 'project' && (
                        <div className="text-xs opacity-60 truncate mt-0.5 font-mono">
                          {item.path}
                        </div>
                      )}
                    </div>
                    {item.type === 'project' && (
                      <div className={`text-xs px-2 py-1 rounded-md ${
                        item.isInstalled 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {item.isInstalled ? `${item.progress?.overall?.percentage || 0}%` : 'Setup'}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}
