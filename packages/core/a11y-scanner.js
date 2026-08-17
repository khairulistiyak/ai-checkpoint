const fs = require('fs');

/**
 * Scans a file's content for accessibility (a11y) practices.
 * 
 * @param {string} content 
 * @returns {object} { score: number, issues: string[] }
 */
function scanForA11y(content) {
  let score = 100;
  const issues = [];
  
  // Image tags missing alt
  if (/<img[^>]+>/g.test(content)) {
    const imgTags = content.match(/<img[^>]+>/g) || [];
    const missingAlt = imgTags.filter(tag => !/alt=/.test(tag));
    if (missingAlt.length > 0) {
      issues.push(`Found ${missingAlt.length} <img> tag(s) missing an 'alt' attribute.`);
      score -= missingAlt.length * 10;
    }
  }

  // Divs/Spans as buttons without ARIA or role
  if (/<(div|span)[^>]*(onClick|onKeyDown|onKeyUp)[^>]*>/g.test(content)) {
    const clickableDivs = content.match(/<(div|span)[^>]*(onClick|onKeyDown|onKeyUp)[^>]*>/g) || [];
    const missingRole = clickableDivs.filter(tag => !/role=/.test(tag) && !/tabIndex=/.test(tag));
    if (missingRole.length > 0) {
      issues.push(`Found ${missingRole.length} clickable <div/span> tag(s) missing 'role' or 'tabIndex'. Use a <button> or add ARIA attributes.`);
      score -= missingRole.length * 5;
    }
  }

  // Inputs without id (which would prevent label association)
  if (/<input[^>]+>/g.test(content)) {
    const inputs = content.match(/<input[^>]+>/g) || [];
    const missingId = inputs.filter(tag => !/id=/.test(tag) && !/aria-label=/.test(tag));
    if (missingId.length > 0) {
      issues.push(`Found ${missingId.length} <input> tag(s) missing an 'id' or 'aria-label' attribute.`);
      score -= missingId.length * 5;
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues
  };
}

/**
 * Scans multiple files and returns an aggregated a11y score.
 * 
 * @param {string[]} files Array of absolute file paths
 * @returns {object}
 */
function analyzeA11y(files) {
  let totalScore = 0;
  let totalFiles = 0;
  const allIssues = [];

  for (const file of files) {
    if (!file.endsWith('.jsx') && !file.endsWith('.tsx')) {
      continue;
    }
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.trim().length === 0) continue;
      
      const { score, issues } = scanForA11y(content);
      
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
    a11yScore: totalFiles > 0 ? Math.round(totalScore / totalFiles) : 100,
    issues: allIssues
  };
}

module.exports = {
  scanForA11y,
  analyzeA11y
};
