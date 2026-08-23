import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';
import { getSettings } from './settings.js';

/**
 * handleOpenInIde — Controller for opening a target file in user's preferred IDE
 */
export function handleOpenInIde(req, res) {
  try {
    const { filePath, line = 1, projectId } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' });
    }

    const settings = getSettings();
    const preferredIde = settings.preferences?.preferredIde || 'vscode';

    let fullPath = filePath;
    if (!path.isAbsolute(filePath)) {
      if (projectId) {
        const project = settings.projects?.find((p) => p.id === projectId);
        if (project?.path) {
          fullPath = path.resolve(project.path, filePath);
        }
      }
      if (!fs.existsSync(fullPath)) {
        for (const proj of settings.projects || []) {
          const testPath = path.resolve(proj.path, filePath);
          if (fs.existsSync(testPath)) {
            fullPath = testPath;
            break;
          }
        }
      }
      if (!fs.existsSync(fullPath)) {
        fullPath = path.resolve(process.cwd(), '..', filePath);
        if (!fs.existsSync(fullPath)) {
          fullPath = path.resolve(process.cwd(), filePath);
        }
      }
    }

    const platform = os.platform();
    let opened = false;
    const ideExecutables = {
      vscode: ['code', 'cursor', 'windsurf'],
      cursor: ['cursor', 'code'],
      windsurf: ['windsurf', 'code'],
      idea: ['idea', 'code']
    };

    const targetBinaries = ideExecutables[preferredIde] || ['code'];
    for (const bin of targetBinaries) {
      try {
        execFileSync(bin, ['-g', `${fullPath}:${line}`], { stdio: 'ignore', timeout: 5000 });
        opened = true;
        break;
      } catch (err) {
        void err;
      }
    }

    if (!opened && platform === 'darwin') {
      try {
        execFileSync('open', [fullPath], { stdio: 'ignore', timeout: 5000 });
        opened = true;
      } catch (err) {
        void err;
      }
    }

    res.json({
      success: true,
      opened,
      fullPath,
      ide: preferredIde,
      url: `${preferredIde}://file/${fullPath}:${line}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
