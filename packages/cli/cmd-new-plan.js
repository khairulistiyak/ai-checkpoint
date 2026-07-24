const fs = require('fs');
const path = require('path');
const { PLAN_DIR } = require('./paths.js');
const { log } = require('./colors.js');

function newPlanCommand(name) {
  if (!name || !/^[a-zA-Z0-9-]{1,50}$/.test(name)) {
    log.error('Plan name must use 1-50 letters, numbers, or dashes');
    process.exit(1);
  }
  const templatePath = path.join(process.cwd(), 'templates', 'PLAN_TEMPLATE.md');
  const targetPath = path.join(PLAN_DIR, `${name}.md`);
  if (!fs.existsSync(templatePath)) {
    log.error('Missing templates/PLAN_TEMPLATE.md');
    process.exit(1);
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
