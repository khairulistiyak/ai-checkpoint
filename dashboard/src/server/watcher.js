import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSettings } from './settings.js';
import { ActivityLogger, shouldIgnore } from './activity-logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { SSEClientManager } from './watcher-sse.js';
import { ProjectWatcher, POINTER_CONTENT, POINTER_FILES } from './watcher-events.js';

// ──────────────────────────────────────────────
// Watcher Manager (manages all project watchers)
// ──────────────────────────────────────────────

class WatcherManager {
  constructor() {
    this.sseManager = new SSEClientManager();
    this.watchers = new Map(); // projectId → ProjectWatcher
    this.templatesDir = path.resolve(__dirname, '..', '..', '..', 'templates');
  }

  getOrCreateWatcher(projectId, projectPath) {
    if (this.watchers.has(projectId)) {
      return this.watchers.get(projectId);
    }
    const watcher = new ProjectWatcher(projectId, projectPath, this.sseManager, this.templatesDir);
    watcher.start();
    this.watchers.set(projectId, watcher);
    return watcher;
  }

  stopWatcher(projectId) {
    const watcher = this.watchers.get(projectId);
    if (watcher) {
      watcher.stop();
      this.watchers.delete(projectId);
    }
  }

  stopAll() {
    for (const [id, watcher] of this.watchers) {
      watcher.stop();
    }
    this.watchers.clear();
  }

  // Restore PROGRESS.md from template (called when user accepts warning)
  restoreProgressFromTemplate(projectId) {
    const watcher = this.watchers.get(projectId);
    if (!watcher) return false;

    const templatePath = path.join(this.templatesDir, 'PROGRESS.md');
    const destPath = path.join(watcher.projectPath, '.agents', 'PROGRESS.md');

    if (!fs.existsSync(templatePath)) return false;

    try {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(templatePath, destPath);
      console.log(`🔄 PROGRESS.md restored for project ${projectId}`); // keep
      this.sseManager.broadcast(projectId, 'file-restored', {
        file: '.agents/PROGRESS.md',
        message: '🔄 PROGRESS.md recreated from template',
      });
      return true;
    } catch (e) {
      console.error(`⚠️ Failed to restore PROGRESS.md:`, e.message);
      return false;
    }
  }

  // Generate pointer files for all AI tools
  generatePointerFiles(projectPath) {
    const copilotDir = path.join(projectPath, '.github');

    for (const file of POINTER_FILES) {
      const destPath = path.join(projectPath, file);
      if (!fs.existsSync(destPath)) {
        try {
          fs.writeFileSync(destPath, POINTER_CONTENT, 'utf8');
          console.log(`  ✔ Created pointer: ${file}`); // keep
        } catch (e) {
          console.error(`  ⚠️ Failed to create ${file}:`, e.message);
        }
      }
    }

    // GitHub Copilot special path
    const copilotFile = path.join(copilotDir, 'copilot-instructions.md');
    if (!fs.existsSync(copilotFile)) {
      try {
        fs.mkdirSync(copilotDir, { recursive: true });
        fs.writeFileSync(copilotFile, POINTER_CONTENT, 'utf8');
        console.log(`  ✔ Created pointer: .github/copilot-instructions.md`); // keep
      } catch (e) {
        console.error(`  ⚠️ Failed to create copilot-instructions.md:`, e.message);
      }
    }
  }

  // Initialize watchers for all registered projects
  initializeAll() {
    try {
      const settings = getSettings();
      if (settings.projects && settings.projects.length > 0) {
        for (const p of settings.projects) {
          if (p.path && fs.existsSync(p.path) && fs.existsSync(path.join(p.path, '.agents'))) {
            this.getOrCreateWatcher(p.id, p.path);
          }
        }
      }
    } catch (e) {
      console.error('⚠️ Failed to initialize watchers:', e.message);
    }
  }
}

// Singleton
const watcherManager = new WatcherManager();

export { watcherManager, SSEClientManager, POINTER_FILES, POINTER_CONTENT };
