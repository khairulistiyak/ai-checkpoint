const fs = require('fs');
const path = require('path');

const SKIP = ['node_modules', '.git', 'dist', 'build', '.agents', 'plan', 'marketing', 'tests', '_archive', 'release'];
const CODE_EXTS = ['.js', '.jsx', '.cjs', '.mjs'];

function walkCode(dir, results = []) {
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

function analyzeComplexity(projectPath) {
  const files = walkCode(projectPath);
  const issues = [];
  const stats = { totalFunctions: 0, complexFunctions: 0 };

  for (const filePath of files) {
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); } catch { continue; }
    const lines = content.split('\n');

    const funcPattern = /^\s*(function\s+\w+|const\s+\w+\s*=\s*(async\s+)?(\([^)]*\)|[\w]+)\s*=>|module\.exports\s*=\s*function|exports\.\w+\s*=\s*function|export\s+(async\s+)?function\s+\w+|export\s+default\s+function)/;
    let currentFunc = null;
    let braceDepth = 0;
    let funcStart = 0;
    let branchCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;

      if (funcPattern.test(line) && braceDepth <= 1) {
        if (currentFunc && branchCount > 15) {
          const lineCount = i - funcStart;
          issues.push({
            file: filePath,
            line: funcStart + 1,
            type: 'high-complexity',
            msg: `Function "${currentFunc}" has cyclomatic complexity ${branchCount} (${lineCount} lines)`,
          });
          stats.complexFunctions++;
        }
        const match = line.match(/(?:function\s+|const\s+|let\s+|var\s+)(\w+)/);
        currentFunc = match ? match[1] : 'anonymous';
        funcStart = i;
        branchCount = 0;
        stats.totalFunctions++;
      }

      if (currentFunc) {
        if (/\b(if|else if|case|\?\s*:)\b/.test(trimmed)) branchCount++;
        if (/\b(for|while|do)\b/.test(trimmed)) branchCount++;
        if (/\b(&&|\|\|)\b/.test(trimmed)) branchCount++;
      }

      const openCount = (line.match(/{/g) || []).length;
      const closeCount = (line.match(/}/g) || []).length;
      braceDepth += openCount - closeCount;
      if (braceDepth <= 0) {
        if (currentFunc && branchCount > 15) {
          const lineCount = i - funcStart + 1;
          issues.push({
            file: filePath,
            line: funcStart + 1,
            type: 'high-complexity',
            msg: `Function "${currentFunc}" has cyclomatic complexity ${branchCount} (${lineCount} lines)`,
          });
          stats.complexFunctions++;
        }
        currentFunc = null;
        braceDepth = 0;
      }
    }
  }

  return { filesChecked: files.length, stats, issues };
}

module.exports = { analyzeComplexity };
