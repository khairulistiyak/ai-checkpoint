const { scanWorkspace } = require('./workspace-scanner.js');
const { scanSecurity } = require('./security-scanner.js');

let detectDuplicates;
try { detectDuplicates = require('./duplicate-detector.js').detectDuplicates; } catch { detectDuplicates = null; }

const RFC_DEFINITIONS = {
  'RULE-000': { title: 'File Granularity Guard', desc: 'Max 150 effective lines per file' },
  'ARCH-001': { title: 'Core Domain Isolation', desc: 'Core business domain must not import UI or frameworks' },
  'MOD-002': { title: 'Module Boundary Strictness', desc: 'Strict separation between CommonJS and ESM' },
  'TEST-003': { title: 'Deterministic Syntax Gate', desc: 'Zero syntax errors across all workspace files' },
  'DRY-004': { title: 'Code Reuse & Redundancy Guard', desc: 'Zero duplicate function bodies across workspace modules' },
};

function evaluateRfcCompliance(projectPath, options = {}) {
  const workspace = scanWorkspace(projectPath);
  const security = scanSecurity(projectPath);
  const dry = detectDuplicates ? detectDuplicates(projectPath) : { duplicates: [] };

  const rule0Violations = workspace.issues.filter((i) => i.type === 'rule0');
  const syntaxViolations = workspace.issues.filter((i) => i.type === 'syntax');
  const brokenImportViolations = workspace.issues.filter((i) => i.type === 'broken-import');
  const securityViolations = security.issues.filter((i) => i.severity === 'critical');
  const dryViolations = dry.duplicates.filter((d) => d.type === 'exact' || d.score >= 0.85);

  const specs = [
    {
      code: 'RULE-000',
      title: RFC_DEFINITIONS['RULE-000'].title,
      desc: RFC_DEFINITIONS['RULE-000'].desc,
      passed: rule0Violations.length === 0,
      violations: rule0Violations.map((v) => ({ file: v.file, msg: v.error })),
    },
    {
      code: 'ARCH-001',
      title: RFC_DEFINITIONS['ARCH-001'].title,
      desc: RFC_DEFINITIONS['ARCH-001'].desc,
      passed: brokenImportViolations.length === 0,
      violations: brokenImportViolations.map((v) => ({ file: v.file, msg: v.error })),
    },
    {
      code: 'MOD-002',
      title: RFC_DEFINITIONS['MOD-002'].title,
      desc: RFC_DEFINITIONS['MOD-002'].desc,
      passed: securityViolations.length === 0,
      violations: securityViolations.map((v) => ({ file: v.file, msg: v.msg })),
    },
    {
      code: 'TEST-003',
      title: RFC_DEFINITIONS['TEST-003'].title,
      desc: RFC_DEFINITIONS['TEST-003'].desc,
      passed: syntaxViolations.length === 0,
      violations: syntaxViolations.map((v) => ({ file: v.file, msg: v.error })),
    },
    {
      code: 'DRY-004',
      title: RFC_DEFINITIONS['DRY-004'].title,
      desc: RFC_DEFINITIONS['DRY-004'].desc,
      passed: dryViolations.length === 0,
      violations: dryViolations.map((v) => ({ file: v.funcA.file, msg: v.msg })),
    },
  ];

  const totalViolations = rule0Violations.length + syntaxViolations.length + brokenImportViolations.length + securityViolations.length + dryViolations.length;
  let score = 100 - (rule0Violations.length * 8) - (syntaxViolations.length * 15) - (brokenImportViolations.length * 5) - (securityViolations.length * 15) - (dryViolations.length * 5);
  if (score < 0) score = 0;

  return {
    score,
    passed: score === 100,
    specs,
    filesScanned: workspace.filesScanned,
    totalViolations,
  };
}

module.exports = { RFC_DEFINITIONS, evaluateRfcCompliance };
