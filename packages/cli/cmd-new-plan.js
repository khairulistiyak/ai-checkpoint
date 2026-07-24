const fs = require('fs');
const path = require('path');
const { PLAN_DIR } = require('./paths.js');
const { log } = require('./colors.js');

function newPlanCommand(name) {
  if (!name || !/^[a-zA-Z0-9-]{1,50}$/.test(name)) {
    log.error('Plan name must use 1-50 letters, numbers, or dashes');
    process.exit(1);
  }

  // Try multiple locations for the template
  const candidates = [
    path.join(process.cwd(), 'templates', 'PLAN_TEMPLATE.md'),
    path.resolve(__dirname, '..', '..', 'templates', 'PLAN_TEMPLATE.md'),
    path.resolve(__dirname, '..', '..', '..', 'templates', 'PLAN_TEMPLATE.md'),
  ];
  const templatePath = candidates.find(p => fs.existsSync(p));

  const targetPath = path.join(PLAN_DIR, `${name}.md`);

  if (!templatePath) {
    // Fallback: create a minimal template inline
    fs.mkdirSync(PLAN_DIR, { recursive: true });
    const fallback = `# ${name}\n\n> Plan description here.\n\n---\n\n## Step 1.1 — First step\n- **File:** \`path/to/file\`\n- **Action:** CREATE\n- **Done-check:** \`test -f path/to/file\` → exit 0\n- **Depends:** None\n\n**Description:** What to do in this step.\n`;
    fs.writeFileSync(targetPath, fallback, 'utf8');
    log.success(`Created plan/${name}.md (using built-in template)`);
    return;
  }
  if (fs.existsSync(targetPath)) {
    log.error(`plan/${name}.md already exists`);
    process.exit(1);
  }
  fs.mkdirSync(PLAN_DIR, { recursive: true });
  const template = fs.readFileSync(templatePath, 'utf8');
  fs.writeFileSync(targetPath, template.replace('[Your Plan Name]', name), 'utf8');
  log.success(`Created plan/${name}.md — edit it to add your steps`);
}

module.exports = {
  newPlanCommand
};
