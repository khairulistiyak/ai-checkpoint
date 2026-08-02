import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, FileText } from 'lucide-react';
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

  useEffect(() => {
    if (project?.id) {
      api.fetchAiTier(project.id)
        .then((res) => { if (res.tier) setTier(res.tier); })
        .catch(() => {});
    }
  }, [project?.id]);

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
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-[#09090b] flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-[#121214] border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl space-y-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-outfit">
              AI Plan Builder Workflow
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Step-by-step specification generator for atomic project execution.
            </p>
          </div>
        </div>

        {/* Step-by-Step Workflow Container */}
        <div className="space-y-7">
          {/* Step 01: Identifier */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-[11px] font-mono font-bold text-white">
                01
              </span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Plan Identifier
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Unique file name for your atomic plan spec
                </p>
              </div>
            </div>
            <InputField
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
              placeholder="e.g. user-auth-flow"
              required
            />
          </div>

          {/* Step 02: Goal & Requirements */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-[11px] font-mono font-bold text-white">
                02
              </span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Goal & Requirements
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Define target files, architectural changes, and expected behavior
                </p>
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe exact requirements, target files, and expected behavior..."
              className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-all h-28 resize-none font-sans custom-scrollbar"
            />
          </div>

          {/* Step 03: Autonomy Tier */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-[11px] font-mono font-bold text-white">
                03
              </span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Model Autonomy Tier
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Select AI reasoning depth and step limits per phase
                </p>
              </div>
            </div>
            <AiTierSelector selectedTier={tier} onChange={setTier} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <FileText className="w-4 h-4 text-zinc-400" />
            <span>Writes to plan/{name || 'your-plan'}.md</span>
          </div>

          <GlassButton
            type="submit"
            disabled={loading || !name}
            variant="primary"
            size="md"
            className="px-6 flex items-center gap-2 font-bold"
          >
            {loading ? 'Generating Plan...' : (
              <>
                <span>Generate Plan Spec</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
