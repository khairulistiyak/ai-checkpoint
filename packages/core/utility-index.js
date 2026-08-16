const fs = require('fs');
const path = require('path');
const { walkFiles } = require('./duplicate-detector');

function extractExports(content) {
  const exports = new Set();
  const cjsMatch = content.match(/module\.exports\s*=\s*\{([^}]+)\}/);
  if (cjsMatch) {
    cjsMatch[1].split(',').forEach(item => {
      const name = item.trim().split(':')[0].trim();
      if (name && /^[a-zA-Z0-9_$]+$/.test(name)) exports.add(name);
    });
  }
  const esmRegex = /export\s+(?:default\s+)?(?:function|const|class)?\s*([a-zA-Z0-9_$]+)/g;
  let m;
  while ((m = esmRegex.exec(content)) !== null) {
    if (m[1]) exports.add(m[1]);
  }
  return exports;
}

function extractDocSummary(lines, lineIdx) {
  for (let i = lineIdx - 1; i >= Math.max(0, lineIdx - 4); i--) {
    const line = lines[i].trim();
    if (line.startsWith('//') || line.startsWith('*')) {
      return line.replace(/^\/\/\s*|^\*\s*/, '').trim();
    }
  }
  return '';
}

function buildUtilityIndex(projectPath) {
  const files = walkFiles(projectPath);
  const registry = [];
  for (const fp of files) {
    let content;
    try { content = fs.readFileSync(fp, 'utf8'); } catch { continue; }
    const exports = extractExports(content);
    const lines = content.split('\n');
    const fnRegex = /(?:function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)|const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>)/g;
    let match;
    while ((match = fnRegex.exec(content)) !== null) {
      const name = match[1] || match[3];
      if (!name || name === 'anonymous') continue;
      const params = (match[2] || match[4] || '').trim();
      const lineNum = content.slice(0, match.index).split('\n').length;
      const doc = extractDocSummary(lines, lineNum - 1);
      const isExported = exports.has(name);
      registry.push({
        name,
        params,
        signature: `${name}(${params})`,
        file: path.relative(projectPath, fp),
        line: lineNum,
        exported: isExported,
        docSummary: doc,
        relPath: path.relative(projectPath, fp)
      });
    }
  }
  return { totalUtilities: registry.length, exportedCount: registry.filter(r => r.exported).length, registry };
}

function scoreMatch(item, q) {
  let score = 0;
  const name = item.name.toLowerCase();
  const file = item.file.toLowerCase();
  const doc = (item.docSummary || '').toLowerCase();
  const sig = item.signature.toLowerCase();
  if (name === q) score += 100;
  else if (name.startsWith(q)) score += 80;
  else if (name.includes(q)) score += 50;
  if (sig.includes(q)) score += 30;
  if (doc.includes(q)) score += 20;
  if (file.includes(q)) score += 10;
  if (item.exported) score += 15;
  return score;
}

function searchUtility(indexOrPath, query = '', options = {}) {
  const index = typeof indexOrPath === 'string' ? buildUtilityIndex(indexOrPath) : indexOrPath;
  const q = (query || '').toLowerCase().trim();
  if (!q) return index.registry.slice(0, options.limit || 50);
  const scored = [];
  for (const item of index.registry) {
    const score = scoreMatch(item, q);
    if (score > 0) scored.push({ ...item, matchScore: score });
  }
  scored.sort((a, b) => b.matchScore - a.matchScore);
  const limit = options.limit || 30;
  return scored.slice(0, limit);
}

module.exports = { buildUtilityIndex, searchUtility };
