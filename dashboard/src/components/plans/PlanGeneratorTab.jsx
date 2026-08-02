import React, { useState, useEffect } from 'react';
import { FileCode, Sparkles, Terminal, ArrowRight, ShieldCheck } from 'lucide-react';
import AiTierSelector from '../AiTierSelector';
import { GlassButton } from '../ui/GlassButton';
import { InputField } from '../ui/InputField';
import { useToast } from '../ToastProvider';
import * as api from '../../utils/api';

export default function PlanGeneratorTab({ project, onRefresh, onSwitchToFiles }) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    if (project?.id) {
      api.fetchAiTier(project.id).then(res => { if (res.tier) setTier(res.tier); }).catch(() => {});
    }
  }, [project?.id]);

  useEffect(() => {
    const pName = name || 'feature-auth';
    const pDesc = description || 'Implementation plan specification.';
    const limit = tier === 'small' ? 'Max 5 Atomic Steps (Small Context)' : tier === 'high' ? 'High Capacity (Unlimited Steps)' : 'Max 10 Atomic Steps (Balanced)';
    setPreviewContent(`# Plan: ${pName}\n\n> ${pDesc}\n> Constraints: ${limit}\n\n---\n\n## Step 1.1 — Create component spec\n- **File:** src/components/${pName}.jsx\n- **Action:** CREATE\n- **Done-check:** test -f src/components/${pName}.jsx\n- **Depends:** None\n\n## Step 1.2 — Integrate state handler\n- **File:** src/components/${pName}.jsx\n- **Action:** EDIT\n- **Done-check:** grep "useState" src/components/${pName}.jsx\n- **Depends:** 1.1`);
  }, [name, description, tier]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !/^[a-zA-Z0-9-]{1,50}$/.test(name)) {
      showToast('Name must be 1-50 alphanumeric characters or dashes.', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.generatePlan(project.id, { name, tier, description });
      showToast(`Generated plan/${name}.md successfully!`, 'success');
      if (onRefresh) onRefresh();
      setTimeout(() => onSwitchToFiles(), 350);
    } catch (err) {
      showToast(err.message || 'Failed to generate plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-cyber-dark/40">
      {/* Left: Configuration Panel */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 overflow-y-auto custom-scrollbar border-r border-cyber-card-border/40 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-cyber-card-border/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30 text-cyber-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-cyber-text-primary font-outfit uppercase tracking-wider">Plan Generator Engine</h3>
          </div>
          <span className="text-[10px] font-mono text-cyber-text-muted bg-white/5 border border-white/10 px-2 py-0.5 rounded">RULE 1 Generator</span>
        </div>

        <div className="space-y-5">
          <InputField
            label="Plan Identifier"
            value={name}
            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
            placeholder="e.g. user-auth-flow"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-cyber-text-secondary px-1">Goal & Scope Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the exact requirements and expected behavior..."
              className="w-full bg-cyber-card/40 border border-cyber-card-border/60 rounded-xl px-3.5 py-2.5 text-xs text-cyber-text-primary placeholder-cyber-text-muted focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent/30 transition-all h-24 resize-none font-sans custom-scrollbar"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-cyber-text-secondary px-1">Target AI Model Context Capacity</label>
            <AiTierSelector selectedTier={tier} onChange={setTier} />
          </div>
        </div>

        <div className="pt-2">
          <div className="p-3 rounded-xl bg-cyber-accent/5 border border-cyber-accent/20 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyber-accent shrink-0 mt-0.5" />
            <p className="text-[11px] text-cyber-text-secondary leading-relaxed font-sans">
              Generated specs follow <strong className="text-cyber-text-primary font-mono">RULE 1 (Atomic Step Format)</strong> with explicit Done-check commands to eliminate AI ambiguity.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Live Preview Panel */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#060709] border-l border-cyber-card-border/20 relative overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cyber-card-border/30 bg-black/40">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyber-accent" />
            <span className="text-xs font-mono font-bold text-cyber-text-primary">plan/{name || 'feature-auth'}.md</span>
          </div>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Preview
          </span>
        </div>

        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed text-slate-300">
          <pre className="whitespace-pre-wrap">{previewContent}</pre>
        </div>

        <div className="p-4 border-t border-cyber-card-border/30 bg-black/60 flex items-center justify-between">
          <span className="text-[10px] font-mono text-cyber-text-muted">Ready to write to filesystem</span>
          <GlassButton type="submit" disabled={loading || !name} variant="primary" size="md" className="px-6 flex items-center gap-2 font-bold">
            {loading ? 'Generating...' : <><Sparkles className="w-4 h-4 text-cyber-accent" /> Generate Plan Spec <ArrowRight className="w-3.5 h-3.5" /></>}
          </GlassButton>
        </div>
      </div>
    </form>
  );
}
