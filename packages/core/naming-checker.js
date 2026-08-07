const fs = require('fs');
const path = require('path');

const SKIP = ['node_modules', '.git', 'dist', 'build', '.agents', 'plan'];
const CODE_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs'];

function walkCodeFiles(dir, results) {
  if (!results) results = [];
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return results; }
  for (const name of entries) {
    if (name.startsWith('.') || SKIP.includes(name)) continue;
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) { walkCodeFiles(full, results); continue; }
    const ext = path.extname(name).toLowerCase();
    if (CODE_EXTS.includes(ext)) results.push({ path: full, name, ext });
  }
  return results;
}

function checkNaming(projectPath) {
  const files = walkCodeFiles(projectPath);
  const issues = [];

  for (const file of files) {
    const base = path.basename(file.name, file.ext);
    // Check for generic names
    if (['utils', 'helpers', 'misc', 'stuff', 'temp', 'test2', 'copy'].includes(base.toLowerCase())) {
      issues.push({ file: file.path, type: 'generic-name', msg: `Generic filename: ${file.name}. Use descriptive name.` });
    }
    // Check for spaces in filename
    if (file.name.includes(' ')) {
      issues.push({ file: file.path, type: 'space-in-name', msg: `Spaces in filename: ${file.name}` });
    }
    // JSX files should be PascalCase
    if ((file.ext === '.jsx' || file.ext === '.tsx') && /^[a-z]/.test(base) && !base.includes('-')) {
      // skip kebab-case (valid) — only flag camelCase starting lowercase without dashes
      if (/^[a-z][a-zA-Z]+$/.test(base) && base !== 'index' && base !== 'main') {
        issues.push({ file: file.path, type: 'jsx-naming', msg: `JSX file should be PascalCase: ${file.name}` });
      }
    }
  }

  return { filesChecked: files.length, issues };
}

module.exports = { checkNaming };
