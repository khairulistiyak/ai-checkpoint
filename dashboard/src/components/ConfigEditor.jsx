import React, { useState, useEffect } from 'react';
import { Save, FileText, Code2, Sliders, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../utils/api';
import { useToast } from './ToastProvider';
import { GeneralTab, RulesTab, AgentsTab } from './config/ProjectSettingsTabs';

export default function ConfigEditor({ projectId, onClose }) {
  const { showToast } = useToast();
  const [project, setProject] = useState(null);
  const [stackInfo, setStackInfo] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [rules, setRules] = useState('');
  const [agents, setAgents] = useState('');
  const [origRules, setOrigRules] = useState('');
  const [origAgents, setOrigAgents] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [pData, cData] = await Promise.all([
          api.fetchProject(projectId),
          api.fetchConfig(projectId)
        ]);
        setProject(pData);
        setRules(cData.rules || '');
        setAgents(cData.agents || '');
        setOrigRules(cData.rules || '');
        setOrigAgents(cData.agents || '');
        setLoading(false);

        api.fetchProjectStack(projectId).then(setStackInfo).catch(() => null);
        api.fetchProjectCompliance(projectId).then(setCompliance).catch(() => null);
      } catch (err) {
        showToast(`Failed to load: ${err.message}`, 'error');
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateConfig(projectId, { rules, agents });
      setOrigRules(rules);
      setOrigAgents(agents);
      showToast('Project configuration saved!', 'success');
    } catch (err) {
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateName = async (newName) => {
    try {
      const res = await api.updateProjectName(projectId, newName);
      if (res.project) setProject(res.project);
      showToast('Project name updated!', 'success');
    } catch {
      showToast('Failed to update name', 'error');
    }
  };

  const handleOpenIde = async () => {
    try {
      const res = await api.fetchSettings().catch(() => ({}));
      const ide = res.preferences?.preferredIde || 'vscode';
      window.location.href = `${ide}://file/${project?.path}`;
      showToast(`Opening in ${ide.toUpperCase()}...`, 'info');
    } catch {
      window.location.href = `vscode://file/${project?.path}`;
    }
  };

  const isDirty = rules !== origRules || agents !== origAgents;
  const handleClose = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Close anyway?')) return;
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />
      <div className="bg-[#101013] w-full max-w-4xl h-full max-h-[85vh] flex flex-col shadow-2xl border border-white/[0.08] rounded-3xl z-10 relative overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-black/40 gap-2 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {[
              { id: 'general', label: 'General & Radar', icon: Sliders },
              { id: 'rules', label: 'RULES.md', icon: FileText },
              { id: 'agents', label: 'AGENTS.md', icon: Code2 }
            ].map((t) => {
              const Icon = t.icon;
              const isSel = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${isSel ? 'bg-white/10 text-white border border-white/15' : 'text-zinc-400 hover:text-white'}`}>
                  <Icon size={14} className={isSel ? 'text-zinc-200' : ''} /> {t.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isDirty && (
              <button onClick={handleSave} disabled={saving} className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
              </button>
            )}
            <button onClick={handleClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
              <span className="text-xs font-mono">Loading configuration...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="h-full">
                {activeTab === 'general' && <GeneralTab project={project} stackInfo={stackInfo} compliance={compliance} onUpdateName={handleUpdateName} onSyncPlans={() => api.syncProjectPlans(projectId).then(() => showToast('Plans synced!', 'success'))} onRelinkBridge={() => api.relinkProjectBridge(projectId).then(() => showToast('Bridge relinked!', 'success'))} onClearLogs={() => api.deleteActivityLog(projectId).then(() => showToast('Logs cleared!', 'info'))} onOpenIde={handleOpenIde} />}
                {activeTab === 'rules' && <RulesTab content={rules} onChange={setRules} onInjectPreset={(txt) => setRules((prev) => prev ? prev + '\n' + txt : txt)} />}
                {activeTab === 'agents' && <AgentsTab content={agents} onChange={setAgents} onInjectPreset={(txt) => setAgents((prev) => prev ? prev + '\n' + txt : txt)} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
