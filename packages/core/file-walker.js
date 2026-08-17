/**
 * file-walker.js — Canonical file walker for all scanners.
 *
 * Replaces 8 duplicate walkers across the codebase.
 * Every scanner MUST use these functions instead of local walkers.
 */

const fs = require('fs');
const path = require('path');
const { SKIP_DIRS, JS_EXTS, CODE_EXTS, SCAN_EXTS, shouldSkipDir } = require('./scan-constants.js');

/**
 * Walk code files recursively with configurable options.
 *
 * @param {string} dir — root directory to scan
 * @param {object} [options]
 * @param {string[]} [options.extensions] — file extensions filter (default: JS_EXTS)
 * @param {string[]} [options.skipDirs] — directories to skip (default: SKIP_DIRS)
 * @param {boolean} [options.withMeta] — return {path,name,ext,size} objects (default: false → path strings)
 * @param {number} [options.maxDepth] — max directory depth (default: Infinity)
 * @param {string[]} [options._results] — internal accumulator
 * @param {number} [options._depth] — internal depth tracker
 * @returns {Array} — array of file paths or meta objects
 */
function walkCodeFiles(dir, options) {
  const opts = options || {};
  const exts = opts.extensions || JS_EXTS;
  const skip = opts.skipDirs || SKIP_DIRS;
  const withMeta = opts.withMeta || false;
  const maxDepth = opts.maxDepth !== undefined ? opts.maxDepth : Infinity;
  const results = opts._results || [];
  const depth = opts._depth || 0;

  if (depth > maxDepth) return results;

  let entries;
  try { entries = fs.readdirSync(dir); } catch { return results; }

  for (const name of entries) {
    if (name.startsWith('.') || name.startsWith('._') || skip.includes(name)) continue;
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) continue;

    if (stat.isDirectory()) {
      walkCodeFiles(full, { ...opts, _results: results, _depth: depth + 1 });
      continue;
    }

    const ext = path.extname(name).toLowerCase();
    if (!exts.includes(ext) || stat.size === 0) continue;

    if (withMeta) {
      results.push({ path: full, name, ext, size: stat.size });
    } else {
      results.push({ path: full, ext });
    }
  }

  return results;
}

/**
 * Walk ALL files recursively (not filtered by extension).
 * Used by structure-analyzer for full project tree analysis.
 *
 * @param {string} dir — root directory
 * @param {object} [options]
 * @param {string[]} [options.skipDirs] — directories to skip (default: SKIP_DIRS)
 * @param {boolean} [options.withDepth] — include depth in results (default: false)
 * @param {number} [options.maxDepth] — max scan depth (default: 15)
 * @param {number} [options._depth] — internal depth tracker
 * @param {Array} [options._results] — internal accumulator
 * @returns {Array} — array of {path, name, isDir, size, depth?}
 */
function walkAllFiles(dir, options) {
  const opts = options || {};
  const skip = opts.skipDirs || SKIP_DIRS;
  const withDepth = opts.withDepth || false;
  const maxDepth = opts.maxDepth !== undefined ? opts.maxDepth : 15;
  const results = opts._results || [];
  const depth = opts._depth || 0;

  if (depth > maxDepth) return results;

  let entries;
  try { entries = fs.readdirSync(dir); } catch { return results; }

  for (const name of entries) {
    // Completely ignore macOS AppleDouble files across all scanners
    if (skip.includes(name) || name.startsWith('._')) continue;
    
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) continue;

    const isDir = stat.isDirectory();
    const entry = { path: full, name, isDir, size: stat.size };
    if (withDepth) entry.depth = depth;
    results.push(entry);

    if (isDir) {
      walkAllFiles(full, { ...opts, _results: results, _depth: depth + 1 });
    }
  }

  return results;
}

module.exports = { walkCodeFiles, walkAllFiles };
