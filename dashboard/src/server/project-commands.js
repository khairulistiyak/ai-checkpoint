import fs from 'fs';
import path from 'path';
import { getSettings } from './settings.js';
import { runCommand } from './run-command.js';
import * as globalStore from './global-store.js';

export function handleCommand(req, res) {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const { command, step, message, rawInput } = req.body;
  const cwd = project.path;

  try {
    let output = '';
    const safeMessage = (message || 'Completed via Dashboard').replace(/[\x00-\x1f]/g, '').slice(0, 200);

    const enginePath = globalStore.getGlobalEnginePath();
    const lBin = fs.existsSync(enginePath) ? enginePath : './l';
    const runL = (args) => fs.existsSync(enginePath) ? runCommand('node', [enginePath, ...args], cwd) : runCommand('./l', args, cwd);

    // If rawInput was typed by the developer in the interactive terminal
    if (rawInput && typeof rawInput === 'string' && rawInput.trim()) {
      const trimmed = rawInput.trim();
      const parts = trimmed.split(/\s+/);
      const bin = parts[0];
      const args = parts.slice(1);

      if (bin === './l' || bin === 'l' || bin === 'aic') {
        output = runL(args);
      } else if (bin === 'bash' && args[0]?.startsWith('tests/')) {
        output = runCommand('bash', args, cwd);
      } else if (bin === 'npm' && (args[0] === 'test' || args[0] === 'run' || args[0] === 'build')) {
        output = runCommand('npm', args, cwd);
      } else {
        // Default to routing through ledger CLI
        output = runL(parts);
      }
    } else if (command === 'start') {
      if (!step || !/^\d+\.\d+$/.test(step)) {
        return res.status(400).json({ error: 'Invalid step format. Use X.Y' });
      }
      output = runL(['start', step]);
    } else if (command === 'complete' || command === 'c') {
      if (!step || !/^\d+\.\d+$/.test(step)) {
        return res.status(400).json({ error: 'Invalid step format. Use X.Y' });
      }
      output = runL(['c', step, safeMessage]);
    } else if (command === 'sync') {
      output = runL(['sync']);
    } else if (command === 'status') {
      output = runL(['status']);
    } else if (command === 'quality') {
      output = runL(['quality']);
    } else if (command === 'health') {
      output = runL(['health']);
    } else if (command === 'lint-plan') {
      output = runL(['lint-plan']);
    } else if (command === 'checkpoint') {
      const cpArgs = step ? ['checkpoint', step] : ['checkpoint'];
      output = runL(cpArgs);
    } else if (command === 'cleanup-verify') {
      if (fs.existsSync(path.join(cwd, 'tests', 'cleanup-verify.sh'))) {
        output = runCommand('bash', ['tests/cleanup-verify.sh'], cwd);
      } else {
        output = runL(['status']);
      }
    } else {
      // Fallback: try executing command
      try {
        output = runL([command]);
      } catch (err) {
        return res.status(400).json({ error: `Command failed or unknown: ${command}` });
      }
    }

    const cleanOutput = typeof output === 'string'
      ? output.replace(/\x1b\[[0-9;]*m/g, '').trim()
      : 'Command executed successfully';

    res.json({ success: true, output: cleanOutput });
  } catch (e) {
    let errorMessage = 'Command execution failed';
    if (e.stdout && e.stdout.toString().trim()) {
      errorMessage = e.stdout.toString().trim().replace(/\x1b\[[0-9;]*m/g, '');
    } else if (e.stderr && e.stderr.toString().trim()) {
      errorMessage = e.stderr.toString().trim().replace(/\x1b\[[0-9;]*m/g, '');
    } else if (e.message) {
      errorMessage = e.message.replace(/\x1b\[[0-9;]*m/g, '');
    }
    res.status(400).json({ error: errorMessage });
  }
}
