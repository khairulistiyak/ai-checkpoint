import fs from 'fs';
import path from 'path';
import os from 'os';

const SETTINGS_DIR = path.join(os.homedir(), '.ai-checkpoint-dashboard');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

export const DEFAULT_PREFERENCES = {
  theme: 'studio',
  rule0Limit: 150,
  autoSyncPlans: true,
  defaultAiTier: 'small',
  strictSyntaxCheck: true,
  autoRestoreFiles: true,
  telemetryPulse: 3,
  logRetention: 1000,
  preferredIde: 'vscode',
  preferredShell: process.env.SHELL || '/bin/bash',
  soundEffects: false,
  compactView: false,
  language: 'en'
};

export function getSettings() {
  try {
    if (!fs.existsSync(SETTINGS_DIR)) fs.mkdirSync(SETTINGS_DIR, { recursive: true });
    if (!fs.existsSync(SETTINGS_FILE)) {
      const defaultSettings = { version: 1, projects: [], preferences: DEFAULT_PREFERENCES };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    const raw = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    return {
      version: raw.version || 1,
      projects: Array.isArray(raw.projects) ? raw.projects : [],
      preferences: { ...DEFAULT_PREFERENCES, ...(raw.preferences || {}) }
    };
  } catch (e) {
    console.error('⚠️ Error reading settings.json:', e.message); // keep
    return { version: 1, projects: [], preferences: DEFAULT_PREFERENCES };
  }
}

export function saveSettings(settings) {
  try {
    if (!fs.existsSync(SETTINGS_DIR)) fs.mkdirSync(SETTINGS_DIR, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error('⚠️ Error saving settings.json:', e.message); // keep
  }
}

export function updatePreferences(newPrefs = {}) {
  const current = getSettings();
  current.preferences = { ...current.preferences, ...newPrefs };
  saveSettings(current);
  return current.preferences;
}
