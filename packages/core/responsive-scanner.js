const fs = require('fs');
const path = require('path');

const NON_UI_SEGMENTS = [
  '/packages/cli/',
  '/packages/core/',
  '/electron/',
  '/dashboard/src/server/',
  '/scripts/',
  'tailwind.config.',
  'postcss.config.',
  'vite.config.',
  '.test.',
  '.spec.'
];

function isUiFile(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  if (NON_UI_SEGMENTS.some(seg => norm.includes(seg))) return false;

  const ext = path.extname(norm).toLowerCase();
  if (['.jsx', '.tsx', '.vue', '.svelte', '.css', '.scss', '.html'].includes(ext)) {
    return true;
  }
  if (ext === '.js' && (norm.includes('/components/') || norm.includes('/pages/') || norm.includes('/views/'))) {
    return true;
  }
  return false;
}

function scanForResponsive(content) {
  let score = 100;
  const issues = [];
  
  if (!content.includes('className') && !content.includes('class=') && !content.includes('style=') && !content.includes('{')) {
    return { score: 100, issues: [] };
  }

  // Detect arbitrary fixed pixel dimensions like w-[400px], min-h-[220px], max-w-[600px] (>1px)
  const arbitraryDimRegex = /\b(?:w|h|min-w|min-h|max-w|max-h|top|bottom|left|right|gap|p|m|px|py|pl|pr|pt|pb|mx|my|ml|mr|mt|mb)-\[(\d+)px\]/g;
  const arbitraryMatches = [...content.matchAll(arbitraryDimRegex)].filter(m => parseInt(m[1], 10) > 1);

  // Detect inline style hardcoded px like style={{ width: '400px' }}
  const inlinePxRegex = /style=\{\{[^}]*\b(width|height|margin|padding|fontSize|minHeight|maxHeight|maxWidth|minWidth)\s*:\s*['"]?(\d+)px['"]?/g;
  const inlineMatches = [...content.matchAll(inlinePxRegex)].filter(m => parseInt(m[2], 10) > 1);

  const totalHardcoded = arbitraryMatches.length + inlineMatches.length;

  if (totalHardcoded > 0) {
    const deduction = Math.min(totalHardcoded * 5, 30);
    score -= deduction;
    const exampleVal = arbitraryMatches[0]?.[1] || inlineMatches[0]?.[2];
    issues.push(`Found ${totalHardcoded} hardcoded pixel dimensions (e.g. [${exampleVal}px]). Use rem, vw/vh, or clamp() instead.`);
  }

  const hasClamp = /clamp\(/i.test(content);
  const hasViewport = /\d+(vw|vh)/i.test(content);
  const hasRem = /\d+(\.\d+)?rem/i.test(content);
  const hasTailwindFluid = /\b(text-(xs|sm|base|lg|xl|2xl|3xl|4xl)|p-\d|m-\d|w-\d|h-\d|gap-\d|rounded-)/.test(content);

  if (!hasClamp && !hasViewport && !hasRem && !hasTailwindFluid && content.includes('{') && (content.includes('className') || content.includes('style='))) {
    issues.push(`No fluid typography or scalable units (rem, vw, clamp) found.`);
    score -= 10;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues
  };
}

function analyzeResponsiveness(files) {
  let totalScore = 0;
  let totalFiles = 0;
  const allIssues = [];

  for (const file of files) {
    if (!isUiFile(file)) continue;
    
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
  isUiFile,
  scanForResponsive,
  analyzeResponsiveness
};
