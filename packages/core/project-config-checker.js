const fs = require('fs');
const path = require('path');

function checkProjectConfig(projectPath) {
  const issues = [];
  const checks = [];

  // Check .gitignore exists
  const gitignore = path.join(projectPath, '.gitignore');
  if (fs.existsSync(gitignore)) {
    const content = fs.readFileSync(gitignore, 'utf8');
    checks.push({ name: '.gitignore', exists: true });
    if (!content.includes('node_modules')) {
      issues.push({ type: 'gitignore-missing', msg: '.gitignore missing node_modules' });
    }
    if (!content.includes('.env')) {
      issues.push({ type: 'gitignore-missing', msg: '.gitignore missing .env files' });
    }
  } else {
    checks.push({ name: '.gitignore', exists: false });
    issues.push({ type: 'missing-gitignore', msg: 'No .gitignore file found' });
  }

  // Check README exists
  const readme = path.join(projectPath, 'README.md');
  if (fs.existsSync(readme)) {
    checks.push({ name: 'README.md', exists: true });
    const content = fs.readFileSync(readme, 'utf8');
    if (content.trim().length < 50) {
      issues.push({ type: 'empty-readme', msg: 'README.md is too short (less than 50 chars)' });
    }
  } else {
    checks.push({ name: 'README.md', exists: false });
    issues.push({ type: 'missing-readme', msg: 'No README.md file found' });
  }

  // Check LICENSE exists
  const license = path.join(projectPath, 'LICENSE');
  const licenseMd = path.join(projectPath, 'LICENSE.md');
  if (fs.existsSync(license) || fs.existsSync(licenseMd)) {
    checks.push({ name: 'LICENSE', exists: true });
  } else {
    checks.push({ name: 'LICENSE', exists: false });
    issues.push({ type: 'missing-license', msg: 'No LICENSE file found' });
  }

  // Check for .env files in repo (should be gitignored)
  const envFile = path.join(projectPath, '.env');
  if (fs.existsSync(envFile)) {
    checks.push({ name: '.env', exists: true });
    issues.push({ type: 'env-in-repo', msg: '.env file found in project root — ensure it is gitignored' });
  }

  return { checks, issues };
}

module.exports = { checkProjectConfig };
