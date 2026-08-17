const fs = require('fs');
const path = require('path');

const { walkCodeFiles } = require('./file-walker.js');

function getImports(filePath) {
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { return []; }
  const imports = [];
  const re = /(?:from\s+|require\(\s*)['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    if (!m[1].startsWith('.')) continue;
    const resolved = path.resolve(path.dirname(filePath), m[1]);
    const exts = ['', '.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs'];
    for (const e of exts) {
      if (fs.existsSync(resolved + e)) { imports.push(resolved + e); break; }
    }
  }
  return imports;
}

function detectCircularDeps(projectPath) {
  const files = walkCodeFiles(projectPath).map(f => f.path);
  const graph = new Map();
  for (const f of files) graph.set(f, getImports(f));

  const cycles = [];
  const visited = new Set();
  const inStack = new Set();

  function dfs(node, chain) {
    if (inStack.has(node)) {
      const start = chain.indexOf(node);
      if (start >= 0) cycles.push(chain.slice(start).map(p => path.relative(projectPath, p)));
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    inStack.add(node);
    chain.push(node);
    for (const dep of (graph.get(node) || [])) dfs(dep, [...chain]);
    inStack.delete(node);
  }

  for (const f of files) { if (!visited.has(f)) dfs(f, []); }
  return { cycles };
}

module.exports = { detectCircularDeps };
