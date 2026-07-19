import React, { useState, useEffect } from 'react';
import { Save, FileText, Code2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../utils/api';

export default function ConfigEditor({ projectId, onClose }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' or 'agents'
  const [rulesContent, setRulesContent] = useState('');
  const [agentsContent, setAgentsContent] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.fetchConfig(projectId);
        setConfig(data);
        setRulesContent(data.rules || '');
        setAgentsContent(data.agents || '');
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
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="glass-card w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl border-slate-600/50">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'rules' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <FileText className="w-4 h-4" /> RULES.md
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'agents' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Code2 className="w-4 h-4" /> AGENTS.md
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
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
