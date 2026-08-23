import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Bot, Shield, Terminal, Palette, Check } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { AgentTab, TelemetryTab, IdeTab, ToggleRow } from './settings/SettingsTabs';
import { useToast } from './ToastProvider';

const themes = [
  { id: 'studio', name: 'Apple Studio Matte', desc: 'Zinc monochrome zero-glare', primary: 'bg-zinc-900', accent: 'bg-zinc-100' },
  { id: 'midnight', name: 'Midnight Obsidian', desc: 'Soft silver deep dark', primary: 'bg-neutral-900', accent: 'bg-neutral-400' },
  { id: 'zinc', name: 'Sleek Zinc Studio', desc: 'Engineering dark slate', primary: 'bg-zinc-800', accent: 'bg-zinc-300' },
];

export default function SettingsModal({ isOpen, onClose }) {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('agent');
  const [prefs, setPrefs] = useState({
    theme: theme || 'studio', rule0Limit: 150, autoSyncPlans: true, defaultAiTier: 'small',
    strictSyntaxCheck: true, autoRestoreFiles: true, telemetryPulse: 3, logRetention: 1000,
    preferredIde: 'vscode', preferredShell: '/bin/zsh', soundEffects: false, compactView: false
  });

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => { if (d.preferences) setPrefs((prev) => ({ ...prev, ...d.preferences })); })
      .catch(() => {});
  }, [isOpen]);

  const updatePrefs = async (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    if (patch.theme) setTheme(patch.theme);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: patch })
      });
      showToast('Settings saved', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'agent', label: 'Agent', icon: Bot },
    { id: 'telemetry', label: 'Telemetry', icon: Shield },
    { id: 'ide', label: 'IDE & Shell', icon: Terminal },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button type="button" aria-label="Close settings backdrop" className="absolute inset-0 bg-black/80 backdrop-blur-md w-full h-full border-0 cursor-default" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-[#121214] flex flex-col shadow-2xl w-full max-w-lg relative z-10 border border-white/[0.08] rounded-3xl overflow-hidden max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-zinc-300" />
            <h2 className="text-base sm:text-lg font-bold text-white font-outfit">Studio Settings</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-white/[0.08] px-4 pt-2 gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  isSelected ? 'bg-white/10 text-white border border-white/15' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-sky-400' : ''} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
              {activeTab === 'agent' && <AgentTab prefs={prefs} update={updatePrefs} />}
              {activeTab === 'telemetry' && <TelemetryTab prefs={prefs} update={updatePrefs} />}
              {activeTab === 'ide' && <IdeTab prefs={prefs} update={updatePrefs} />}
              {activeTab === 'appearance' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => updatePrefs({ theme: t.id })}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                          (prefs.theme || theme) === t.id ? 'bg-white/[0.08] border-white/20' : 'bg-white/[0.02] border-white/[0.05] hover:border-white/15'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-white">{t.name}</div>
                          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">{t.desc}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex"><div className={`w-3.5 h-3.5 rounded-full ${t.primary} border border-white/20`} /></div>
                          {(prefs.theme || theme) === t.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  <ToggleRow label="Compact UI Spacing" desc="Dense Roadmap & Cockpit grid layout" checked={Boolean(prefs.compactView)} onChange={(v) => updatePrefs({ compactView: v })} />
                  <ToggleRow label="Audio Chime Notifications" desc="Subtle feedback on completed steps" checked={Boolean(prefs.soundEffects)} onChange={(v) => updatePrefs({ soundEffects: v })} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
