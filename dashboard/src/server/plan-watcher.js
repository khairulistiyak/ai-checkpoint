import fs from 'fs';
import path from 'path';

let activeWatcher = null;

export function watchPlanDirectory(projectPath, onChange) {
  stopWatching();
  const planDir = path.join(projectPath, 'plan');
  if (!fs.existsSync(planDir)) return;

  let debounceTimer = null;

  try {
    activeWatcher = fs.watch(planDir, (eventType, filename) => {
      if (!filename || !filename.endsWith('.md')) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try { onChange({ eventType, filename }); } catch {}
      }, 500);
    });
    activeWatcher.on('error', () => { stopWatching(); });
  } catch {}
}

export function stopWatching() {
  if (activeWatcher) {
    try { activeWatcher.close(); } catch {}
    activeWatcher = null;
  }
}
