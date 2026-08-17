/**
 * workspace-scanner.js — Project workspace scanner.
 *
 * Uses canonical modules for walking, constants, and syntax checks.
 * Public API preserved for backward compatibility.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const { CODE_EXTS, SCAN_EXTS, JS_EXTS } = require('./scan-constants.js');
const { walkCodeFiles } = require('./file-walker.js');
const { getEsbuild, checkImportsStructured } = require('./syntax-utils.js');

/** Walk all scannable files (code + config). Backward-compatible wrapper. */
function walkFiles(dir) {
  return walkCodeFiles(dir, { extensions: SCAN_EXTS });
}

/** In-memory JS/JSX/TSX syntax check via esbuild or vm.Script fallback. */
function checkJsSyntaxInMemory(fp, content, ext) {
  const esbuild = getEsbuild();
  if (esbuild) {
    try {
      const loader = (ext === '.jsx' || ext === '.tsx' || ext === '.ts') ? ext.slice(1) : 'js';
      esbuild.transformSync(content, { loader });
      return null;
    } catch (e) {
      return { error: e.message.split('\n')[0], type: 'syntax' };
    }
  }
  try {
    new vm.Script(content, { filename: fp });
    return null;
  } catch (e) {
    if (e.message.includes('Cannot use import') || e.message.includes("Unexpected token 'export'") || e.message.includes("Unexpected identifier 'import'")) return null;
    return { error: e.message.split('\n')[0], type: 'syntax' };
  }
}

/** Backward-compatible wrapper for checkImportsStructured. */
function checkImports(filePath) {
  return checkImportsStructured(filePath);
}

/** Check balanced brackets in CSS content. */
function checkBalancedCss(content) {
  let depth = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') { depth--; if (depth < 0) return `Unbalanced brace at position ${i}`; }
  }
  return depth > 0 ? `brace has ${depth} unclosed pair(s)` : null;
}

/** Scan a single file for syntax and import errors. */
function scanFile(fileInfo) {
  const { path: fp, ext } = fileInfo;
  const errors = [];
  try {
    if (JS_EXTS.includes(ext)) {
      const content = fs.readFileSync(fp, 'utf8');
      const syntaxErr = checkJsSyntaxInMemory(fp, content, ext);
      if (syntaxErr) errors.push({ file: fp, error: syntaxErr.error, type: syntaxErr.type });
      errors.push(...checkImports(fp));
    } else if (ext === '.json') {
      try { JSON.parse(fs.readFileSync(fp, 'utf8')); }
      catch (e) { errors.push({ file: fp, error: e.message.split('\n')[0], type: 'syntax' }); }
    } else if (ext === '.css') {
      const content = fs.readFileSync(fp, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/['"][^'"]*['"]/g, '""');
      const err = checkBalancedCss(content);
      if (err) errors.push({ file: fp, error: err, type: 'syntax' });
    } else if (ext === '.sh') {
      try { execFileSync('bash', ['-n', fp], { stdio: 'pipe' }); }
      catch (e) { errors.push({ file: fp, error: (e.stderr || e.message).toString().split('\n')[0], type: 'syntax' }); }
    }
  } catch (e) { /* skip unreadable files */ }
  return errors;
}

/** Count effective (non-blank, non-comment) lines. */
function countEffectiveLines(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
      .filter(l => l.trim() && !/^\s*(\/\/|#(?!!)|\/\*|\*|<!--|--)\s*/.test(l)).length;
  } catch { return 0; }
}

/** Check Rule 0: 150-line limit on code files. */
function checkRule0(files) {
  const violations = [];
  for (const f of files) {
    if (!CODE_EXTS.includes(f.ext)) continue;
    const lines = countEffectiveLines(f.path);
    if (lines > 150) violations.push({ file: f.path, error: `${lines} effective lines (limit: 150)`, type: 'rule0' });
  }
  return violations;
}

/** Full workspace scan: syntax + imports + Rule 0. */
function scanWorkspace(projectPath) {
  const files = walkFiles(projectPath);
  const issues = [];
  for (const f of files) { issues.push(...scanFile(f)); }
  issues.push(...checkRule0(files));
  return { filesScanned: files.length, issues };
}

module.exports = { scanWorkspace, walkFiles, countEffectiveLines, checkImports, checkJsSyntaxInMemory, CODE_EXTS, SCAN_EXTS };
