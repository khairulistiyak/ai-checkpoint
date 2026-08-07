const fs = require('fs');
const path = require('path');

const SKIP = ['node_modules', '.git', 'dist', 'build', '.agents', 'plan', 'marketing'];
const CODE_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs', '.css'];

function walkCode(dir, results) {
  if (!results) results = [];
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return results; }
  for (const name of entries) {
    if (name.startsWith('.') || name.startsWith('._') || SKIP.includes(name)) continue;
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) { walkCode(full, results); continue; }
    const ext = path.extname(name).toLowerCase();
    if (CODE_EXTS.includes(ext) && stat.size > 0) results.push(full);
  }
  return results;
}

function fixHygiene(projectPath, options) {
  if (!options) options = {};
  const dryRun = options.dryRun !== false; // default: dry run
  const files = walkCode(projectPath);
  const fixes = [];

  for (const filePath of files) {
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); } catch { continue; }
    let modified = false;
    let newContent = content;

    // Fix trailing whitespace
    const lines = newContent.split('\n');
    let trailingFixed = 0;
    const fixedLines = lines.map(line => {
      const trimmed = line.trimEnd();
      if (trimmed !== line && line.trim().length > 0) {
        trailingFixed++;
        return trimmed;
      }
      return line;
    });
    if (trailingFixed > 0) {
      newContent = fixedLines.join('\n');
      modified = true;
      fixes.push({ file: filePath, type: 'trailing-whitespace', count: trailingFixed });
    }

    // Fix multiple blank lines (3+ → 2)
    const before = newContent;
    newContent = newContent.replace(/\n{4,}/g, '\n\n\n');
    if (newContent !== before) {
      modified = true;
      fixes.push({ file: filePath, type: 'excess-blank-lines', count: 1 });
    }

    // Ensure file ends with single newline
    if (newContent.length > 0 && !newContent.endsWith('\n')) {
      newContent += '\n';
      modified = true;
      fixes.push({ file: filePath, type: 'missing-final-newline', count: 1 });
    }

    if (modified && !dryRun) {
      try { fs.writeFileSync(filePath, newContent, 'utf8'); } catch {}
    }
  }

  return {
    dryRun,
    filesScanned: files.length,
    fixesApplied: fixes.length,
    fixes,
  };
}

module.exports = { fixHygiene };
