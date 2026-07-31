import React, { useState, useEffect } from 'react';
import { Save, FileText, Code2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../utils/api';
import { useToast } from './ToastProvider';

export default function ConfigEditor({ projectId, onClose }) {
  const { showToast } = useToast();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' or 'agents'
  const [rulesContent, setRulesContent] = useState('');
  const [agentsContent, setAgentsContent] = useState('');
  const [originalRules, setOriginalRules] = useState('');
  const [originalAgents, setOriginalAgents] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.fetchConfig(projectId);
        setConfig(data);
        setRulesContent(data.rules || '');
        setAgentsContent(data.agents || '');
        setOriginalRules(data.rules || '');
        setOriginalAgents(data.agents || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateConfig(projectId, { rules: rulesContent, agents: agentsContent });
      setOriginalRules(rulesContent);
      setOriginalAgents(agentsContent);
      showToast('Config saved successfully!', 'success');
    } catch (err) {
      showToast(`Failed to save: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const isDirty = rulesContent !== originalRules || agentsContent !== originalAgents;

  const handleClose = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Close anyway?')) return;
    onClose();
  };

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8"
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={handleClose}></div>
      <div className="glass-card w-[95vw] sm:w-[85vw] max-w-5xl h-full max-h-[90vh] sm:max-h-[85vh] md:h-[80vh] flex flex-col shadow-2xl border border-slate-600/50 rounded-2xl z-10 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/50 gap-2">
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 text-xs sm:text-sm min-h-[44px] ${activeTab === 'rules' ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <FileText className="w-4 h-4" /> RULES.md
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 text-xs sm:text-sm min-h-[44px] ${activeTab === 'agents' ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Code2 className="w-4 h-4" /> AGENTS.md
            </button>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 py-2 sm:py-2.5 px-4 rounded-xl text-sm font-medium min-h-[44px]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <button onClick={onClose} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-4 bg-slate-950/50 relative">
          <textarea
            value={activeTab === 'rules' ? rulesContent : agentsContent}
            onChange={(e) => activeTab === 'rules' ? setRulesContent(e.target.value) : setAgentsContent(e.target.value)}
            className="w-full h-full bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none custom-scrollbar p-2"
            spellCheck={false}
          />
        </div>
      </div>
    </motion.div>
  );
}
