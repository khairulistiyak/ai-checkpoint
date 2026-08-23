import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderPlus, Folder, Tag, X, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function AddProjectModal({ isOpen, onClose, onAdd }) {
  const [path, setPath] = useState('');
  const [name, setName] = useState('');
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) { setPath(''); setName(''); setIsSubmitting(false); }
  }, [isOpen]);

  const handlePathChange = (val) => {
    setPath(val);
    if (!name && val) {
      const parts = val.replace(/[/\\]+$/, '').split(/[/\\]/);
      const base = parts[parts.length - 1];
      if (base) setName(base);
    }
  };

  const handleBrowse = async () => {
    setIsBrowsing(true);
    try {
      if (typeof window !== 'undefined' && window.electronAPI?.selectFolder) {
        const folderPath = await window.electronAPI.selectFolder();
        if (folderPath) handlePathChange(folderPath);
        return;
      }
      const res = await fetch('/api/browse-directory');
      const data = await res.json();
      if (data?.path) handlePathChange(data.path);
    } catch (err) {
      console.error('Failed to browse directory', err);
    } finally { setIsBrowsing(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!path.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try { await onAdd(path.trim(), name.trim() || undefined); }
    finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close modal backdrop" className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-all w-full h-full border-0 cursor-default" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative z-10 w-full max-w-lg rounded-3xl p-[1px] bg-gradient-to-b from-white/20 via-white/[0.08] to-transparent shadow-2xl shadow-black/90"
      >
        <div className="bg-[#0b0c12]/95 backdrop-blur-3xl p-5 sm:p-6 rounded-[23px] border border-white/[0.08]">
          <div className="flex items-start justify-between gap-3 mb-5 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white font-outfit tracking-tight">Track Workspace</h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">Studio</span>
                </div>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">Register local repository into AI Checkpoint state ledger.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-sky-400" />
                <span>Absolute Directory Path</span>
                <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={path}
                  onChange={(e) => handlePathChange(e.target.value)}
                  placeholder="/Users/username/projects/my-awesome-app"
                  required
                  className="w-full pl-3.5 pr-24 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] focus:bg-black/50 border border-white/10 focus:border-sky-500/50 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleBrowse}
                  disabled={isBrowsing}
                  className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/15 text-zinc-200 border border-white/10 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isBrowsing ? <Loader2 size={12} className="animate-spin text-sky-400" /> : <Sparkles size={12} className="text-sky-400" />}
                  <span>{isBrowsing ? 'Browsing...' : 'Browse'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                <span>Project Name (Optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome App (defaults to folder name)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] focus:bg-black/50 border border-white/10 focus:border-purple-500/50 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>

            {path && (
              <div className="p-3 rounded-2xl bg-sky-500/5 border border-sky-500/20 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-xs font-mono text-zinc-300 truncate">{path}</span>
                </div>
                <span className="text-[10px] font-mono text-sky-400 font-bold shrink-0 bg-sky-500/10 px-2 py-0.5 rounded-md">Ready</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">Cancel</button>
              <button type="submit" disabled={!path.trim() || isSubmitting} className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
                {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                <span>{isSubmitting ? 'Tracking...' : 'Track Project'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
