const fs = require('fs');
const { isUiFile } = require('./responsive-scanner.js');

function scanForA11y(content) {
  let score = 100;
  const issues = [];
  
  // Image tags missing alt
  if (/<img\b[^>]*>/i.test(content)) {
    const imgTags = content.match(/<img\b[^>]*>/gi) || [];
    const missingAlt = imgTags.filter(tag => !/\balt=/i.test(tag));
    if (missingAlt.length > 0) {
      issues.push(`Found ${missingAlt.length} <img> tag(s) missing an 'alt' attribute.`);
      score -= missingAlt.length * 10;
    }
  }

  // Divs/Spans as buttons without ARIA or role
  if (/<(?:div|span)\b[^>]*(?:onClick|onKeyDown|onKeyUp)[^>]*>/i.test(content)) {
    const clickableDivs = content.match(/<(?:div|span)\b[^>]*(?:onClick|onKeyDown|onKeyUp)[^>]*>/gi) || [];
    const missingRole = clickableDivs.filter(tag => !/\brole=/i.test(tag) && !/\btabIndex=/i.test(tag));
    if (missingRole.length > 0) {
      issues.push(`Found ${missingRole.length} clickable <div/span> tag(s) missing 'role' or 'tabIndex'. Use a <button> or add ARIA attributes.`);
      score -= missingRole.length * 5;
    }
  }

  // Inputs without id or aria-label
  if (/<input\b[^>]*>/i.test(content)) {
    const inputs = content.match(/<input\b[^>]*>/gi) || [];
    const missingId = inputs.filter(tag => !/\bid=/i.test(tag) && !/\baria-label=/i.test(tag) && !/\btype=['"](hidden|submit|button)['"]/i.test(tag));
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

function analyzeA11y(files) {
  let totalScore = 0;
  let totalFiles = 0;
  const allIssues = [];

  for (const file of files) {
    if (!isUiFile(file)) continue;
    if (!file.endsWith('.jsx') && !file.endsWith('.tsx') && !file.endsWith('.html')) continue;
    
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
