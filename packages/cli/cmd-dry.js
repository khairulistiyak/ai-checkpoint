const path = require('path');
const { colors: c, getProgressBar } = require('./colors.js');
const { detectDuplicates, buildUtilityIndex, searchUtility, generateRefactorProposal } = require('../core/index.js');

function printDryHeader() {
  console.log(`\n${c.bright}┌────────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.bright}│  DRY Guardian — Code Redundancy Prevention Engine      │${c.reset}`);
  console.log(`${c.bright}└────────────────────────────────────────────────────────┘${c.reset}\n`);
}

function dryCommand(args = []) {
  const isJson = args.includes('--json');
  const showDiff = args.includes('--diff');
  let threshold = 0.75;
  const thIdx = args.indexOf('--threshold');
  if (thIdx !== -1 && args[thIdx + 1]) threshold = parseFloat(args[thIdx + 1]) / 100;

  const result = detectDuplicates(process.cwd(), { threshold });

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  printDryHeader();
  const bar = getProgressBar(result.dryScore, 20);
  const scoreColor = result.dryScore >= 90 ? c.green : result.dryScore >= 70 ? c.yellow : c.red;
  console.log(`  DRY Score: ${scoreColor}${c.bright}${result.dryScore}/100${c.reset}  ${bar}`);
  console.log(`  Scanned: ${c.cyan}${result.filesScanned}${c.reset} files | ${c.cyan}${result.functionsScanned}${c.reset} functions | ${scoreColor}${result.duplicatesCount}${c.reset} duplicate pairs\n`);

  if (result.duplicates.length === 0) {
    console.log(`  ${c.green}✔ Perfect DRY Compliance! No duplicate logic detected.${c.reset}\n`);
    return;
  }

  console.log(`${c.bright}  Detected Duplicate Logic:${c.reset}`);
  result.duplicates.forEach((dup, idx) => {
    const icon = dup.type === 'exact' ? `${c.red}≡${c.reset}` : `${c.yellow}≈${c.reset}`;
    const fileA = path.relative(process.cwd(), dup.funcA.file);
    const fileB = path.relative(process.cwd(), dup.funcB.file);
    console.log(`\n  ${idx + 1}. ${icon} ${c.bright}${dup.funcA.name}${c.reset} (${Math.round(dup.score * 100)}% match)`);
    console.log(`     ├─ ${c.gray}${fileA}:${dup.funcA.line}${c.reset}`);
    console.log(`     └─ ${c.gray}${fileB}:${dup.funcB.line}${c.reset}`);

    if (showDiff) {
      const proposal = generateRefactorProposal(dup);
      console.log(`     ${c.cyan}→ Suggestion:${c.reset} ${proposal.guidance}`);
      console.log(`       ${c.green}+ ${proposal.callerA.importSnippet}${c.reset}`);
    }
  });

  if (!showDiff && result.duplicates.length > 0) {
    console.log(`\n  ${c.gray}Tip: Run './l dry --diff' to see suggested shared utility extraction snippets.${c.reset}`);
  }
  console.log('');
}

function utilsCommand(args = []) {
  const isJson = args.includes('--json');
  const query = args.filter(a => !a.startsWith('--')).join(' ').trim();
  const index = buildUtilityIndex(process.cwd());
  const matches = searchUtility(index, query, { limit: 25 });

  if (isJson) {
    console.log(JSON.stringify(matches, null, 2));
    return;
  }

  console.log(`\n${c.bright}  Utility Function Registry (${matches.length} matches for "${query || '*'}"):${c.reset}\n`);
  if (matches.length === 0) {
    console.log(`  ${c.yellow}No matching utilities found in workspace.${c.reset}\n`);
    return;
  }

  matches.forEach(item => {
    const expBadge = item.exported ? `${c.green}[export]${c.reset}` : `${c.gray}[local]${c.reset}`;
    console.log(`  ${c.cyan}${item.name}${c.reset}(${item.params}) ${expBadge}`);
    console.log(`    ${c.gray}${item.file}:${item.line}${c.reset} ${item.docSummary ? '— ' + item.docSummary : ''}`);
  });
  console.log('');
}

module.exports = { dryCommand, utilsCommand };
