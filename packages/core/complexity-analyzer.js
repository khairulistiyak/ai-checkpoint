const fs = require('fs');
const path = require('path');

const SKIP = ['node_modules', '.git', 'dist', 'build', '.agents', 'plan', 'marketing', 'tests'];
const CODE_EXTS = ['.js', '.jsx', '.cjs', '.mjs'];

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

function analyzeComplexity(projectPath) {
  const files = walkCode(projectPath);
  const issues = [];
  const stats = { totalFunctions: 0, complexFunctions: 0 };

  for (const filePath of files) {
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); } catch { continue; }
    const lines = content.split('\n');

    // Count function declarations and estimate complexity
    const funcPattern = /^\s*(function\s+\w+|const\s+\w+\s*=\s*(async\s+)?(\([^)]*\)|[\w]+)\s*=>|module\.exports\s*=\s*function|exports\.\w+\s*=\s*function)/;
    let currentFunc = null;
    let braceDepth = 0;
    let funcStart = 0;
    let ifCount = 0;
    let loopCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed.startsWith('//')) continue;

      if (funcPattern.test(line) && braceDepth <= 1) {
        if (currentFunc && (ifCount + loopCount) > 8) {
          const lineCount = i - funcStart;
          issues.push({
            file: filePath,
            line: funcStart + 1,
            type: 'high-complexity',
            msg: `Function "${currentFunc}" has complexity ${ifCount + loopCount} (${lineCount} lines)`,
          });
          stats.complexFunctions++;
        }
        const match = line.match(/function\s+(\w+)|const\s+(\w+)/);
        currentFunc = match ? (match[1] || match[2]) : 'anonymous';
        funcStart = i;
        ifCount = 0;
        loopCount = 0;
        stats.totalFunctions++;
      }

      if (/\b(if|else if|case|\?\s*:)\b/.test(trimmed)) ifCount++;
      if (/\b(for|while|do)\b/.test(trimmed)) loopCount++;
    }

    // Check last function
    if (currentFunc && (ifCount + loopCount) > 8) {
      const lineCount = lines.length - funcStart;
      issues.push({
        file: filePath,
        line: funcStart + 1,
        type: 'high-complexity',
        msg: `Function "${currentFunc}" has complexity ${ifCount + loopCount} (${lineCount} lines)`,
      });
      stats.complexFunctions++;
    }
  }

  return { filesChecked: files.length, stats, issues };
}

module.exports = { analyzeComplexity };
