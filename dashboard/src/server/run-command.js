import { execFileSync } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

function findNvmBin(homeDir) {
  const nvmDir = path.join(homeDir, '.nvm', 'versions', 'node');
  try {
    if (!fs.existsSync(nvmDir)) return '';
    const versions = fs.readdirSync(nvmDir).filter(v => v.startsWith('v')).sort().reverse();
    return versions.length > 0 ? path.join(nvmDir, versions[0], 'bin') : '';
  } catch { return ''; }
}

function getAugmentedEnv() {
  const homeDir = os.homedir();
  const isWin = process.platform === 'win32';

  const extraPaths = isWin ? [
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs'),
    path.join(homeDir, 'AppData', 'Roaming', 'npm'),
    path.join(homeDir, '.cargo', 'bin')
  ] : [
    '/opt/homebrew/bin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    '/usr/sbin',
    '/sbin',
    findNvmBin(homeDir),
    `${homeDir}/.cargo/bin`
  ];

  const currentPath = process.env.PATH || '';
  const delimiter = path.delimiter;
  const currentArray = currentPath.split(delimiter);
  const newPath = [...extraPaths, ...currentArray].filter(Boolean).join(delimiter);

  return {
    ...process.env,
    PATH: newPath
  };
}

export function runCommand(command, args, cwd) {
  if (command === './l' || command === 'l') {
    const enginePath = path.join(os.homedir(), '.ai-checkpoint', 'engine.bin.js');
    if (fs.existsSync(enginePath)) {
      command = 'node';
      args = [enginePath, ...args];
    } else {
      console.warn('⚠️ Global Engine not found, falling back to local ./l script');
    }
  }

  try {
    return execFileSync(command, args, {
      cwd: cwd,
      encoding: 'utf8',
      timeout: 60000,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      env: getAugmentedEnv()
    });
  } catch (err) {
    if (err.stdout) err.message += `\nStdout: ${err.stdout}`;
    if (err.stderr) err.message += `\nStderr: ${err.stderr}`;
    throw err;
  }
}
