import fs from 'fs';
import path from 'path';
import { getSettings } from './settings.js';
import { runCommand } from './run-command.js';
import * as globalStore from './global-store.js';

function handleRawInput(rawInput, runL, cwd) {
  const parts = rawInput.trim().split(/\s+/);
  const bin = parts[0];
  const args = parts.slice(1);

  if (bin === './l' || bin === 'l' || bin === 'aic') return runL(args);
  if (bin === 'bash' && args[0]?.startsWith('tests/')) return runCommand('bash', args, cwd);
  if (bin === 'npm' && (args[0] === 'test' || args[0] === 'run' || args[0] === 'build')) {
    return runCommand('npm', args, cwd);
  }
  return runL(parts);
}

function handleStepCommand(command, step, safeMessage, runL) {
  if (!step || !/^\d+\.\d+$/.test(step)) {
    throw new Error('Invalid step format. Use X.Y');
  }
  return command === 'start' ? runL(['start', step]) : runL(['c', step, safeMessage]);
}

function handleStandardCommand(command, step, safeMessage, runL, cwd) {
  if (command === 'start' || command === 'complete' || command === 'c') {
    return handleStepCommand(command, step, safeMessage, runL);
  }
  if (['sync', 'status', 'quality', 'health', 'lint-plan'].includes(command)) {
    return runL([command]);
  }
  if (command === 'checkpoint') {
    return runL(step ? ['checkpoint', step] : ['checkpoint']);
  }
  if (command === 'cleanup-verify') {
    const script = path.join(cwd, 'tests', 'cleanup-verify.sh');
    return fs.existsSync(script) ? runCommand('bash', ['tests/cleanup-verify.sh'], cwd) : runL(['status']);
  }
  return runL([command]);
}

export function handleCommand(req, res) {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const { command, step, message, rawInput } = req.body;
  const cwd = project.path;

  try {
    const safeMessage = (message || 'Completed via Dashboard').replace(/[\x00-\x1f]/g, '').slice(0, 200);
    const enginePath = globalStore.getGlobalEnginePath();
    const runL = (args) => fs.existsSync(enginePath) ? runCommand('node', [enginePath, ...args], cwd) : runCommand('./l', args, cwd);

    const output = (rawInput && typeof rawInput === 'string' && rawInput.trim())
      ? handleRawInput(rawInput, runL, cwd)
      : handleStandardCommand(command, step, safeMessage, runL, cwd);

    const cleanOutput = typeof output === 'string'
      ? output.replace(/\x1b\[[0-9;]*m/g, '').trim()
      : 'Command executed successfully';

    res.json({ success: true, output: cleanOutput });
  } catch (e) {
    const rawError = e.stdout?.toString() || e.stderr?.toString() || e.message || 'Command execution failed';
    res.status(400).json({ error: rawError.replace(/\x1b\[[0-9;]*m/g, '').trim() });
  }
}
