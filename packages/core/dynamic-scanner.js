const fs = require('fs');
const { isUiFile } = require('./responsive-scanner.js');

function scanForDynamics(content) {
  let score = 100;
  const issues = [];
  
  if (!content.includes('className') && !content.includes('class=') && !content.includes('style=') && !content.includes('<')) {
    return { score: 100, issues: [] };
  }

  const hasHooks = /\buse[A-Z]\w*\b/.test(content);
  const hasEvents = /\b(on[A-Z]\w*=|handle[A-Z]\w*)\b/.test(content);
  const hasMotion = /\bmotion\.|AnimatePresence\b/.test(content);
  const hasMicroInteractions = /\b(transition|transform|animate-|animation|hover:|focus:|active:|group-hover:)/.test(content);
  const hasInteractiveProps = /\b(onClick|onClose|onSelect|onChange|onSubmit|onToggle)\b/.test(content);

  const isDynamic = hasHooks || hasEvents || hasMotion || hasMicroInteractions || hasInteractiveProps;

  if (!isDynamic && (content.includes('return (') || content.includes('return <'))) {
    issues.push(`Component appears entirely static without state, event handlers, or micro-interactions.`);
    score -= 15;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues
  };
}

function analyzeDynamics(files) {
  let totalScore = 0;
  let totalFiles = 0;
  const allIssues = [];

  for (const file of files) {
    if (!isUiFile(file)) continue;
    if (!file.endsWith('.jsx') && !file.endsWith('.tsx') && !file.endsWith('.css')) continue;
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.trim().length === 0) continue;
      
      const { score, issues } = scanForDynamics(content);
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
    dynamicScore: totalFiles > 0 ? Math.round(totalScore / totalFiles) : 100,
    issues: allIssues
  };
}

module.exports = {
  scanForDynamics,
  analyzeDynamics
};
