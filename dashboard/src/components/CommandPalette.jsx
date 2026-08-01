import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Folder, Zap, Settings, Command } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, projects, onSelectProject, onOpenSettings }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const allItems = useMemo(() => {
    const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    const staticActions = [
      { id: 'settings', name: 'Preferences & Theme', icon: Settings, action: onOpenSettings },
      { id: 'shortcuts', name: 'Keyboard Shortcuts (?)', icon: Command, action: () => alert('⌨️ KEYBOARD SHORTCUTS\n\nCmd/Ctrl + K : Open Command Palette\nEnter : Select / Confirm\nEsc : Close / Cancel\n? : Show Keyboard Shortcuts') },
    ].filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || query === '?');
    return [
      ...filteredProjects.map(p => ({ ...p, type: 'project' })),
      ...staticActions.map(a => ({ ...a, type: 'action' }))
    ];
  }, [projects, query, onOpenSettings]);

  const executeItem = useCallback((item) => {
    if (item.type === 'project') {
      onSelectProject(item.id);
    } else if (item.type === 'action') {
      item.action();
    }
    onClose();
  }, [onSelectProject, onClose]);

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
  }, [isOpen, allItems, selectedIndex, executeItem, onClose]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-0 md:pt-[15vh]">
      <div className="absolute inset-0 bg-cyber-dark/80 backdrop-blur-md" onClick={onClose}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2 }}
        className="glass-card w-full max-w-2xl h-full md:h-auto bg-cyber-card/95 border-0 md:border md:border-cyber-card-border shadow-2xl relative z-10 overflow-hidden flex flex-col md:max-h-[70vh] rounded-none md:rounded-2xl"
      >
        <div className="flex items-center px-4 py-3 border-b border-cyber-card-border">
          <Search className="w-5 h-5 text-cyber-text-secondary mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search projects, actions..."
            className="flex-1 bg-transparent border-none text-cyber-text-primary focus:outline-none focus:ring-0 text-lg placeholder-cyber-text-muted"
          />
          <div className="flex items-center gap-1 text-xs text-cyber-text-secondary font-mono bg-cyber-dark/50 px-2 py-1 rounded border border-cyber-card-border">
            <Command className="w-3 h-3" /> K
          </div>
        </div>

        <div className="overflow-y-auto p-2">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-cyber-text-muted">
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
                        ? 'bg-cyber-accent/10 text-cyber-text-primary border border-cyber-accent' 
                        : 'text-cyber-text-secondary hover:bg-cyber-dark/50 border border-transparent hover:border-cyber-card-border'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-cyber-text-primary' : 'text-cyber-text-muted'}`} />
                    <div className="flex-1">
                      <div className={`font-medium ${isSelected ? 'text-cyber-text-primary' : 'text-cyber-text-secondary'}`}>
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
                          ? 'bg-cyber-accent/20 text-cyber-text-primary border border-cyber-accent/50' 
                          : 'bg-cyber-dark text-cyber-text-muted border border-cyber-card-border'
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
