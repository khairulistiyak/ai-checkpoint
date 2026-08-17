/**
 * scan-constants.js — Single Source of Truth for all scanning constants.
 *
 * Every scanner in packages/core/ MUST import from here.
 * No local SKIP/CODE_EXTS/JUNK duplication allowed.
 */

const SKIP_DIRS = [
  'node_modules', '.git', 'dist', 'build', 'release',
  '.agents', 'plan', '.vscode', '.github', '_archive',
  'vendor', 'marketing', 'tests', '.vite', '.cache',
  'coverage', '.nyc_output'
];

const CODE_EXTS = [
  '.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts',
  '.php', '.py', '.rs', '.go', '.dart', '.java',
  '.c', '.cpp', '.h', '.rb', '.swift', '.kt',
  '.cs', '.vue', '.svelte'
];

const JS_EXTS = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts'];

const SCAN_EXTS = [
  ...CODE_EXTS,
  '.json', '.css', '.sh', '.yaml', '.yml', '.toml', '.sql'
];

const JUNK_FILES = [
  '.DS_Store', 'Thumbs.db', 'desktop.ini',
  'npm-debug.log', 'yarn-error.log', 'pnpm-debug.log',
  '.npmignore.swp', '.env.local.bak'
];

const JUNK_PATTERNS = [
  /^\._/,          // macOS resource forks
  /\.bak$/i,       // backup files
  /\.swp$/i,       // vim swap files
  /\.swo$/i,       // vim swap overflow
  /~$/,            // editor tilde backups
  /\.orig$/i,      // merge conflict originals
  /\.tmp$/i        // temporary files
];

/**
 * Check if a filename matches any junk pattern.
 * @param {string} name — file basename
 * @returns {boolean}
 */
function isJunkFile(name) {
  if (JUNK_FILES.includes(name)) return true;
  return JUNK_PATTERNS.some(p => p.test(name));
}

/**
 * Check if a directory name should be skipped.
 * @param {string} name — directory basename
 * @returns {boolean}
 */
function shouldSkipDir(name) {
  return name.startsWith('.') || name.startsWith('._') || SKIP_DIRS.includes(name);
}

module.exports = {
  SKIP_DIRS,
  CODE_EXTS,
  JS_EXTS,
  SCAN_EXTS,
  JUNK_FILES,
  JUNK_PATTERNS,
  isJunkFile,
  shouldSkipDir
};
