import fs from 'fs';

export function rotateLogFile(logFile, maxEntries) {
  try {
    if (!fs.existsSync(logFile)) return;
    const content = fs.readFileSync(logFile, 'utf8').trim();
    if (!content) return;

    const lines = content.split('\n');
    if (lines.length > maxEntries) {
      const trimmed = lines.slice(lines.length - maxEntries);
      fs.writeFileSync(logFile, trimmed.join('\n') + '\n', 'utf8');
    }
  } catch (e) {
    /* rotate error ignored */
  }
}

export function clearLogEntries(logFile, range = 'all') {
  try {
    if (!fs.existsSync(logFile)) {
      return { deletedCount: 0, remainingCount: 0 };
    }

    if (range === 'all') {
      let count = 0;
      try {
        const content = fs.readFileSync(logFile, 'utf8').trim();
        if (content) count = content.split('\n').filter(Boolean).length;
      } catch (e) {
        /* read error ignored */
      }
      fs.writeFileSync(logFile, '', 'utf8');
      return { deletedCount: count, remainingCount: 0 };
    }

    const now = Date.now();
    const rangeMs = {
      last_hour: 60 * 60 * 1000,
      today: 24 * 60 * 60 * 1000,
      last_24h: 24 * 60 * 60 * 1000,
      last_7d: 7 * 24 * 60 * 60 * 1000,
      last_30d: 30 * 24 * 60 * 60 * 1000,
    };
    const thresholdMs = rangeMs[range] || 0;
    if (!thresholdMs) return { deletedCount: 0, remainingCount: 0 };

    const cutoffTime = now - thresholdMs;
    const content = fs.readFileSync(logFile, 'utf8').trim();
    if (!content) return { deletedCount: 0, remainingCount: 0 };

    const lines = content.split('\n');
    const keptLines = [];
    let deletedCount = 0;

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        const entryTime = new Date(entry.ts).getTime();
        if (!isNaN(entryTime) && entryTime >= cutoffTime) {
          deletedCount++;
        } else {
          keptLines.push(line);
        }
      } catch (e) {
        /* corrupt line ignored */
        deletedCount++;
      }
    }

    fs.writeFileSync(logFile, keptLines.length > 0 ? keptLines.join('\n') + '\n' : '', 'utf8');
    return { deletedCount, remainingCount: keptLines.length };
  } catch (e) {
    console.error('⚠️ ActivityLogger clear error:', e.message);
    return { deletedCount: 0, remainingCount: 0 };
  }
}
