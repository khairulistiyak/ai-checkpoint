const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', 'release', '.agents', 'plan', '_archive', 'tests'];
const SCAN_EXTS = ['.js', '.cjs', '.mjs', '.jsx', '.tsx', '.ts', '.php', '.py', '.go', '.rs', '.dart'];

function walkFiles(dir, res = []) {
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return res; }
  for (const name of entries) {
    if (name.startsWith('.') || name.startsWith('._') || SKIP_DIRS.includes(name)) continue;
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) { walkFiles(full, res); continue; }
    if (SCAN_EXTS.includes(path.extname(name).toLowerCase()) && stat.size > 0) res.push(full);
  }
  return res;
}

function extractFunctions(filePath, content) {
  const funcs = [];
  const lines = content.split('\n');
  const fnRegex = /(?:function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)|const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>|def\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)|fn\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\))/g;
  let match;
  while ((match = fnRegex.exec(content)) !== null) {
    const name = match[1] || match[3] || match[5] || match[7] || 'anonymous';
    const params = (match[2] || match[4] || match[6] || match[8] || '').trim();
    const lineNum = content.slice(0, match.index).split('\n').length;
    // Extract body block (simple brace balance)
    let body = '';
    const openBrace = content.indexOf('{', match.index);
    if (openBrace !== -1 && openBrace - match.index < 120) {
      let depth = 1, idx = openBrace + 1;
      while (idx < content.length && depth > 0) {
        if (content[idx] === '{') depth++;
        else if (content[idx] === '}') depth--;
        idx++;
      }
      body = content.slice(openBrace, idx);
    } else {
      body = lines.slice(lineNum - 1, lineNum + 15).join('\n');
    }
    if (body.trim().length > 30) {
      funcs.push({ name, params, file: filePath, line: lineNum, body, normBody: normalizeCode(body) });
    }
  }
  return funcs;
}

function normalizeCode(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // remove comments
    .replace(/["'][^"']*["']/g, '""')       // normalize strings
    .replace(/\b(let|const|var|function|return|async|await)\b/g, '') // strip keywords
    .replace(/[\s;,\(\)\{\}\[\]]/g, '')     // strip whitespace & syntax noise
    .toLowerCase();
}

function computeTokenSimilarity(normA, normB) {
  if (normA === normB) return 1.0;
  if (!normA || !normB) return 0.0;
  const setA = new Set(normA.match(/.{1,3}/g) || []);
  const setB = new Set(normB.match(/.{1,3}/g) || []);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function nameSimilarity(nameA, nameB) {
  if (nameA === nameB) return 1.0;
  const lowerA = nameA.toLowerCase().replace(/[^a-z0-9]/g, '');
  const lowerB = nameB.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (lowerA === lowerB || lowerA.includes(lowerB) || lowerB.includes(lowerA)) return 0.85;
  return 0.0;
}

function detectDuplicates(projectPath, options = {}) {
  const threshold = options.threshold || 0.75;
  const allFiles = walkFiles(projectPath);
  const allFuncs = [];
  for (const fp of allFiles) {
    if (fp.includes('duplicate-detector.js')) continue;
    try { allFuncs.push(...extractFunctions(fp, fs.readFileSync(fp, 'utf8'))); } catch {}
  }
  const duplicates = [];
  const hashes = new Map();
  for (let i = 0; i < allFuncs.length; i++) {
    const fA = allFuncs[i];
    const bodyHash = crypto.createHash('sha256').update(fA.normBody).digest('hex').slice(0, 12);
    if (hashes.has(bodyHash) && hashes.get(bodyHash).file !== fA.file) {
      const fB = hashes.get(bodyHash);
      duplicates.push({ type: 'exact', score: 1.0, funcA: fA, funcB: fB, msg: `Exact duplicate in ${path.basename(fA.file)} and ${path.basename(fB.file)}` });
      continue;
    }
    hashes.set(bodyHash, fA);
    for (let j = i + 1; j < allFuncs.length; j++) {
      const fB = allFuncs[j];
      if (fA.file === fB.file) continue;
      const sim = computeTokenSimilarity(fA.normBody, fB.normBody);
      const nameSim = nameSimilarity(fA.name, fB.name);
      if (sim >= threshold && sim < 1.0) {
        duplicates.push({ type: 'structural', score: Math.round(sim * 100) / 100, funcA: fA, funcB: fB, msg: `${Math.round(sim * 100)}% structural similarity: ${fA.name} ↔ ${fB.name}` });
      } else if (nameSim >= 0.8 && sim >= 0.5) {
        duplicates.push({ type: 'name-similar', score: Math.round(nameSim * 100) / 100, funcA: fA, funcB: fB, msg: `Name and logic match: ${fA.name} ↔ ${fB.name}` });
      }
    }
  }
  const dryScore = Math.max(0, 100 - (duplicates.filter(d => d.type === 'exact').length * 5 + duplicates.filter(d => d.type === 'structural').length * 3 + duplicates.filter(d => d.type === 'name-similar').length));
  return { filesScanned: allFiles.length, functionsScanned: allFuncs.length, dryScore, duplicatesCount: duplicates.length, duplicates };
}

module.exports = { detectDuplicates, walkFiles, extractFunctions, computeTokenSimilarity };
