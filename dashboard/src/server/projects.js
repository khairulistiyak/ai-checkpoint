import express from 'express';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { getSettings } from './settings.js';
import { parseProgress } from './parser.js';

const router = express.Router();

function enrichProject(p) {
  try {
    if (!p || !p.path || !fs.existsSync(p.path)) {
      return { ...p, isInstalled: false, progress: null, hasPlanFiles: false };
    }
    const isInstalled = fs.existsSync(path.join(p.path, '.agents', 'PROGRESS.md'));
    let progress = null;
    let hasPlanFiles = false;
    if (isInstalled) {
      progress = parseProgress(p.path);
      const planDir = path.join(p.path, 'plan');
      if (fs.existsSync(planDir)) {
        hasPlanFiles = fs.readdirSync(planDir).some(f => f.endsWith('.md') && !f.startsWith('.') && fs.statSync(path.join(planDir, f)).isFile());
      }
    }
    return { ...p, isInstalled, progress, hasPlanFiles };
  } catch (e) {
    console.error(`⚠️ Error enriching project ${p?.path}:`, e.message);
    return { ...p, isInstalled: false, progress: null, hasPlanFiles: false };
  }
}

router.get('/', (req, res) => {
  try {
    const settings = getSettings();
    res.json(settings.projects.map(enrichProject));
  } catch (e) {
    console.error('⚠️ Error fetching projects list:', e.message);
    res.json([]);
  }
});

router.get('/:id', (req, res) => {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(enrichProject(project));
  } catch (e) {
    console.error(`⚠️ Error fetching project ${req.params.id}:`, e.message);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.post('/:id/install', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const aiCheckpointRoot = path.resolve(process.cwd(), '..');
  const templatesDir = path.join(aiCheckpointRoot, 'templates');
  const scriptsDir = path.join(aiCheckpointRoot, 'scripts');
  const projectDir = project.path;

  try {
    fs.mkdirSync(path.join(projectDir, '.agents', 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(projectDir, 'plan', 'drafts'), { recursive: true });

    const ledgerSrc = path.join(scriptsDir, 'ledger.cjs');
    if (fs.existsSync(ledgerSrc)) {
      fs.copyFileSync(ledgerSrc, path.join(projectDir, '.agents', 'scripts', 'ledger.cjs'));
    }

    const lScript = '#!/bin/bash\nnode .agents/scripts/ledger.cjs "$@"\n';
    fs.writeFileSync(path.join(projectDir, 'l'), lScript, { mode: 0o755 });

    const filesToCopy = [
      { src: 'AGENTS.md',       dest: path.join('.agents', 'AGENTS.md') },
      { src: 'PROGRESS.md',     dest: path.join('.agents', 'PROGRESS.md') },
      { src: 'RULES.md',        dest: path.join('.agents', 'RULES.md') },
      { src: 'SYSTEM_GUIDE.md', dest: path.join('.agents', 'SYSTEM_GUIDE.md') },
      { src: 'drafts-README.md', dest: path.join('plan', 'drafts', 'README.md') },
    ];

    for (const f of filesToCopy) {
      const destPath = path.join(projectDir, f.dest);
      const srcPath = path.join(templatesDir, f.src);
      if (!fs.existsSync(destPath) && fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to install' });
  }
});

router.get('/:id/health', (req, res) => {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });

    const cwd = project.path;
    const checks = [
      { name: '.agents directory', passed: fs.existsSync(path.join(cwd, '.agents')) },
      { name: 'PROGRESS.md', passed: fs.existsSync(path.join(cwd, '.agents', 'PROGRESS.md')) },
      { name: 'RULES.md', passed: fs.existsSync(path.join(cwd, '.agents', 'RULES.md')) },
      { name: 'AGENTS.md', passed: fs.existsSync(path.join(cwd, '.agents', 'AGENTS.md')) },
      { name: 'plan directory', passed: fs.existsSync(path.join(cwd, 'plan')) },
      { name: 'git repository', passed: fs.existsSync(path.join(cwd, '.git')) }
    ];
    res.json({ checks, allPassed: checks.every(c => c.passed) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id/checkpoints', (req, res) => {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });

    const out = execSync('git log --pretty=format:"%h|%s|%ar|%an" | grep -iE "aicp/|checkpoint:" || true', { cwd: project.path, stdio: 'pipe' }).toString();
    if (!out.trim()) return res.json([]);

    const checkpoints = out.trim().split('\n').map(line => {
      const [hash, message, timeAgo, author] = line.trim().split('|');
      return { hash, message, timeAgo, author };
    });
    res.json(checkpoints);
  } catch (e) {
    res.json([]);
  }
});

router.post('/:id/rollback', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const { hash } = req.body;
  if (!hash) return res.status(400).json({ error: 'Hash required' });
  if (!/^[a-f0-9]{4,40}$/i.test(hash)) return res.status(400).json({ error: 'Invalid hash format' });

  try {
    execSync(`git reset --hard ${hash}`, { cwd: project.path });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/command', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const { command, step, message } = req.body;
  const cwd = project.path;

  try {
    if (!/^\d+\.\d+$/.test(step)) return res.status(400).json({ error: 'Invalid step format. Use X.Y' });
    const safeMessage = (message || 'Completed via Dashboard').replace(/["`$\\]/g, '');
    if (command === 'start') {
      execSync(`./l start ${step}`, { cwd });
    } else if (command === 'complete') {
      execSync(`./l c ${step} "${safeMessage}"`, { cwd });
    } else {
      return res.status(400).json({ error: 'Invalid command' });
    }
    res.json({ success: true });
  } catch (e) {
    let errorMessage = 'Command execution failed';
    if (e.stdout && e.stdout.toString().trim()) {
      const lines = e.stdout.toString().trim().split('\n');
      errorMessage = lines[lines.length - 1].replace(/\x1b\[[0-9;]*m/g, '').trim();
    } else if (e.stderr && e.stderr.toString().trim()) {
      errorMessage = e.stderr.toString().trim();
    } else if (e.message) {
      errorMessage = e.message;
    }
    // Return HTTP 400 for user execution/validation errors instead of crashing server with 500
    res.status(400).json({ error: errorMessage });
  }
});

export default router;
