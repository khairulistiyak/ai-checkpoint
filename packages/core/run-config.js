import fs from 'fs';
import path from 'path';
import { detectEcosystemCommands } from './run-config-detect.js';

function categorizeCommand(name, script) {
  const n = name.toLowerCase();
  const s = (script || '').toLowerCase();
  if (n.includes('dev') || n.includes('serve') || n.includes('start') || s.includes('vite') || s.includes('nodemon') || s.includes('next dev')) return 'dev';
  if (n.includes('test') || n.includes('spec') || n.includes('bats') || s.includes('jest') || s.includes('mocha') || s.includes('vitest')) return 'test';
  if (n.includes('build') || n.includes('bundle') || n.includes('compile') || s.includes('tsc') || s.includes('webpack')) return 'build';
  if (n.includes('lint') || n.includes('check') || n.includes('format') || n.includes('validate') || n.includes('typecheck')) return 'lint';
  return 'custom';
}

function findWorkingDirectories(rootDir) {
  const dirs = [{ name: 'Root', path: rootDir, relPath: '.', isRoot: true }];
  try {
    const known = ['dashboard', 'frontend', 'backend', 'client', 'server', 'ui', 'api', 'web', 'mobile', 'packages', 'apps', 'services'];
    for (const rel of known) {
      const full = path.join(rootDir, rel);
      if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) continue;

      if (fs.existsSync(path.join(full, 'package.json'))) {
        dirs.push({ name: rel, path: full, relPath: rel, isRoot: false });
      } else if (['packages', 'apps', 'services'].includes(rel)) {
        const subs = fs.readdirSync(full);
        for (const sub of subs) {
          if (sub.startsWith('.') || sub.startsWith('._')) continue;
          const subFull = path.join(full, sub);
          if (fs.existsSync(subFull) && fs.statSync(subFull).isDirectory() && fs.existsSync(path.join(subFull, 'package.json'))) {
            dirs.push({ name: `${rel}/${sub}`, path: subFull, relPath: `${rel}/${sub}`, isRoot: false });
          }
        }
      }
    }
  } catch (e) {}
  return dirs;
}

export function detectProjectRunConfig(projectPath) {
  if (!projectPath || !fs.existsSync(projectPath)) {
    return { projectPath: projectPath || '', workingDirectories: [], commands: [], customCommands: [] };
  }

  const workingDirectories = findWorkingDirectories(projectPath);
  const commands = [];

  for (const dir of workingDirectories) {
    const pkgPath = path.join(dir.path, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const scripts = pkg.scripts || {};
        for (const [name, script] of Object.entries(scripts)) {
          const category = categorizeCommand(name, script);
          const cmdStr = `npm run ${name}`;
          const fullCmd = dir.isRoot ? cmdStr : `cd "${dir.relPath}" && ${cmdStr}`;
          commands.push({
            id: `${dir.relPath}-${name}`,
            name: dir.isRoot ? name : `${dir.name}: ${name}`,
            scriptName: name,
            category,
            cmd: cmdStr,
            fullCmd,
            cwd: dir.relPath,
            description: script,
            isDefault: category === 'dev' && (name === 'dev' || name === 'start')
          });
        }
      } catch (e) {}
    }
  }

  const ecosystemCmds = detectEcosystemCommands(projectPath);
  commands.push(...ecosystemCmds);

  if (fs.existsSync(path.join(projectPath, '.agents', 'scripts', 'ledger.cjs')) || fs.existsSync(path.join(projectPath, 'l'))) {
    commands.push({ id: 'cp-status', name: 'Ledger Status', scriptName: 'status', category: 'checkpoint', cmd: './l status', fullCmd: './l status', cwd: '.', description: 'Check active step and checkpoint progress', isDefault: false });
    commands.push({ id: 'cp-validate', name: 'Validate Project', scriptName: 'v', category: 'lint', cmd: './l v', fullCmd: './l v', cwd: '.', description: 'Run monorepo and rule validation checks', isDefault: false });
    commands.push({ id: 'cp-save', name: 'Save Checkpoint', scriptName: 'cp save', category: 'checkpoint', cmd: './l cp save "Checkpoint note"', fullCmd: './l cp save "Checkpoint note"', cwd: '.', description: 'Create a rollback checkpoint tag', isDefault: false });
  }

  let customCommands = [];
  const customConfigPath = path.join(projectPath, '.agents', 'run-config.json');
  if (fs.existsSync(customConfigPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(customConfigPath, 'utf8'));
      if (Array.isArray(data.customCommands)) customCommands = data.customCommands;
    } catch (e) {}
  }

  return { projectPath, workingDirectories, commands, customCommands };
}

export function saveCustomRunConfig(projectPath, config) {
  if (!projectPath || !fs.existsSync(projectPath)) return false;
  try {
    const agentsDir = path.join(projectPath, '.agents');
    if (!fs.existsSync(agentsDir)) fs.mkdirSync(agentsDir, { recursive: true });
    const customConfigPath = path.join(agentsDir, 'run-config.json');
    fs.writeFileSync(customConfigPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

export default { detectProjectRunConfig, saveCustomRunConfig };
