import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassButton } from './ui/GlassButton';
import { InputField } from './ui/InputField';

export default function AddProjectModal({ isOpen, onClose, onAdd }) {
  const [path, setPath] = useState('');
  const [isBrowsing, setIsBrowsing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPath('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!path) return;
    await onAdd(path);
    setPath('');
  };

  const handleBrowse = async () => {
    setIsBrowsing(true);
    try {
      const res = await fetch('/api/browse-directory');
      const data = await res.json();
      if (data && data.path) {
        setPath(data.path);
      }
    } catch (err) {
      console.error('Failed to browse directory', err);
    }
    setIsBrowsing(false);
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
            <InputField
              label="Absolute Directory Path"
              value={path}
              onChange={e => setPath(e.target.value)}
              placeholder="/path/to/your/project"
              onBrowse={handleBrowse}
              required
            />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <GlassButton
              type="button"
              onClick={onClose}
              variant="ghost"
            >
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary">
              Add Project
            </GlassButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
