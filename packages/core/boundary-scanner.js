const fs = require('fs');
const path = require('path');

const FORBIDDEN_DOMAIN_IMPORTS = [
  'express', 'fastify', 'koa', 'react', 'react-dom', 'next', 'vue',
  'axios', 'node-fetch', 'sqlite3', 'pg', 'mysql2', 'mongoose',
  'prisma', '@prisma/client', 'typeorm', 'sequelize', 'fs', 'http', 'https'
];

function findDomainFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', '.agents', 'vendor'].includes(entry.name)) {
        findDomainFiles(fullPath, fileList);
      }
    } else if (entry.isFile() && /\.(js|ts|jsx|tsx|mjs|cjs|php|py|rs|go|dart|java|rb|swift|kt|cs|vue|svelte)$/i.test(entry.name)) {
      const rel = fullPath.toLowerCase();
      if (rel.includes('/domain/') || rel.includes('/entities/') || rel.includes('/use-cases/')) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

function scanBoundaryLeaks(projectPath) {
  const domainFiles = findDomainFiles(projectPath);
  const leaks = [];

  for (const file of domainFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((lineText, idx) => {
        FORBIDDEN_DOMAIN_IMPORTS.forEach((mod) => {
          const reqRegex = new RegExp(`require\\s*\\(\\s*['"]${mod}['"]\\s*\\)`);
          const impRegex = new RegExp(`from\\s*['"]${mod}['"]`);
          if (reqRegex.test(lineText) || impRegex.test(lineText)) {
            leaks.push({
              file: path.relative(projectPath, file),
              forbiddenModule: mod,
              line: idx + 1,
              snippet: lineText.trim(),
            });
          }
        });
      });
    } catch (e) { /* ignore read error */ }
  }

  return {
    passed: leaks.length === 0,
    leaksCount: leaks.length,
    scannedFiles: domainFiles.length,
    leaks,
  };
}

module.exports = { scanBoundaryLeaks, FORBIDDEN_DOMAIN_IMPORTS };
