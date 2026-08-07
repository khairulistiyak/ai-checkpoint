import path from 'path';

// Directories and files to IGNORE (never log these)
export const IGNORE_PATTERNS = [
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
export const IGNORE_EXTENSIONS = [
  '.swp', '.swo', '.tmp', '.log',
];

/**
 * Checks if a file path should be ignored.
 * @param {string} relativePath - path relative to project root
 * @returns {boolean}
 */
export function shouldIgnore(relativePath) {
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
