import express from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { getSettings, saveSettings } from './settings.js';
import projectsRouter from './projects.js';
import configRouter from './config.js';

const router = express.Router();

router.get('/settings', (req, res) => {
  res.json(getSettings());
});

function pickDirectoryLinux() {
  const cmds = [
    'zenity --file-selection --directory --title="Select Project Folder" 2>/dev/null',
    'kdialog --getexistingdirectory "$HOME" 2>/dev/null',
    'yad --file --directory --title="Select Project Folder" 2>/dev/null',
    'python3 -c "import tkinter, tkinter.filedialog as fd; r=tkinter.Tk(); r.withdraw(); p=fd.askdirectory(); print(p or \'\')" 2>/dev/null'
  ];
  for (const cmd of cmds) {
    try {
      const out = execSync(cmd, { encoding: 'utf8', timeout: 60000 }).trim();
      if (out && fs.existsSync(out)) return out;
    } catch {}
  }
  return null;
}

router.get('/browse-directory', (req, res) => {
  try {
    const platform = os.platform();
    let result = '';
    if (platform === 'darwin') {
      const cmd = `osascript -e 'tell application (path to frontmost application as text) to set myFolder to choose folder with prompt "Select Project Folder"' -e 'POSIX path of myFolder'`;
      result = execSync(cmd, { encoding: 'utf8', timeout: 60000 }).trim();
    } else if (platform === 'win32') {
      const cmd = `powershell -NoProfile -Command "(new-object -COM 'Shell.Application').BrowseForFolder(0,'Select Project Folder',0,0).self.path"`;
      result = execSync(cmd, { encoding: 'utf8', timeout: 60000 }).trim();
    } else {
      result = pickDirectoryLinux() || '';
    }
    res.json({ path: result && fs.existsSync(result) ? result : null });
  } catch {
    res.json({ path: null });
  }
});


router.post('/settings/projects', (req, res) => {
  const { path: dirPath, name } = req.body;
  if (!dirPath || typeof dirPath !== 'string') {
    return res.status(400).json({ error: 'Path is required' });
  }
  if (!path.isAbsolute(dirPath)) {
    return res.status(400).json({ error: 'Path must be absolute' });
  }
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    return res.status(400).json({ error: 'Path must be an existing directory' });
  }
  const settings = getSettings();

  if (settings.projects.find(p => p.path === dirPath)) {
    return res.status(400).json({ error: 'Project already exists' });
  }

  const newProject = {
    id: Date.now().toString(),
    path: dirPath,
    name: name || path.basename(dirPath.replace(/\/+$/, '')) || 'Untitled',
    addedAt: new Date().toISOString()
  };

  settings.projects.push(newProject);
  saveSettings(settings);
  res.json(newProject);
});

router.delete('/settings/projects/:id', (req, res) => {
  const settings = getSettings();
  settings.projects = settings.projects.filter(p => p.id !== req.params.id);
  saveSettings(settings);
  res.json({ success: true });
});

router.put('/settings/projects/reorder', (req, res) => {
  const { projectIds } = req.body;
  const settings = getSettings();

  if (!Array.isArray(projectIds)) {
    return res.status(400).json({ error: 'projectIds must be an array' });
  }

  const projectMap = new Map(settings.projects.map(p => [p.id, p]));
  const reordered = projectIds.map(id => projectMap.get(id)).filter(Boolean);
  settings.projects.forEach(p => {
    if (!projectIds.includes(p.id)) reordered.push(p);
  });

  settings.projects = reordered;
  saveSettings(settings);
  res.json({ success: true });
});

router.use('/projects', projectsRouter);
router.use('/', configRouter);

export default router;
