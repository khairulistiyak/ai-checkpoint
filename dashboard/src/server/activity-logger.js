import fs from 'fs';
import path from 'path';

// Directories and files to IGNORE (never log these)
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  '.vite',
  '.DS_Store',
  'activity-log.jsonl',
  '.swp',
  '.swo',
  'package-lock.json',
  '.timestamp-',
];

// File extensions to IGNORE
const IGNORE_EXTENSIONS = [
  '.swp', '.swo', '.tmp', '.log',
];

/**
 * Checks if a file path should be ignored.
 * @param {string} relativePath - path relative to project root
 * @returns {boolean}
 */
function shouldIgnore(relativePath) {
  // Check directory patterns
  for (const pattern of IGNORE_PATTERNS) {
    if (relativePath.includes(pattern)) return true;
  }
  // Check hidden macOS files
  if (path.basename(relativePath).startsWith('._')) return true;
  // Check extensions
  const ext = path.extname(relativePath);
  if (IGNORE_EXTENSIONS.includes(ext)) return true;
  return false;
}

/**
 * ActivityLogger — writes file change entries to .agents/activity-log.jsonl
 * 
 * Format: one JSON object per line (JSONL)
 * Max entries: 5000 (oldest are trimmed)
 */
class ActivityLogger {
  /**
   * @param {string} projectPath - absolute path to the project root
   */
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.logFile = path.join(projectPath, '.agents', 'activity-log.jsonl');
    this.maxEntries = 5000;
    this.writeQueue = [];
    this.isWriting = false;
  }

  /**
   * Log a file change event.
   * @param {'CREATED'|'MODIFIED'|'DELETED'|'RESTORED'} action
   * @param {string} relativePath - file path relative to project root
   */
  log(action, relativePath) {
    // Never log ignored files
    if (shouldIgnore(relativePath)) return;

    const entry = {
      ts: new Date().toISOString(),
      action: action,
      file: relativePath,
    };

    // Try to get file size for non-deleted files
    if (action !== 'DELETED') {
      try {
        const fullPath = path.join(this.projectPath, relativePath);
        const stat = fs.statSync(fullPath);
        entry.size = stat.size;
      } catch (e) {
        // File might not exist anymore, that's ok
      }
    }

    this.writeQueue.push(entry);
    this._flush();
  }

  /**
   * Read log entries.
   * @param {number} limit - max entries to return
   * @param {number} offset - skip this many entries from the end
   * @returns {{ entries: Array, total: number }}
   */
  read(limit = 100, offset = 0) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return { entries: [], total: 0 };
      }
      const content = fs.readFileSync(this.logFile, 'utf8').trim();
      if (!content) return { entries: [], total: 0 };

      const lines = content.split('\n');
      const total = lines.length;

      // Return from newest to oldest
      const reversed = lines.reverse();
      const sliced = reversed.slice(offset, offset + limit);

      const entries = [];
      for (const line of sliced) {
        try {
          entries.push(JSON.parse(line));
        } catch (e) {
          // Skip corrupted lines
        }
      }

      return { entries, total };
    } catch (e) {
      return { entries: [], total: 0 };
    }
  }

  /**
   * Flush the write queue to disk.
   * @private
   */
  _flush() {
    if (this.isWriting || this.writeQueue.length === 0) return;
    this.isWriting = true;

    try {
      // Ensure .agents/ directory exists
      const dir = path.dirname(this.logFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Append new entries
      const lines = this.writeQueue.map(e => JSON.stringify(e)).join('\n') + '\n';
      this.writeQueue = [];
      fs.appendFileSync(this.logFile, lines, 'utf8');

      // Check if rotation is needed
      this._rotate();
    } catch (e) {
      // Logging should never crash the app
      console.error('⚠️ ActivityLogger write error:', e.message);
    } finally {
      this.isWriting = false;
    }
  }

  /**
   * Trim log file if it exceeds maxEntries.
   * @private
   */
  _rotate() {
    try {
      if (!fs.existsSync(this.logFile)) return;
      const content = fs.readFileSync(this.logFile, 'utf8').trim();
      if (!content) return;

      const lines = content.split('\n');
      if (lines.length > this.maxEntries) {
        // Keep only the newest entries
        const trimmed = lines.slice(lines.length - this.maxEntries);
        fs.writeFileSync(this.logFile, trimmed.join('\n') + '\n', 'utf8');
      }
    } catch (e) {
      // Non-critical
    }
  }
}

export { ActivityLogger, shouldIgnore };
