const { walkCodeFiles } = require('./file-walker.js');
const { analyzeResponsiveness } = require('./responsive-scanner.js');
const { analyzeDynamics } = require('./dynamic-scanner.js');
const { analyzePerformance } = require('./performance-scanner.js');
const { analyzeA11y } = require('./a11y-scanner.js');
const { scanSecurity } = require('./security-scanner.js');
const { buildSurgicalFixPrompt } = require('./prompt-generator.js');

const GUIDANCE_MAP = {
  responsive: 'Replace hardcoded pixels with fluid units (rem, clamp, %)',
  dynamic: 'Add subtle micro-interactions or motion states to static UI',
  performance: 'Implement memoization, code-splitting, or optimize imports',
  security: 'Remediate security vulnerability and sanitize inputs',
  a11y: 'Add missing ARIA attributes, semantic roles, or keyboard navigation'
};

function calculateGrade(averageScore) {
  if (averageScore >= 95) return 'A+';
  if (averageScore >= 90) return 'A';
  if (averageScore >= 80) return 'B';
  if (averageScore >= 70) return 'C';
  return 'D';
}

function generatePrompt(issueType, issueText, file = 'Project file', line = 'N/A', guidance = '') {
  return buildSurgicalFixPrompt({
    file,
    line,
    severity: issueType === 'security' ? 'critical' : 'warning',
    type: issueType,
    message: issueText,
    guidance: guidance || GUIDANCE_MAP[issueType] || 'Resolve diagnostic issue'
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

  const addIssue = (type, file, msg, line = 'N/A') => {
    const guidance = GUIDANCE_MAP[type] || 'Resolve diagnostic issue';
    allIssues.push({
      type,
      file,
      line,
      message: msg,
      guidance,
      prompt: generatePrompt(type, msg, file, line, guidance)
    });
  };

  responsive.issues.forEach(item => item.issues.forEach(msg => addIssue('responsive', item.file, msg)));
  dynamic.issues.forEach(item => item.issues.forEach(msg => addIssue('dynamic', item.file, msg)));
  performance.issues.forEach(item => item.issues.forEach(msg => addIssue('performance', item.file, msg)));
  a11y.issues.forEach(item => item.issues.forEach(msg => addIssue('a11y', item.file, msg)));
  security.issues.forEach(item => addIssue('security', item.file, item.msg, item.line));

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
