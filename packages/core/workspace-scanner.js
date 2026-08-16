const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', 'release', '.agents', 'plan', '.vscode', '.github', '_archive', 'vendor'];
const CODE_EXTS = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts', '.php', '.py', '.rs', '.go', '.dart', '.java', '.c', '.cpp', '.h', '.rb', '.swift', '.kt', '.cs', '.vue', '.svelte'];
const SCAN_EXTS = [...CODE_EXTS, '.json', '.css', '.sh', '.yaml', '.yml', '.toml', '.sql'];

function walkFiles(dir, results = []) {
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return results; }
  for (const name of entries) {
    if (name.startsWith('.') || name.startsWith('._') || SKIP_DIRS.includes(name)) continue;
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) { walkFiles(full, results); continue; }
    const ext = path.extname(name).toLowerCase();
    if (SCAN_EXTS.includes(ext) && stat.size > 0) results.push({ path: full, ext });
  }
  return results;
}

function checkBalanced(content, open, close, label) {
  const stack = [];
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (open.includes(ch)) stack.push(ch);
    else if (close.includes(ch) && stack.pop() !== open[close.indexOf(ch)]) return `Unbalanced ${label} at position ${i}`;
  }
  return stack.length > 0 ? `${label} has ${stack.length} unclosed pair(s)` : null;
}

function checkImports(filePath) {
  const warnings = [];
  let content = fs.readFileSync(filePath, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')
    .replace(/\\?`[\s\S]*?\\?`/g, '""').replace(/\\"[^"]*\\"/g, '""');

  const re = /^\s*(?:import\s+(?:[\w*\s{},]*\s+from\s+)?|(?:const|let|var)\s+[\w*\s{},:]+\s*=\s*require\(\s*|require\(\s*)['"]([^'"]+)['"]/gm;
  let m;
  while ((m = re.exec(content)) !== null) {
    const spec = m[1];
    if (!spec.startsWith('.')) continue;
    const target = path.resolve(path.dirname(filePath), spec);
    const exts = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '.cjs', '.mjs'];
    const found = exts.some(e => fs.existsSync(target + e)) || fs.existsSync(path.join(target, 'index.js'));
    if (!found) warnings.push({ file: filePath, error: `Missing import: "${spec}"`, type: 'broken-import' });
  }
  return warnings;
}

let cachedEsbuild = null;
function getEsbuild() {
  if (cachedEsbuild !== null) return cachedEsbuild;
  try { cachedEsbuild = require('esbuild'); return cachedEsbuild; } catch {}
  try { cachedEsbuild = require(path.resolve(__dirname, '..', '..', 'dashboard', 'node_modules', 'esbuild')); return cachedEsbuild; } catch {}
  cachedEsbuild = false;
  return cachedEsbuild;
}

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
    if (e.message.includes('Cannot use import') || e.message.includes('Unexpected token \'export\'') || e.message.includes('Unexpected identifier \'import\'')) return null;
    return { error: e.message.split('\n')[0], type: 'syntax' };
  }
}

function scanFile(fileInfo) {
  const { path: fp, ext } = fileInfo;
  const errors = [];
  try {
    if (['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts'].includes(ext)) {
      const content = fs.readFileSync(fp, 'utf8');
      const syntaxErr = checkJsSyntaxInMemory(fp, content, ext);
      if (syntaxErr) errors.push({ file: fp, error: syntaxErr.error, type: syntaxErr.type });
      errors.push(...checkImports(fp));
    } else if (ext === '.json') {
      try { JSON.parse(fs.readFileSync(fp, 'utf8')); }
      catch (e) { errors.push({ file: fp, error: e.message.split('\n')[0], type: 'syntax' }); }
    } else if (ext === '.css') {
      const content = fs.readFileSync(fp, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/['"][^'"]*['"]/g, '""');
      const err = checkBalanced(content, '{', '}', 'brace');
      if (err) errors.push({ file: fp, error: err, type: 'syntax' });
    } else if (ext === '.sh') {
      try { execFileSync('bash', ['-n', fp], { stdio: 'pipe' }); }
      catch (e) { errors.push({ file: fp, error: (e.stderr || e.message).toString().split('\n')[0], type: 'syntax' }); }
    }
  } catch (e) { /* skip */ }
  return errors;
}

function countEffectiveLines(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
      .filter(l => l.trim() && !/^\s*(\/\/|#(?!!)|\/\*|\*|<!--|--)/.test(l)).length;
  } catch { return 0; }
}

function checkRule0(files) {
  const violations = [];
  for (const f of files) {
    if (!CODE_EXTS.includes(f.ext)) continue;
    const lines = countEffectiveLines(f.path);
    if (lines > 150) violations.push({ file: f.path, error: `${lines} effective lines (limit: 150)`, type: 'rule0' });
  }
  return violations;
}

function scanWorkspace(projectPath) {
  const files = walkFiles(projectPath);
  const issues = [];
  for (const f of files) { issues.push(...scanFile(f)); }
  issues.push(...checkRule0(files));
  return { filesScanned: files.length, issues };
}

module.exports = { scanWorkspace, walkFiles, countEffectiveLines, checkImports, checkJsSyntaxInMemory, CODE_EXTS, SCAN_EXTS };
