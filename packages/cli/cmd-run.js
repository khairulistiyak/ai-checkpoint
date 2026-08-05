const path = require('path');
const { spawnSync } = require('child_process');
const { colors, log } = require('./colors.js');
const { detectProjectRunConfig } = require('../core/run-config.js');

function listRunCommands(rootDir) {
  const config = detectProjectRunConfig(rootDir);
  const all = [...config.commands, ...config.customCommands];

  console.log(`\n${colors.bright}${colors.cyan}┌${'─'.repeat(58)}┐`);
  console.log(`│   PROJECT RUN COMMANDS & EXECUTION DIRECTORIES           │`);
  console.log(`└${'─'.repeat(58)}┘${colors.reset}\n`);
  console.log(`${colors.dim}Project Root:${colors.reset} ${colors.green}${config.projectPath}${colors.reset}\n`);

  if (all.length === 0) {
    console.log(`${colors.yellow}No run scripts detected in project.${colors.reset}\n`);
    return;
  }

  const categoryOrder = ['dev', 'test', 'build', 'lint', 'checkpoint', 'custom'];
  for (const cat of categoryOrder) {
    const items = all.filter(c => c.category === cat);
    if (items.length === 0) continue;

    console.log(`${colors.bright}${colors.magenta}▶ [${cat.toUpperCase()}]${colors.reset}`);
    for (const item of items) {
      const cwdStr = item.cwd && item.cwd !== '.' ? `${colors.dim}(cwd: ${item.cwd})${colors.reset}` : '';
      console.log(`  ${colors.bright}${colors.green}${item.name.padEnd(20)}${colors.reset} ${item.cmd.padEnd(24)} ${cwdStr}`);
    }
    console.log('');
  }

  console.log(`${colors.dim}Run a command via:${colors.reset} ${colors.cyan}./l run <name>${colors.reset}\n`);
}

function runProjectCommand(name, extraArgs = []) {
  const rootDir = process.cwd();
  if (!name || name === 'list' || name === '--list' || name === '-l') {
    listRunCommands(rootDir);
    return;
  }

  const config = detectProjectRunConfig(rootDir);
  const all = [...config.commands, ...config.customCommands];
  const target = all.find(c => c.name === name || c.id === name || c.cmd === name);

  if (!target) {
    log.error(`Command "${name}" not found.`);
    console.log(`${colors.dim}Available commands:${colors.reset} ${all.map(c => colors.green + c.name + colors.reset).join(', ')}\n`);
    process.exit(1);
  }

  const execCwd = target.cwd && target.cwd !== '.' ? path.resolve(rootDir, target.cwd) : rootDir;
  console.log(`\n${colors.cyan}🚀 Executing:${colors.reset} ${colors.bright}${target.cmd}${colors.reset}`);
  console.log(`${colors.dim}📁 Working Dir:${colors.reset} ${execCwd}\n`);

  const fullCmd = extraArgs.length > 0 ? `${target.cmd} ${extraArgs.join(' ')}` : target.cmd;
  const result = spawnSync(fullCmd, {
    cwd: execCwd,
    shell: true,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

module.exports = { runProjectCommand, listRunCommands };
