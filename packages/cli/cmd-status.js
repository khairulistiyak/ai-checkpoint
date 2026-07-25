const { parseProgress } = require('./parse-progress.js');
const { checkFiles } = require('./validate.js');
const { log, colors, getProgressBar } = require('./colors.js');

function statusCommand() {
  checkFiles();
  const progress = parseProgress();
  const { phases, overall } = progress;
  
  if (process.argv.includes('--json')) {
    let nextStep = null;
    for (const p of phases) { const s = p.steps.find(st => st.status !== 'done' && st.status !== 'blocked'); if (s) { nextStep = s; break; } }
    console.log(JSON.stringify({ phases, overall, nextStep }, null, 2));
    process.exit(0);
  }

  let totalSteps = 0, doneSteps = 0;
  
  console.log(`\n${colors.bright}┌────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.bright}│ AI AGENT CHECKPOINT LEDGER                             │${colors.reset}`);
  console.log(`${colors.bright}└────────────────────────────────────────────────────────┘${colors.reset}\n`);

  phases.forEach(p => {
    const pDone = p.steps.filter(s => s.status === 'done').length;
    const pTotal = p.steps.length;
    totalSteps += pTotal;
    doneSteps += pDone;
    const pPct = pTotal === 0 ? 0 : Math.round((pDone / pTotal) * 100);
    
    console.log(`${colors.bright}Phase ${p.number}: ${p.name}${colors.reset}`);
    console.log(`${getProgressBar(pPct, 20)} ${pPct}% (${pDone}/${pTotal}) - ${pPct === 100 ? colors.green + 'COMPLETE' + colors.reset : colors.yellow + 'IN PROGRESS' + colors.reset}`);
    
    p.steps.forEach(s => {
      let icon = "⏳";
      let color = colors.dim;
      if (s.status === 'done') { icon = "✅"; color = colors.green; }
      else if (s.status === 'running') { icon = "🟡"; color = colors.yellow; }
      else if (s.status === 'blocked') { icon = "❌"; color = colors.red; }
      console.log(`  ${icon} ${color}Step ${s.number}: ${s.title}${colors.reset}`);
    });
    console.log('');
  });

  const oPct = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);
  console.log(`${colors.bright}OVERALL PROGRESS: ${colors.green}${oPct}%${colors.reset} ${getProgressBar(oPct, 30)} (${doneSteps}/${totalSteps})\n`);

  let nextStep = null;
  for (const p of phases) { const s = p.steps.find(st => st.status !== 'done' && st.status !== 'blocked'); if (s) { nextStep = s; break; } }
  
  if (nextStep) {
    console.log(`👉 ${colors.cyan}NEXT ACTIVE STEP:${colors.reset}`);
    console.log(`   Step ${nextStep.number}: ${nextStep.title}`);
    console.log(`   Run: ${colors.green}./l start ${nextStep.number}${colors.reset}`);
  } else {
    console.log(`🎉 ${colors.bgCyan} PROJECT COMPLETE! ${colors.reset}`);
  }
  console.log('');
}

module.exports = {
  statusCommand
};
