const path = require('path');
const os = require('os');
const fs = require('fs');

function detectProjectId() {
  try {
    const settingsPath = path.join(os.homedir(), '.ai-checkpoint-dashboard', 'settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const cwd = process.cwd();
    const project = settings.projects.find(p => p.path === cwd);
    return project ? project.id : null;
  } catch { return null; }
}

function getAgentsDir() {
  const localAgents = path.join(process.cwd(), '.agents');
  const projectId = detectProjectId();
  if (projectId) {
    const globalAgents = path.join(os.homedir(), '.ai-checkpoint', 'projects', projectId);
    if (fs.existsSync(path.join(globalAgents, 'PROGRESS.md'))) {
      return globalAgents;
    }
  }
  return localAgents;
}

const AGENTS_DIR = getAgentsDir();
const PROGRESS_PATH = path.join(AGENTS_DIR, 'PROGRESS.md');
const PLAN_DIR = path.join(process.cwd(), 'plan');
const DRAFTS_DIR = path.join(PLAN_DIR, 'drafts');

module.exports = {
  AGENTS_DIR,
  PROGRESS_PATH,
  PLAN_DIR,
  DRAFTS_DIR
};
