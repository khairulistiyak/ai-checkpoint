const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function checkBalanced(content, openChars, closeChars, label) {
  const stack = [];
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (openChars.includes(ch)) stack.push(ch);
    else if (closeChars.includes(ch)) {
      const open = openChars[closeChars.indexOf(ch)];
      if (stack.pop() !== open) return { ok: false, error: `Unbalanced ${label} at position ${i}` };
    }
  }
  return stack.length === 0 ? { ok: true } : { ok: false, error: `${label} has ${stack.length} unclosed pair(s)` };
}

function checkSyntax(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return checkBalanced(content, '([{', ')]}', 'bracket');
}

function checkCss(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/["'][^"']*["']/g, '""');
  return checkBalanced(content, '{', '}', 'brace');
}

function checkImportTargets(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const warnings = [];
  const re = /(?:from\s+|require\(\s*)['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const spec = m[1];
    if (!spec.startsWith('.')) continue;
    const target = path.resolve(path.dirname(filePath), spec);
    const exts = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    const exists = fs.existsSync(target) || exts.some(e => fs.existsSync(target + e)) || fs.existsSync(path.join(target, 'index.js'));
    if (!exists) warnings.push(`⚠ Possibly missing import "${spec}" in ${path.basename(filePath)}`);
  }
  return warnings;
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
    if (type === 'node') {
      execFileSync(process.execPath, ['-c', filePath], { stdio: 'pipe' });
    } else if (type === 'json') {
      JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else if (type === 'bash') {
      execFileSync('bash', ['-n', filePath], { stdio: 'pipe' });
    } else if (type === 'jsx' || type === 'tsx') {
      const r = checkSyntax(filePath);
      if (!r.ok) return { ok: false, warnings, error: r.error };
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