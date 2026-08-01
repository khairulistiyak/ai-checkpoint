import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, FileText } from 'lucide-react';
import AiTierSelector from './AiTierSelector';
import { useToast } from './ToastProvider';
import * as api from '../utils/api';
import { GlassButton } from './ui/GlassButton';
import { InputField } from './ui/InputField';

export default function GeneratePlanModal({ isOpen, project, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    if (isOpen && project?.id) {
      api.fetchAiTier(project.id)
        .then(res => { if (res.tier) setTier(res.tier); })
        .catch(err => console.error('Error fetching project AI tier:', err));
    }
  }, [isOpen, project]);

  useEffect(() => {
    const pName = name || 'my-feature';
    const pDesc = description || 'Description here.';
    const suffix = tier === 'small' ? 'Small (Max 5 steps)' : tier === 'high' ? 'High (Unlimited)' : 'Medium (Max 10 steps)';
    setPreviewContent(`# Plan: ${pName}\n\n> ${pDesc}\n> (AI Tier: ${suffix})\n\n---\n\n## Step 1.1 — Create initial file\n- **File:** src/index.js\n- **Action:** CREATE\n- **Done-check:** test -f src/index.js\n- **Depends:** None`);
  }, [name, description, tier]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !/^[a-zA-Z0-9-]{1,50}$/.test(name)) {
      showToast('Plan name must be 1-50 characters, numbers, or dashes.', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.generatePlan(project.id, { name, tier, description });
      showToast(`Plan plan/${name}.md generated successfully!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to generate plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="glass-card flex flex-col shadow-2xl w-full max-w-4xl h-full md:h-[90vh] relative z-10 border-0 md:border md:border-slate-600/50 rounded-none md:rounded-2xl overflow-hidden bg-slate-950/80"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-400" />
            <h2 className="text-lg font-bold text-white">Generate New AI-Aware Plan</h2>
          </div>
          <GlassButton variant="ghost" onClick={onClose} className="!p-1 rounded-md text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </GlassButton>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <InputField
                label="Plan Name"
                value={name} onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                placeholder="e.g. add-auth-system" required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this plan achieves..."
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-500 transition-colors h-[72px] resize-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select AI Model Tier</label>
            <AiTierSelector selectedTier={tier} onChange={setTier} />
          </div>
          <div className="flex flex-col gap-2 flex-1 min-h-[150px]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Plan File Preview</label>
              <span className="text-[10px] text-slate-500 font-mono">plan/{name || 'my-feature'}.md</span>
            </div>
            <pre className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-auto custom-scrollbar select-none">{previewContent}</pre>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50 mt-auto">
            <GlassButton type="button" onClick={onClose} variant="ghost">Cancel</GlassButton>
            <GlassButton type="submit" disabled={loading || !name} variant="primary" className="flex items-center gap-2 font-semibold">
              {loading ? <>Generating...</> : <><Sparkles className="w-4 h-4" />Generate Plan</>}
            </GlassButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
