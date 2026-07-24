const path = require('path');

const AGENTS_DIR = path.join(process.cwd(), '.agents');
const PROGRESS_PATH = path.join(AGENTS_DIR, 'PROGRESS.md');
const PLAN_DIR = path.join(process.cwd(), 'plan');
const DRAFTS_DIR = path.join(PLAN_DIR, 'drafts');

module.exports = {
  AGENTS_DIR,
  PROGRESS_PATH,
  PLAN_DIR,
  DRAFTS_DIR
};
