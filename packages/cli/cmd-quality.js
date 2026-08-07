const path = require('path');
const { log, colors, getProgressBar } = require('./colors.js');

function qualityCommand(args) {
  const projectPath = process.cwd();
  let generateQualityReport;
  try {
    generateQualityReport = require('../core/quality-report.js').generateQualityReport;
  } catch {
    const altPath = path.resolve(__dirname, '..', 'core', 'quality-report.js');
    generateQualityReport = require(altPath).generateQualityReport;
  }

  const isJson = args && args.includes('--json');
  const result = generateQualityReport(projectPath);

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const scoreColor = result.score >= 90 ? colors.green : result.score >= 60 ? colors.yellow : colors.red;
  console.log(`\n${colors.bright}${colors.cyan}┌${'─'.repeat(54)}┐`);
  console.log(`│   🏛️  Code Quality Report                            │`);
  console.log(`└${'─'.repeat(54)}┘${colors.reset}\n`);

  console.log(`  Score: ${scoreColor}${colors.bright}${result.score}/100${colors.reset} ${getProgressBar(result.score, 20)}`);
  console.log(`  Files: ${result.breakdown.totalFiles} | Dirs: ${result.breakdown.totalDirs}\n`);

  const b = result.breakdown;
  console.log(`${colors.bright}  Breakdown:${colors.reset}`);
  console.log(`    Structure Issues: ${b.structureIssues === 0 ? colors.green + '0 ✅' : colors.yellow + b.structureIssues + ' ⚠️'}${colors.reset}`);
  console.log(`    Naming Issues:   ${b.namingIssues === 0 ? colors.green + '0 ✅' : colors.yellow + b.namingIssues + ' ⚠️'}${colors.reset}`);
  console.log(`    Hygiene Issues:  ${b.hygieneIssues === 0 ? colors.green + '0 ✅' : colors.yellow + b.hygieneIssues + ' ⚠️'}${colors.reset}`);

  if (result.issues.length > 0) {
    console.log(`\n${colors.bright}  Issues (${result.issues.length}):${colors.reset}`);
    const shown = result.issues.slice(0, 15);
    for (const issue of shown) {
      const short = issue.file ? path.relative(projectPath, issue.file) : 'unknown';
      const lineInfo = issue.line ? `:${issue.line}` : '';
      const catLabel = issue.category ? `[${issue.category}]` : '';
      console.log(`    ${colors.yellow}•${colors.reset} ${catLabel} ${short}${lineInfo} — ${issue.msg}`);
    }
    if (result.issues.length > 15) {
      console.log(`    ${colors.dim}... and ${result.issues.length - 15} more${colors.reset}`);
    }
  }

  console.log(`\n  ${result.passed ? colors.green + '✅ QUALITY OK' : colors.yellow + '⚠️ NEEDS CLEANUP'}${colors.reset}\n`);
}

module.exports = { qualityCommand };
