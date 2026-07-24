import { execFileSync } from 'child_process';

export function runCommand(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd: cwd,
      encoding: 'utf8',
      timeout: 15000,
      shell: false
    });
  } catch (err) {
    if (err.stdout) err.message += `\nStdout: ${err.stdout}`;
    if (err.stderr) err.message += `\nStderr: ${err.stderr}`;
    throw err;
  }
}
