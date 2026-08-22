import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSettings } from './settings.js';
import { ActivityLogger, shouldIgnore } from './activity-logger.js';
import * as globalStore from './global-store.js';

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
    const resolvedTemplates = path.resolve(__dirname, '..', '..', '..', 'templates');
    this.templatesDir = fs.existsSync(resolvedTemplates)
      ? resolvedTemplates
      : path.join(process.resourcesPath || __dirname, 'templates');
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
  // BUG FIX: Now writes to global store instead of .agents/
  restoreProgressFromTemplate(projectId) {
    const watcher = this.watchers.get(projectId);
    if (!watcher) return false;

    const templatePath = path.join(this.templatesDir, 'PROGRESS.md');
    const destPath = globalStore.getProgressPath(projectId);

    if (!fs.existsSync(templatePath)) return false;

    try {
      globalStore.ensureProjectDataDir(projectId);
      fs.copyFileSync(templatePath, destPath);
      console.log(`🔄 PROGRESS.md restored for project ${projectId}`); // keep
      this.sseManager.broadcast(projectId, 'file-restored', {
        file: 'PROGRESS.md',
        message: '🔄 PROGRESS.md recreated from template',
      });
      return true;
    } catch (e) {
      console.error(`⚠️ Failed to restore PROGRESS.md:`, e.message);
      return false;
    }
  }

  // Generate root AGENTS.md bridge (clean single-file standard)
  generatePointerFiles(projectPath) {
    const rootAgents = path.join(projectPath, 'AGENTS.md');
    const targetAgents = path.join('.agents', 'AGENTS.md');
    if (!fs.existsSync(rootAgents)) {
      try {
        fs.symlinkSync(targetAgents, rootAgents);
        console.log(`  ✔ Created root AGENTS.md symlink`); // keep
      } catch {
        try {
          const tmpl = path.join(this.templatesDir, 'AGENTS.md');
          if (fs.existsSync(tmpl)) fs.copyFileSync(tmpl, rootAgents);
          console.log(`  ✔ Created root AGENTS.md`); // keep
        } catch (e) {
          console.error(`  ⚠️ Failed to create root AGENTS.md:`, e.message);
        }
      }
    }
  }

  // Initialize watchers for all registered projects
  // BUG FIX: Removed .agents dir check — migrated projects won't have it
  initializeAll() {
    try {
      const settings = getSettings();
      if (settings.projects && settings.projects.length > 0) {
        for (const p of settings.projects) {
          if (p.path && fs.existsSync(p.path)) {
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