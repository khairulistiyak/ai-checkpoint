const fs = require('fs');

const { JS_EXTS } = require('./scan-constants.js');
const { walkCodeFiles } = require('./file-walker.js');

const HYGIENE_EXTS = [...JS_EXTS, '.css'];

function fixHygiene(projectPath, options) {
  if (!options) options = {};
  const dryRun = options.dryRun !== false; // default: dry run
  const files = walkCodeFiles(projectPath, { extensions: HYGIENE_EXTS }).map(f => f.path);
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
