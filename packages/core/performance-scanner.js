const fs = require('fs');

/**
 * Scans a file's content for performance practices.
 * 
 * @param {string} content 
 * @returns {object} { score: number, issues: string[] }
 */
function scanForPerformance(content) {
  let score = 100;
  const issues = [];
  
  const lazyLoadingRegex = /React\.lazy|lazy\(|\(\)\s*=>\s*import\(/g;
  const suspenseRegex = /<Suspense/g;
  const memoRegex = /useMemo|useCallback|React\.memo/g;
  
  const hasLazy = lazyLoadingRegex.test(content);
  const hasSuspense = suspenseRegex.test(content);
  const hasMemo = memoRegex.test(content);
  
  // If it imports a lot of things from lodash or massive libraries instead of destructured
  if (/import\s+_\s+from\s+['"]lodash['"]/.test(content)) {
    issues.push('Avoid importing entire lodash library. Use specific module imports (e.g. lodash/debounce).');
    score -= 10;
  }
  
  if (content.includes('import React') || content.includes('export const')) {
    if (content.length > 3000 && !hasMemo) {
      issues.push(`Large component found without useMemo or useCallback. Consider memoizing expensive calculations.`);
      score -= 10;
    }
  }
  
  // Reward lazy loading for routing files
  if ((content.includes('Route') || content.includes('RouterProvider')) && !hasLazy) {
    issues.push(`Routes should use React.lazy() for code splitting.`);
    score -= 20;
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    issues
  };
}

/**
 * Scans multiple files and returns an aggregated performance score.
 * 
 * @param {string[]} files Array of absolute file paths
 * @returns {object}
 */
function analyzePerformance(files) {
  let totalScore = 0;
  let totalFiles = 0;
  const allIssues = [];

  for (const file of files) {
    if (!file.endsWith('.jsx') && !file.endsWith('.tsx') && !file.endsWith('.js')) {
      continue;
    }
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.trim().length === 0) continue;
      
      const { score, issues } = scanForPerformance(content);
      
      if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
        totalScore += score;
        totalFiles++;
        
        if (issues.length > 0) {
          allIssues.push({ file, issues });
        }
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
