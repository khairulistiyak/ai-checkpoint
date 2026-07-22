import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AddProjectModal({ isOpen, onClose, onAdd }) {
  const [path, setPath] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!path) return;
    await onAdd(path);
    setPath('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border-white/[0.05]"
      >
        <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Track New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wide">
              Absolute Directory Path
            </label>
            <input
              type="text"
              value={path}
              onChange={e => setPath(e.target.value)}
              placeholder="/path/to/your/project"
              className="w-full bg-[#020617]/50 border border-white/[0.05] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-inner text-white transition-all"
              required
            />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Project
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
