import fs from 'fs';
import path from 'path';
import os from 'os';

const SETTINGS_DIR = path.join(os.homedir(), '.ai-checkpoint-dashboard');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

export function getSettings() {
  try {
    if (!fs.existsSync(SETTINGS_DIR)) {
      fs.mkdirSync(SETTINGS_DIR, { recursive: true });
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      const defaultSettings = {
        version: 1,
        projects: [],
        preferences: { theme: 'dark', refreshInterval: 5000, language: 'en' }
      };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  } catch (e) {
    console.error('⚠️ Error reading settings.json:', e.message);
    return { version: 1, projects: [], preferences: { theme: 'dark', refreshInterval: 5000 } };
  }
}

export function saveSettings(settings) {
  try {
    if (!fs.existsSync(SETTINGS_DIR)) fs.mkdirSync(SETTINGS_DIR, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error('⚠️ Error saving settings.json:', e.message);
  }
}
