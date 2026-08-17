const fs = require('fs');

/**
 * Scans a file's content for responsive CSS/styling practices.
 * Penalizes hardcoded px, rewards clamp, rem, vw, vh.
 * 
 * @param {string} content 
 * @returns {object} { score: number, issues: string[] }
 */
function scanForResponsive(content) {
  let score = 100;
  const issues = [];
  
  // Basic tokenization/regex mapping
  const pxRegex = /(\d+)px/g;
  const clampRegex = /clamp\(/g;
  const viewportRegex = /(\d+)(vw|vh)/g;
  const remRegex = /(\d*\.?\d+)rem/g;
  
  let pxMatches = [...content.matchAll(pxRegex)];
  
  // Filter out common acceptable px usages like 1px borders or 0px
  const hardcodedPx = pxMatches.filter(m => {
    const val = parseInt(m[1], 10);
    return val > 1; // 0px and 1px are usually fine for borders
  });

  if (hardcodedPx.length > 0) {
    const deduction = Math.min(hardcodedPx.length * 2, 40); // Cap deduction
    score -= deduction;
    issues.push(`Found ${hardcodedPx.length} hardcoded pixel values (>1px). Use rem, vw/vh, or clamp() instead.`);
  }
  
  const hasClamp = clampRegex.test(content);
  const hasViewport = viewportRegex.test(content);
  const hasRem = remRegex.test(content);
  
  // Reward dynamic units if score was deducted
  if (score < 100) {
    if (hasClamp) score += 5;
    if (hasViewport) score += 5;
    if (hasRem) score += 5;
  }
  
  if (!hasClamp && !hasViewport && !hasRem && content.includes('{')) {
    issues.push(`No fluid typography or scalable units (rem, vw, clamp) found.`);
    score -= 10;
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    issues
  };
}

/**
 * Scans multiple files and returns an aggregated responsive score.
 * 
 * @param {string[]} files Array of absolute file paths
 * @returns {object}
 */
function analyzeResponsiveness(files) {
  let totalScore = 0;
  let totalFiles = 0;
  const allIssues = [];

  for (const file of files) {
    if (!file.endsWith('.css') && !file.endsWith('.scss') && !file.endsWith('.jsx') && !file.endsWith('.tsx') && !file.endsWith('.js')) {
      continue;
    }
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.trim().length === 0) continue;
      
      const { score, issues } = scanForResponsive(content);
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
    responsiveScore: totalFiles > 0 ? Math.round(totalScore / totalFiles) : 100,
    issues: allIssues
  };
}

module.exports = {
  scanForResponsive,
  analyzeResponsiveness
};
