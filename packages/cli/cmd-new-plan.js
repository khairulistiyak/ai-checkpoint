const fs = require('fs');
const path = require('path');
const { PLAN_DIR } = require('./paths.js');
const { log } = require('./colors.js');

function newPlanCommand(name, extraArgs = []) {
  if (!name || !/^[a-zA-Z0-9-]{1,50}$/.test(name)) {
    log.error('Plan name must use 1-50 letters, numbers, or dashes');
    process.exit(1);
  }

  const tierIndex = extraArgs.indexOf('--tier');
  let tier = 'medium';
  if (tierIndex !== -1 && extraArgs[tierIndex + 1]) {
    tier = extraArgs[tierIndex + 1].toLowerCase();
    if (!['small', 'medium', 'high'].includes(tier)) {
      log.error('Invalid tier. Expected: small, medium, or high');
      process.exit(1);
    }
  }

  // Save tier in .agents/ai-config.json
  const configDir = path.join(process.cwd(), '.agents');
  if (fs.existsSync(configDir)) {
    const configPath = path.join(configDir, 'ai-config.json');
    let config = {};
    if (fs.existsSync(configPath)) {
      try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) { /* read config error ignored */ }
    }
    config.tier = tier;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  const targetPath = path.join(PLAN_DIR, `${name}.md`);
  if (fs.existsSync(targetPath)) {
    log.error(`plan/${name}.md already exists`);
    process.exit(1);
  }

  fs.mkdirSync(PLAN_DIR, { recursive: true });

  let templateContent = '';
  if (tier === 'small') {
    templateContent = `# Plan: ${name}\n\n> Description of ${name}\n> (AI Tier: Small — Max 5 steps/phase)\n\n---\n\n## Step 1.1 — Create initial module\n- **File:** \`src/index.js\`\n- **Action:** CREATE\n- **Content:**\n  \`\`\`javascript\n  console.log('Hello from small model template');\n  \`\`\`\n- **Done-check:** \`test -f src/index.js\`\n- **Depends:** None\n\n**Description:** Initialize the index file with a basic console log.\n`;
  } else if (tier === 'high') {
    templateContent = `# Plan: ${name}\n\n> Description of ${name}\n> (AI Tier: High — No constraints)\n\n---\n\n## 1.1 — Create file\n- **File:** \`src/index.js\`\n- **Action:** CREATE\n- **Done-check:** \`test -f src/index.js\`\n- **Depends:** None\n\nWrite the complete code block or description here.\n`;
  } else {
    // Medium / Standard (use template file if exists, fallback otherwise)
    const candidates = [
      path.join(process.cwd(), 'templates', 'PLAN_TEMPLATE.md'),
      path.resolve(__dirname, '..', '..', 'templates', 'PLAN_TEMPLATE.md'),
      path.resolve(__dirname, '..', '..', '..', 'templates', 'PLAN_TEMPLATE.md'),
    ];
    const templatePath = candidates.find(p => fs.existsSync(p));

    if (templatePath) {
      const template = fs.readFileSync(templatePath, 'utf8');
      templateContent = template.replace('[Your Plan Name]', name);
    } else {
      templateContent = `# Plan: ${name}\n\n> Description of ${name}\n> (AI Tier: Medium — Standard format)\n\n---\n\n## Step 1.1 — [Step Title]\n- **File:** \`src/index.js\`\n- **Action:** CREATE\n- **Content:**\n  // Put working code here\n- **Done-check:** \`node -e "require('./src/index.js')"\`\n- **Depends:** None\n\n**Description:** Detailed instruction of what to do.\n`;
    }
  }

  fs.writeFileSync(targetPath, templateContent, 'utf8');
  log.success(`Created plan/${name}.md (${tier} tier) — edit it to add your steps`);
}

module.exports = {
  newPlanCommand
};
