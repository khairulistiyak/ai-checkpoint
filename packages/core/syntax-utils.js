/**
 * syntax-utils.js — Canonical syntax utilities.
 *
 * Unifies duplicate checkBalanced, getEsbuild, checkImportTargets
 * from workspace-scanner.js and syntax-checker.js.
 */

const fs = require('fs');
const path = require('path');

/**
 * Check bracket balance in source content.
 * @param {string} content — source text
 * @param {string} openChars — opening characters e.g. '([{'
 * @param {string} closeChars — closing characters e.g. ')]}'
 * @param {string} label — description for error messages
 * @returns {{ ok: boolean, error?: string }}
 */
function checkBalanced(content, openChars, closeChars, label) {
  const stack = [];
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (openChars.includes(ch)) {
      stack.push(ch);
    } else if (closeChars.includes(ch)) {
      const expected = openChars[closeChars.indexOf(ch)];
      if (stack.pop() !== expected) {
        return { ok: false, error: `Unbalanced ${label} at position ${i}` };
      }
    }
  }
  if (stack.length > 0) {
    return { ok: false, error: `${label} has ${stack.length} unclosed pair(s)` };
  }
  return { ok: true };
}

let cachedEsbuild = null;

/**
 * Get esbuild module, checking dashboard fallback.
 * Returns esbuild module or false if unavailable.
 * @returns {object|false}
 */
function getEsbuild() {
  if (cachedEsbuild !== null) return cachedEsbuild;
  try {
    cachedEsbuild = require('esbuild');
    return cachedEsbuild;
  } catch { /* not installed globally */ }
  try {
    const fallback = path.resolve(__dirname, '..', '..', 'dashboard', 'node_modules', 'esbuild');
    cachedEsbuild = require(fallback);
    return cachedEsbuild;
  } catch { /* not in dashboard either */ }
  cachedEsbuild = false;
  return cachedEsbuild;
}

/**
 * Validate relative import/require targets exist on disk.
 * @param {string} filePath — absolute path to source file
 * @returns {string[]} — array of warning messages
 */
function checkImportTargets(filePath) {
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { return []; }
  const warnings = [];
  const re = /(?:from\s+|require\(\s*)['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const spec = m[1];
    if (!spec.startsWith('.')) continue;
    const target = path.resolve(path.dirname(filePath), spec);
    const exts = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '.cjs', '.mjs'];
    const found = exts.some(e => fs.existsSync(target + e))
      || fs.existsSync(path.join(target, 'index.js'));
    if (!found) {
      warnings.push(`⚠ Possibly missing import "${spec}" in ${path.basename(filePath)}`);
    }
  }
  return warnings;
}

/**
 * Check relative imports and return structured warnings (for workspace-scanner).
 * @param {string} filePath — absolute path to source file
 * @returns {Array<{file: string, error: string, type: string}>}
 */
function checkImportsStructured(filePath) {
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { return []; }
  content = content
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')
    .replace(/\\?`[\s\S]*?\\?`/g, '""').replace(/\\"[^"]*\\"/g, '""');

  const warnings = [];
  const re = /^\s*(?:import\s+(?:[\w*\s{},]*\s+from\s+)?|(?:const|let|var)\s+[\w*\s{},:]+\s*=\s*require\(\s*|require\(\s*)['"]([^'"]+)['"]/gm;
  let m;
  while ((m = re.exec(content)) !== null) {
    const spec = m[1];
    if (!spec.startsWith('.')) continue;
    const target = path.resolve(path.dirname(filePath), spec);
    const exts = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '.cjs', '.mjs'];
    const found = exts.some(e => fs.existsSync(target + e))
      || fs.existsSync(path.join(target, 'index.js'));
    if (!found) {
      warnings.push({ file: filePath, error: `Missing import: "${spec}"`, type: 'broken-import' });
    }
  }
  return warnings;
}

module.exports = {
  checkBalanced,
  getEsbuild,
  checkImportTargets,
  checkImportsStructured
};
