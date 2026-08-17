const { walkCodeFiles } = require('./file-walker.js');
const { analyzeResponsiveness } = require('./responsive-scanner.js');
const { analyzeDynamics } = require('./dynamic-scanner.js');
const { analyzePerformance } = require('./performance-scanner.js');
const { analyzeA11y } = require('./a11y-scanner.js');
const { scanSecurity } = require('./security-scanner.js');

function calculateGrade(averageScore) {
  if (averageScore >= 95) return 'A+';
  if (averageScore >= 90) return 'A';
  if (averageScore >= 80) return 'B';
  if (averageScore >= 70) return 'C';
  return 'D';
}

function generatePrompt(issueType, issueText) {
  const base = `Refactor this code to meet World Top 1 Standards. `;
  if (issueType === 'responsive') return base + `Replace all hardcoded pixels with fluid units (rem, clamp, vw/vh) to ensure 100% responsiveness. Issue context: ${issueText}`;
  if (issueType === 'dynamic') return base + `Add dynamic micro-interactions (hover, transitions, animations) or state to this static component. Issue context: ${issueText}`;
  if (issueType === 'performance') return base + `Optimize performance by implementing React.lazy, memoization, or fixing heavy imports. Issue context: ${issueText}`;
  if (issueType === 'security') return base + `Fix the security vulnerability. Issue context: ${issueText}`;
  if (issueType === 'a11y') return base + `Improve accessibility by adding missing ARIA labels, roles, or alt texts. Issue context: ${issueText}`;
  return base + `Please fix: ${issueText}`;
}

function generateIntelligenceReport(projectPath) {
  const files = walkCodeFiles(projectPath).map(f => f.path);
  
  const responsive = analyzeResponsiveness(files);
  const dynamic = analyzeDynamics(files);
  const performance = analyzePerformance(files);
  const a11y = analyzeA11y(files);
  const security = scanSecurity(projectPath);

  const averageScore = Math.round((
    responsive.responsiveScore +
    dynamic.dynamicScore +
    performance.performanceScore +
    a11y.a11yScore +
    security.score
  ) / 5);

  const grade = calculateGrade(averageScore);

  const allIssues = [];

  // Map issues and generate prompts
  responsive.issues.forEach(item => {
    item.issues.forEach(msg => allIssues.push({ type: 'responsive', file: item.file, message: msg, prompt: generatePrompt('responsive', msg) }));
  });
  dynamic.issues.forEach(item => {
    item.issues.forEach(msg => allIssues.push({ type: 'dynamic', file: item.file, message: msg, prompt: generatePrompt('dynamic', msg) }));
  });
  performance.issues.forEach(item => {
    item.issues.forEach(msg => allIssues.push({ type: 'performance', file: item.file, message: msg, prompt: generatePrompt('performance', msg) }));
  });
  a11y.issues.forEach(item => {
    item.issues.forEach(msg => allIssues.push({ type: 'a11y', file: item.file, message: msg, prompt: generatePrompt('a11y', msg) }));
  });
  security.issues.forEach(item => {
    allIssues.push({ type: 'security', file: item.file, line: item.line, message: item.msg, prompt: generatePrompt('security', item.msg) });
  });

  return {
    grade,
    averageScore,
    scores: {
      responsive: responsive.responsiveScore,
      dynamic: dynamic.dynamicScore,
      performance: performance.performanceScore,
      a11y: a11y.a11yScore,
      security: security.score
    },
    issues: allIssues,
    timestamp: Date.now()
  };
}

module.exports = {
  generateIntelligenceReport
};
