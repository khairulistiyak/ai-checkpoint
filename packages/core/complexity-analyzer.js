const fs = require('fs');

const { walkCodeFiles } = require('./file-walker.js');

function analyzeComplexity(projectPath) {
  const files = walkCodeFiles(projectPath).map(f => f.path);
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
