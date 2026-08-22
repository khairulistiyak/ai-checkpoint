const fs = require('fs');
const { isUiFile } = require('./responsive-scanner.js');

function scanForPerformance(content) {
  let score = 100;
  const issues = [];
  
  const lazyLoadingRegex = /React\.lazy|lazy\(|\(\)\s*=>\s*import\(/g;
  const memoRegex = /useMemo|useCallback|React\.memo/g;
  
  const hasLazy = lazyLoadingRegex.test(content);
  const hasMemo = memoRegex.test(content);
  
  if (/import\s+_\s+from\s+['"]lodash['"]/.test(content)) {
    issues.push('Avoid importing entire lodash library. Use specific module imports (e.g. lodash/debounce).');
    score -= 10;
  }
  
  if ((content.includes('import React') || content.includes('export default')) && content.length > 5000 && !hasMemo) {
    issues.push(`Large component found without useMemo or useCallback. Consider memoizing calculations.`);
    score -= 10;
  }
  
  if ((content.includes('RouterProvider') || content.includes('<Routes>')) && !hasLazy) {
    issues.push(`Top-level routes should consider React.lazy() for code splitting.`);
    score -= 10;
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    issues
  };
}

function analyzePerformance(files) {
  let totalScore = 0;
  let totalFiles = 0;
  const allIssues = [];

  for (const file of files) {
    if (!isUiFile(file)) continue;
    if (!file.endsWith('.jsx') && !file.endsWith('.tsx')) continue;
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.trim().length === 0) continue;
      
      const { score, issues } = scanForPerformance(content);
      totalScore += score;
      totalFiles++;
      
      if (issues.length > 0) {
        allIssues.push({ file, issues });
      }
    } catch (e) {
      // Ignore read errors
    }
  }

  return {
    performanceScore: totalFiles > 0 ? Math.round(totalScore / totalFiles) : 100,
    issues: allIssues
  };
}

module.exports = {
  scanForPerformance,
  analyzePerformance
};
