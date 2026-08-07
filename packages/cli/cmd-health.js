const { log, colors, getProgressBar } = require('./colors.js');

function healthCommand(args) {
  const projectPath = process.cwd();
  let calculateHealth;
  try {
    calculateHealth = require('../core/health-score.js').calculateHealth;
  } catch {
    const altPath = require('path').resolve(__dirname, '..', 'core', 'health-score.js');
    calculateHealth = require(altPath).calculateHealth;
  }

  const isJson = args && args.includes('--json');
  const result = calculateHealth(projectPath);

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const scoreColor = result.score >= 90 ? colors.green : result.score >= 60 ? colors.yellow : colors.red;
  console.log(`\n${colors.bright}${colors.cyan}┌${'─'.repeat(54)}┐`);
  console.log(`│   🛡️  Project Health Report                          │`);
  console.log(`└${'─'.repeat(54)}┘${colors.reset}\n`);

  console.log(`  Score: ${scoreColor}${colors.bright}${result.score}/100${colors.reset} ${getProgressBar(result.score, 20)}`);
  console.log(`  Files Scanned: ${result.filesScanned}\n`);

  const b = result.breakdown;
  console.log(`${colors.bright}  Breakdown:${colors.reset}`);
  console.log(`    Syntax Errors:     ${b.syntaxErrors === 0 ? colors.green + '0 ✅' : colors.red + b.syntaxErrors + ' ❌'}${colors.reset}`);
  console.log(`    Broken Imports:    ${b.brokenImports === 0 ? colors.green + '0 ✅' : colors.red + b.brokenImports + ' ❌'}${colors.reset}`);
  console.log(`    Rule 0 Violations: ${b.rule0Violations === 0 ? colors.green + '0 ✅' : colors.yellow + b.rule0Violations + ' ⚠️'}${colors.reset}`);
  console.log(`    Critical Security: ${b.criticalSecurity === 0 ? colors.green + '0 ✅' : colors.red + b.criticalSecurity + ' 🔴'}${colors.reset}`);
  console.log(`    Security Warnings: ${b.warningSecurity === 0 ? colors.green + '0 ✅' : colors.yellow + b.warningSecurity + ' ⚠️'}${colors.reset}`);

  if (result.issues.length > 0) {
    console.log(`\n${colors.bright}  Issues (${result.issues.length}):${colors.reset}`);
    const shown = result.issues.slice(0, 15);
    for (const issue of shown) {
      const short = issue.file ? require('path').relative(projectPath, issue.file) : 'unknown';
      const lineInfo = issue.line ? `:${issue.line}` : '';
      console.log(`    ${colors.red}•${colors.reset} ${short}${lineInfo} — ${issue.error || issue.msg || issue.type}`);
    }
    if (result.issues.length > 15) {
      console.log(`    ${colors.dim}... and ${result.issues.length - 15} more${colors.reset}`);
    }
  }

  console.log(`\n  ${result.passed ? colors.green + '✅ HEALTHY' : colors.red + '❌ NEEDS ATTENTION'}${colors.reset}\n`);
}

module.exports = { healthCommand };
