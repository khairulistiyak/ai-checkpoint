import { execFileSync } from 'child_process';
import os from 'os';
import path from 'path';

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
    `${homeDir}/.nvm/versions/node/current/bin`,
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
  try {
    return execFileSync(command, args, {
      cwd: cwd,
      encoding: 'utf8',
      timeout: 15000,
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
