const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m',
  bgCyan: '\x1b[46m\x1b[30m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✔ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.red}✘ ${msg}${colors.reset}`),
  header: (msg) => {
    console.log(`\n${colors.bright}${colors.cyan}┌${'─'.repeat(54)}┐`);
    console.log(`│ ${msg.toUpperCase().padEnd(52)} │`);
    console.log(`└${'─'.repeat(54)}┘${colors.reset}\n`);
  }
};

function getProgressBar(pct, size = 15) {
  const filled = Math.round((pct / 100) * size);
  return `[${colors.green}${"█".repeat(filled)}${colors.reset}${"░".repeat(size - filled)}]`;
}

module.exports = {
  colors,
  log,
  getProgressBar
};
