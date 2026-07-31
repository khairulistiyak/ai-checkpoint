import express from 'express';
import fs from 'fs';
import path from 'path';
import { getSettings } from './settings.js';
import { generatePlanTemplate, getAgentsTierBlock } from './plan-templates.js';

const router = express.Router();

// Helper to check if project exists
function getProject(projectId, res) {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === projectId);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return null;
  }
  return project;
}

// GET AI tier settings
router.get('/projects/:id/ai-tier', (req, res) => {
  const project = getProject(req.params.id, res);
  if (!project) return;

  const configPath = path.join(project.path, '.agents', 'ai-config.json');
  let tier = 'medium';

  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.tier) tier = config.tier;
    }
  } catch (e) {
    console.error('Error reading ai-config.json:', e.message);
  }

  res.json({ tier });
});

// POST AI tier settings
router.post('/projects/:id/ai-tier', (req, res) => {
  const project = getProject(req.params.id, res);
  if (!project) return;

  const { tier } = req.body;
  if (!['small', 'medium', 'high'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier. Expected small, medium, or high.' });
  }

  const agentsDir = path.join(project.path, '.agents');
  if (!fs.existsSync(agentsDir)) {
    return res.status(400).json({ error: '.agents directory not found. Please install project first.' });
  }

  const configPath = path.join(agentsDir, 'ai-config.json');
  try {
    let config = {};
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (e) {}
    }
    config.tier = tier;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    res.json({ success: true, tier });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST generate new plan
router.post('/projects/:id/generate-plan', (req, res) => {
  const project = getProject(req.params.id, res);
  if (!project) return;

  const { name, tier, description, updateAgents = true } = req.body;
  if (!name || !/^[a-zA-Z0-9-]{1,50}$/.test(name)) {
    return res.status(400).json({ error: 'Plan name must be 1-50 characters, numbers, or dashes.' });
  }
  if (!['small', 'medium', 'high'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier.' });
  }

  const planDir = path.join(project.path, 'plan');
  const targetPath = path.join(planDir, `${name}.md`);

  if (fs.existsSync(targetPath)) {
    return res.status(400).json({ error: `plan/${name}.md already exists.` });
  }

  try {
    // 1. Create plan directory if not exists
    if (!fs.existsSync(planDir)) {
      fs.mkdirSync(planDir, { recursive: true });
    }

    // 2. Generate and write template
    const templateContent = generatePlanTemplate(name, tier, description);
    fs.writeFileSync(targetPath, templateContent, 'utf8');

    // 3. Save tier config
    const agentsDir = path.join(project.path, '.agents');
    if (fs.existsSync(agentsDir)) {
      const configPath = path.join(agentsDir, 'ai-config.json');
      let config = {};
      if (fs.existsSync(configPath)) {
        try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) {}
      }
      config.tier = tier;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

      // 4. Update AGENTS.md rules with marker block
      if (updateAgents) {
        const agentsPath = path.join(agentsDir, 'AGENTS.md');
        if (fs.existsSync(agentsPath)) {
          let agentsContent = fs.readFileSync(agentsPath, 'utf8');
          const tierBlock = getAgentsTierBlock(tier);

          if (agentsContent.includes('<!-- AI-TIER-START -->')) {
            agentsContent = agentsContent.replace(/<!-- AI-TIER-START -->[\s\S]*?<!-- AI-TIER-END -->/, tierBlock);
          } else {
            if (agentsContent.includes('## Rules')) {
              agentsContent = agentsContent.replace('## Rules', `## Rules\n\n${tierBlock}`);
            } else {
              agentsContent = agentsContent + '\n\n' + tierBlock;
            }
          }
          fs.writeFileSync(agentsPath, agentsContent, 'utf8');
        }
      }
    }

    res.json({ success: true, planFile: `${name}.md` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
