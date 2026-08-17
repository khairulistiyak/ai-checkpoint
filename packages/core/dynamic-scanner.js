const fs = require('fs');

/**
 * Scans a file's content for dynamic styling and interactions.
 * Checks for useState, useEffect, onClick, onHover, animations, transitions.
 * 
 * @param {string} content 
 * @returns {object} { score: number, issues: string[] }
 */
function scanForDynamics(content) {
  let score = 100;
  const issues = [];
  
  // Basic tokenization/regex mapping for dynamics
  const stateRegex = /useState|useReducer/g;
  const effectRegex = /useEffect|useLayoutEffect/g;
  const eventRegex = /onClick=|onChange=|onSubmit=|onMouseEnter=|onMouseLeave=|onKeyDown=/g;
  const microInteractionRegex = /transition|transform|animation|hover:|focus:|active:/g;
  
  const hasState = stateRegex.test(content);
  const hasEffect = effectRegex.test(content);
  const hasEvents = eventRegex.test(content);
  const hasMicroInteractions = microInteractionRegex.test(content);
  
  // If it's a JSX/TSX component but completely static
  if (content.includes('import React') || content.includes('export const') || content.includes('export default function')) {
    if (!hasState && !hasEffect && !hasEvents) {
      issues.push(`Component appears entirely static. No state, effects, or event handlers detected.`);
      score -= 20;
    }
    if (!hasMicroInteractions && (content.includes('className=') || content.includes('style='))) {
      issues.push(`No micro-interactions (hover, transitions, animations) found in styling.`);
      score -= 15;
    }
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    issues
  };
}

/**
 * Scans multiple files and returns an aggregated dynamic score.
 * 
 * @param {string[]} files Array of absolute file paths
 * @returns {object}
 */
function analyzeDynamics(files) {
  let totalScore = 0;
  let totalFiles = 0;
  const allIssues = [];

  for (const file of files) {
    if (!file.endsWith('.jsx') && !file.endsWith('.tsx') && !file.endsWith('.js') && !file.endsWith('.css') && !file.endsWith('.scss')) {
      continue;
    }
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.trim().length === 0) continue;
      
      const { score, issues } = scanForDynamics(content);
      
      // Only average files that are React components or stylesheets
      if (file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.css')) {
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
    dynamicScore: totalFiles > 0 ? Math.round(totalScore / totalFiles) : 100,
    issues: allIssues
  };
}

module.exports = {
  scanForDynamics,
  analyzeDynamics
};
