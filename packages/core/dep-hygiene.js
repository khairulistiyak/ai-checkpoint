const fs = require('fs');
const path = require('path');

function scanDependencyHygiene(projectPath) {
  const issues = [];
  const pkgPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return { checked: false, issues: [{ type: 'no-package-json', msg: 'No package.json found' }] };
  }

  let pkg;
  try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch (e) {
    return { checked: false, issues: [{ type: 'invalid-package-json', msg: 'Invalid package.json: ' + e.message }] };
  }

  const deps = Object.keys(pkg.dependencies || {});
  const devDeps = Object.keys(pkg.devDependencies || {});

  // Check for pinned versions (no ^ or ~)
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  for (const [name, version] of Object.entries(allDeps)) {
    if (version === '*' || version === 'latest') {
      issues.push({ type: 'unpinned-dep', msg: `Unpinned dependency: ${name}@${version}` });
    }
  }

  // Check for duplicate deps in both dependencies and devDependencies
  for (const name of deps) {
    if (devDeps.includes(name)) {
      issues.push({ type: 'duplicate-dep', msg: `${name} appears in both dependencies and devDependencies` });
    }
  }

  // Check node_modules exists
  const nmPath = path.join(projectPath, 'node_modules');
  if (deps.length > 0 && !fs.existsSync(nmPath)) {
    issues.push({ type: 'missing-node-modules', msg: 'node_modules not found — run npm install' });
  }

  // Check for missing required fields
  if (!pkg.name) issues.push({ type: 'missing-field', msg: 'package.json missing "name" field' });
  if (!pkg.version) issues.push({ type: 'missing-field', msg: 'package.json missing "version" field' });

  return {
    checked: true,
    totalDeps: deps.length,
    totalDevDeps: devDeps.length,
    issues,
  };
}

module.exports = { scanDependencyHygiene };
