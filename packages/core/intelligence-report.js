const { walkCodeFiles } = require('./file-walker.js');
const { analyzeResponsiveness } = require('./responsive-scanner.js');
const { analyzeDynamics } = require('./dynamic-scanner.js');
const { analyzePerformance } = require('./performance-scanner.js');
const { analyzeA11y } = require('./a11y-scanner.js');
const { scanSecurity } = require('./security-scanner.js');
const { buildSurgicalFixPrompt } = require('./prompt-generator.js');

function calculateGrade(averageScore) {
  if (averageScore >= 95) return 'A+';
  if (averageScore >= 90) return 'A';
  if (averageScore >= 80) return 'B';
  if (averageScore >= 70) return 'C';
  return 'D';
}

function generatePrompt(issueType, issueText, file = 'Project file', line = 'N/A') {
  const guidanceMap = {
    responsive: 'Replace hardcoded pixels with fluid units (rem, clamp, %)',
    dynamic: 'Add subtle micro-interactions or motion states to static UI',
    performance: 'Implement memoization, code-splitting, or optimize imports',
    security: 'Remediate security vulnerability and sanitize inputs',
    a11y: 'Add missing ARIA attributes, semantic roles, or keyboard navigation'
  };

  return buildSurgicalFixPrompt({
    file,
    line,
    severity: issueType === 'security' ? 'critical' : 'warning',
    type: issueType,
    message: issueText,
    guidance: guidanceMap[issueType] || 'Resolve diagnostic issue'
  });
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

  responsive.issues.forEach(item => {
    item.issues.forEach(msg => allIssues.push({ type: 'responsive', file: item.file, message: msg, prompt: generatePrompt('responsive', msg, item.file) }));
  });
  dynamic.issues.forEach(item => {
    item.issues.forEach(msg => allIssues.push({ type: 'dynamic', file: item.file, message: msg, prompt: generatePrompt('dynamic', msg, item.file) }));
  });
  performance.issues.forEach(item => {
    item.issues.forEach(msg => allIssues.push({ type: 'performance', file: item.file, message: msg, prompt: generatePrompt('performance', msg, item.file) }));
  });
  a11y.issues.forEach(item => {
    item.issues.forEach(msg => allIssues.push({ type: 'a11y', file: item.file, message: msg, prompt: generatePrompt('a11y', msg, item.file) }));
  });
  security.issues.forEach(item => {
    allIssues.push({ type: 'security', file: item.file, line: item.line, message: item.msg, prompt: generatePrompt('security', item.msg, item.file, item.line) });
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
