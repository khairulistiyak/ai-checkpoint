/**
 * Precision Local Timezone Date & Status Helper Utilities
 */

export function isStepDone(step) {
  if (!step) return false;
  return step.status === 'done' || step.status === 'completed';
}

export function isStepActive(step) {
  if (!step) return false;
  return step.status === 'running' || step.status === 'in_progress';
}

export function isStepPending(step) {
  if (!step) return false;
  return !isStepDone(step) && !isStepActive(step);
}

export function formatLocalTime(dateStr) {
  if (!dateStr) return '';
  if (typeof dateStr !== 'string' && typeof dateStr !== 'number') return '';

  const str = String(dateStr).trim();
  if (!str) return '';

  // Try standard parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2000) {
    return parsed.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  // Handle YYYY-MM-DD HH:mm
  const m = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2}))?/);
  if (m) {
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const day = parseInt(m[3], 10);
    const hour = parseInt(m[4] || '0', 10);
    const minute = parseInt(m[5] || '0', 10);
    if (year > 2000) {
      const dt = new Date(year, month, day, hour, minute);
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      }
    }
  }

  return '';
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return '';
  const diffSec = Math.floor((Date.now() - parsed.getTime()) / 1000);
  if (diffSec < 0) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
