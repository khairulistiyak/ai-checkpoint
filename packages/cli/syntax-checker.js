/**
 * syntax-checker.js — CLI syntax checking command.
 *
 * Uses canonical syntax-utils from packages/core for shared functions.
 * Provides syntaxCheck for individual file validation.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const { checkBalanced, getEsbuild, checkImportTargets } = require('../core/syntax-utils.js');

function checkSyntax(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return checkBalanced(content, '([{', ')]}', 'bracket');
}

function checkCss(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/["'][^"']*["']/g, '""');
  return checkBalanced(content, '{', '}', 'brace');
}

const EXT_MAP = {
  '.js': 'node', '.cjs': 'node', '.mjs': 'node',
  '.jsx': 'jsx', '.ts': 'tsx', '.tsx': 'tsx',
  '.json': 'json', '.sh': 'bash', '.bash': 'bash',
  '.css': 'css'
};

function syntaxCheck(filePath) {
  if (!fs.existsSync(filePath)) return { ok: true, warnings: [], error: null };
  const stat = fs.statSync(filePath);
  if (!stat.isFile() || stat.size === 0) return { ok: true, warnings: [], error: null };

  const ext = path.extname(filePath).toLowerCase();
  const type = EXT_MAP[ext];
  if (!type) return { ok: true, warnings: [], error: null };

  const warnings = [];
  try {
    if (type === 'node' || type === 'jsx' || type === 'tsx') {
      const content = fs.readFileSync(filePath, 'utf8');
      const esbuild = getEsbuild();
      if (esbuild) {
        try {
          const loader = (ext === '.jsx' || ext === '.tsx' || ext === '.ts') ? ext.slice(1) : 'js';
          esbuild.transformSync(content, { loader });
        } catch (e) {
          return { ok: false, warnings, error: `${path.basename(filePath)}: ${e.message.split('\n')[0]}` };
        }
      } else {
        try {
          new vm.Script(content, { filename: filePath });
        } catch (e) {
          if (e.message.includes('Cannot use import') || e.message.includes("Unexpected token 'export'") || e.message.includes("Unexpected identifier 'import'")) {
            const r = checkSyntax(filePath);
            if (!r.ok) return { ok: false, warnings, error: `${path.basename(filePath)}: ${r.error}` };
          } else {
            return { ok: false, warnings, error: `${path.basename(filePath)}: ${e.message.split('\n')[0]}` };
          }
        }
      }
    } else if (type === 'json') {
      JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else if (type === 'bash') {
      execFileSync('bash', ['-n', filePath], { stdio: 'pipe' });
    } else if (type === 'css') {
      const r = checkCss(filePath);
      if (!r.ok) return { ok: false, warnings, error: r.error };
    }
  } catch (e) {
    return { ok: false, warnings, error: `${path.basename(filePath)}: ${(e.stderr || e.message || '').toString().split('\n')[0]}` };
  }

  if (type === 'node' || type === 'jsx' || type === 'tsx') warnings.push(...checkImportTargets(filePath));
  return { ok: true, warnings, error: null };
}

module.exports = { syntaxCheck, checkImportTargets, checkBalanced };
