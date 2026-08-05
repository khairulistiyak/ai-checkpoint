const { scanWorkspace } = require('./workspace-scanner.js');
const { scanSecurity } = require('./security-scanner.js');

function calculateHealth(projectPath, options = {}) {
  const workspace = scanWorkspace(projectPath);
  const security = scanSecurity(projectPath);

  const syntaxErrors = workspace.issues.filter(i => i.type === 'syntax').length;
  const brokenImports = workspace.issues.filter(i => i.type === 'broken-import').length;
  const rule0Violations = workspace.issues.filter(i => i.type === 'rule0').length;
  const criticalSecurity = security.issues.filter(i => i.severity === 'critical').length;
  const warningSecurity = security.issues.filter(i => i.severity === 'warning').length;

  let score = 100;
  score -= syntaxErrors * 10;
  score -= brokenImports * 5;
  score -= rule0Violations * 8;
  score -= criticalSecurity * 15;
  score -= warningSecurity * 2;
  if (score < 0) score = 0;

  const allIssues = [
    ...workspace.issues.map(i => ({ ...i, file: i.file })),
    ...security.issues.map(i => ({ file: i.file, line: i.line, error: i.msg, type: 'security', severity: i.severity })),
  ];

  return {
    score,
    maxScore: 100,
    passed: score === 100,
    filesScanned: workspace.filesScanned,
    breakdown: { syntaxErrors, brokenImports, rule0Violations, criticalSecurity, warningSecurity },
    issues: allIssues,
  };
}

module.exports = { calculateHealth };
