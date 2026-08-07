import fs from 'fs';
import path from 'path';
import { shouldIgnore } from './activity-ignore.js';
import { rotateLogFile, clearLogEntries } from './activity-log-rotate.js';

class ActivityLogger {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.logFile = path.join(projectPath, '.agents', 'activity-log.jsonl');
    this.maxEntries = 5000;
    this.writeQueue = [];
    this.isWriting = false;
  }

  log(action, relativePath) {
    if (shouldIgnore(relativePath)) return;

    const entry = {
      ts: new Date().toISOString(),
      action,
      file: relativePath,
    };

    if (action !== 'DELETED') {
      try {
        const fullPath = path.join(this.projectPath, relativePath);
        const stat = fs.statSync(fullPath);
        entry.size = stat.size;
      } catch (e) {
        /* file stat error ignored */
      }
    }

    this.writeQueue.push(entry);
    this._flush();
  }

  read(limit = 100, offset = 0) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return { entries: [], total: 0 };
      }
      const content = fs.readFileSync(this.logFile, 'utf8').trim();
      if (!content) return { entries: [], total: 0 };

      const lines = content.split('\n');
      const total = lines.length;
      const reversed = lines.reverse();
      const sliced = reversed.slice(offset, offset + limit);

      const entries = [];
      for (const line of sliced) {
        try {
          entries.push(JSON.parse(line));
        } catch (e) {
          /* corrupt line ignored */
        }
      }

      return { entries, total };
    } catch (e) {
      return { entries: [], total: 0 };
    }
  }

  clear(range = 'all') {
    this.writeQueue = [];
    return clearLogEntries(this.logFile, range);
  }

  _flush() {
    if (this.isWriting || this.writeQueue.length === 0) return;
    this.isWriting = true;

    try {
      const dir = path.dirname(this.logFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const lines = this.writeQueue.map(e => JSON.stringify(e)).join('\n') + '\n';
      this.writeQueue = [];
      fs.appendFileSync(this.logFile, lines, 'utf8');

      this._rotate();
    } catch (e) {
      console.error('⚠️ ActivityLogger write error:', e.message);
    } finally {
      this.isWriting = false;
    }
  }

  _rotate() {
    rotateLogFile(this.logFile, this.maxEntries);
  }
}

export { ActivityLogger, shouldIgnore };
