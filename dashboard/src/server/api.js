import express from 'express';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';

const router = express.Router();

const SETTINGS_DIR = path.join(os.homedir(), '.ai-checkpoint-dashboard');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

// Ensure settings exist
function getSettings() {
  if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      version: 1,
      projects: [],
      preferences: { theme: 'dark', refreshInterval: 5000, language: 'en' }
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    return defaultSettings;
  }
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  } catch (e) {
    return { version: 1, projects: [], preferences: { theme: 'dark', refreshInterval: 5000 } };
  }
}

function saveSettings(settings) {
  if (!fs.existsSync(SETTINGS_DIR)) fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// Parse PROGRESS.md
function parseProgress(projectPath) {
  const progressFile = path.join(projectPath, '.agents', 'PROGRESS.md');
  if (!fs.existsSync(progressFile)) return null;

  const content = fs.readFileSync(progressFile, 'utf8');
  const lines = content.split(/\r?\n/);
  
  const phases = [];
  let currentPhase = null;
  let overall = { percentage: 0, completed: 0, total: 0 };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Overall progress
    const overallMatch = line.match(/\[(█+|░+)\]\s+(\d+)%\s+\((\d+)\/(\d+)/);
    if (overallMatch) {
      overall = {
        percentage: parseInt(overallMatch[2]),
        completed: parseInt(overallMatch[3]),
        total: parseInt(overallMatch[4])
      };
    }
    
    // Phase matching
    const phaseMatch = line.match(/^## (?:.*?)\s*Phase (\d+):\s*(.*?)\s*—\s*(.*)$/);
    if (phaseMatch) {
      if (currentPhase) phases.push(currentPhase);
      currentPhase = {
        number: parseInt(phaseMatch[1]),
        name: phaseMatch[2].trim(),
        statusText: phaseMatch[3].trim(),
        steps: []
      };
      continue;
    }
    
    // Step matching
    const stepMatch = line.match(/^\s*-\s*\[([ x!/~])\]\s*\*\*Step (\d+\.\d+)\*\*\s*—\s*(.*)$/);
    if (stepMatch && currentPhase) {
      currentPhase.steps.push({
        status: stepMatch[1] === 'x' ? 'done' : (stepMatch[1] === '/' || stepMatch[1] === '~') ? 'running' : stepMatch[1] === '!' ? 'blocked' : 'pending',
        number: stepMatch[2].trim(),
        title: stepMatch[3].trim()
      });
    }
  }
  if (currentPhase) phases.push(currentPhase);
  
  // Calculate phase percentages manually in case header is missing
  phases.forEach(p => {
    const done = p.steps.filter(s => s.status === 'done').length;
    p.percentage = p.steps.length > 0 ? Math.round((done / p.steps.length) * 100) : 0;
  });

  // Extract timeline (update log)
  const timeline = [];
  let inLog = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('UPDATE LOG:')) {
      inLog = true;
      continue;
    }
    if (inLog && lines[i].includes('-->')) {
      inLog = false;
      break;
    }
    if (inLog) {
      const line = lines[i].trim();
      if (line && !line.startsWith('UPDATE LOG:')) {
        // [2026-07-19 03:28] Step 1.1 completed — message | Agent: CLI
        const logMatch = line.match(/^\[(.*?)\]\s+(.*)$/);
        if (logMatch) {
          timeline.push({ time: logMatch[1], message: logMatch[2] });
        } else {
          timeline.push({ time: '', message: line });
        }
      }
    }
  }
  
  return { phases, overall, timeline };
}

// API Routes
router.get('/settings', (req, res) => {
  res.json(getSettings());
});

router.post('/settings/projects', (req, res) => {
  const { path: dirPath, name } = req.body;
  const settings = getSettings();
  
  // Check if exists
  if (settings.projects.find(p => p.path === dirPath)) {
    return res.status(400).json({ error: 'Project already exists' });
  }
  
  const newProject = {
    id: Date.now().toString(),
    path: dirPath,
    name: name || path.basename(dirPath),
    addedAt: new Date().toISOString()
  };
  
  settings.projects.push(newProject);
  saveSettings(settings);
  res.json(newProject);
});

router.delete('/settings/projects/:id', (req, res) => {
  const settings = getSettings();
  settings.projects = settings.projects.filter(p => p.id !== req.params.id);
  saveSettings(settings);
  res.json({ success: true });
});

router.put('/settings/projects/reorder', (req, res) => {
  const { projectIds } = req.body;
  const settings = getSettings();
  
  if (!Array.isArray(projectIds)) {
    return res.status(400).json({ error: 'projectIds must be an array' });
  }

  // Create a map for quick lookup
  const projectMap = new Map(settings.projects.map(p => [p.id, p]));
  
  // Reorder based on provided IDs
  const reorderedProjects = projectIds
    .map(id => projectMap.get(id))
    .filter(Boolean); // Filter out any missing projects
    
  // Append any projects that weren't in the provided array
  settings.projects.forEach(p => {
    if (!projectIds.includes(p.id)) {
      reorderedProjects.push(p);
    }
  });

  settings.projects = reorderedProjects;
  saveSettings(settings);
  res.json({ success: true });
});

router.get('/projects', (req, res) => {
  const settings = getSettings();
  const enriched = settings.projects.map(p => {
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
  });
  res.json(enriched);
});

router.get('/projects/:id', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  
  const isInstalled = fs.existsSync(path.join(project.path, '.agents', 'PROGRESS.md'));
  let progress = null;
  let hasPlanFiles = false;
  if (isInstalled) {
    progress = parseProgress(project.path);
    const planDir = path.join(project.path, 'plan');
    if (fs.existsSync(planDir)) {
      hasPlanFiles = fs.readdirSync(planDir).some(f => f.endsWith('.md') && !f.startsWith('.') && fs.statSync(path.join(planDir, f)).isFile());
    }
  }
  
  res.json({ ...project, isInstalled, progress, hasPlanFiles });
});

router.post('/projects/:id/install', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  // Root of the ai-checkpoint tool (parent of dashboard/)
  const aiCheckpointRoot = path.resolve(process.cwd(), '..');
  const templatesDir = path.join(aiCheckpointRoot, 'templates');
  const scriptsDir = path.join(aiCheckpointRoot, 'scripts');
  const projectDir = project.path;

  try {
    // 1. Create directories
    fs.mkdirSync(path.join(projectDir, '.agents', 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(projectDir, 'plan', 'drafts'), { recursive: true });

    // 2. Copy ledger CLI script
    const ledgerSrc = path.join(scriptsDir, 'ledger.cjs');
    if (fs.existsSync(ledgerSrc)) {
      fs.copyFileSync(ledgerSrc, path.join(projectDir, '.agents', 'scripts', 'ledger.cjs'));
    }

    // 3. Create ./l shortcut
    const lScript = '#!/bin/bash\nnode .agents/scripts/ledger.cjs "$@"\n';
    fs.writeFileSync(path.join(projectDir, 'l'), lScript, { mode: 0o755 });

    // 4. Copy template files (only if they don't already exist)
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

router.get('/projects/:id/health', (req, res) => {
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
});

router.get('/projects/:id/checkpoints', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  
  try {
    // Get full git log with a specific format
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

router.post('/projects/:id/rollback', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const { hash } = req.body;
  if (!hash) return res.status(400).json({ error: 'Hash required' });

  try {
    // Very dangerous, but requested feature:
    execSync(`git reset --hard ${hash}`, { cwd: project.path });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Command Execution
router.post('/projects/:id/command', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const { command, step, message } = req.body;
  const cwd = project.path;

  try {
    if (command === 'start') {
      execSync(`./l start ${step}`, { cwd });
    } else if (command === 'complete') {
      execSync(`./l c ${step} "${message || 'Completed via Dashboard'}"`, { cwd });
    } else {
      return res.status(400).json({ error: 'Invalid command' });
    }
    res.json({ success: true });
  } catch (e) {
    let errorMessage = 'Command execution failed';
    if (e.stdout && e.stdout.toString().trim()) {
      const lines = e.stdout.toString().trim().split('\n');
      errorMessage = lines[lines.length - 1].replace(/\x1b\[[0-9;]*m/g, '').trim(); // Strip ANSI codes
    } else if (e.stderr && e.stderr.toString().trim()) {
      errorMessage = e.stderr.toString().trim();
    } else if (e.message) {
      errorMessage = e.message;
    }
    res.status(500).json({ error: errorMessage });
  }
});

// Config Reading/Writing
router.get('/projects/:id/config', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const rulesPath = path.join(project.path, '.agents', 'RULES.md');
  const agentsPath = path.join(project.path, '.agents', 'AGENTS.md');
  
  const rules = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, 'utf8') : '';
  const agents = fs.existsSync(agentsPath) ? fs.readFileSync(agentsPath, 'utf8') : '';
  
  res.json({ rules, agents });
});

router.post('/projects/:id/config', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const { rules, agents } = req.body;
  const rulesPath = path.join(project.path, '.agents', 'RULES.md');
  const agentsPath = path.join(project.path, '.agents', 'AGENTS.md');
  
  try {
    if (rules !== undefined) fs.writeFileSync(rulesPath, rules);
    if (agents !== undefined) fs.writeFileSync(agentsPath, agents);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
