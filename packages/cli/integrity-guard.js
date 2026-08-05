const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { AGENTS_DIR } = require('./paths.js');
const { log } = require('./colors.js');

const SNAPSHOT_PATH = path.join(AGENTS_DIR, '.integrity-snapshot.json');
const SCAN_DIRS = ['packages', 'dashboard/src', 'scripts'];
const SCAN_FILES = ['dashboard/server.js'];

function getFileHash(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
  } catch {
    return null;
  }
}

function scanProjectFiles(rootDir = process.cwd()) {
  const files = {};
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (['node_modules', '.git', 'dist', 'build', '.agents', 'plan'].includes(item)) continue;
        walk(full);
      } else if (stat.isFile()) {
        const rel = path.relative(rootDir, full);
        const hash = getFileHash(full);
        if (hash) files[rel] = hash;
      }
    }
  };
  for (const d of SCAN_DIRS) walk(path.join(rootDir, d));
  for (const f of SCAN_FILES) {
    const full = path.join(rootDir, f);
    if (fs.existsSync(full)) {
      const hash = getFileHash(full);
      if (hash) files[f] = hash;
    }
  }
  return files;
}

function saveIntegritySnapshot(stepNum) {
  try {
    const files = scanProjectFiles();
    const snapshot = {
      step: stepNum,
      timestamp: new Date().toISOString(),
      files
    };
    if (!fs.existsSync(AGENTS_DIR)) fs.mkdirSync(AGENTS_DIR, { recursive: true });
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), 'utf8');
  } catch (e) {
    log.warn(`Could not save integrity snapshot: ${e.message}`);
  }
}

function checkIntegrity(stepNum, expectedFile) {
  const warnings = [];
  try {
    if (!fs.existsSync(SNAPSHOT_PATH)) return { ok: true, warnings };
    const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
    if (snapshot.step && stepNum && snapshot.step !== stepNum) return { ok: true, warnings };

    const currentFiles = scanProjectFiles();
    const oldFiles = snapshot.files || {};
    const normExpected = expectedFile ? path.relative(process.cwd(), path.resolve(process.cwd(), expectedFile)) : null;

    for (const [rel, oldHash] of Object.entries(oldFiles)) {
      const newHash = currentFiles[rel];
      if (newHash && newHash !== oldHash && rel !== normExpected) {
        warnings.push(`Unexpected modification: ${rel}`);
      }
    }
    for (const rel of Object.keys(currentFiles)) {
      if (!oldFiles[rel] && rel !== normExpected) {
        warnings.push(`Unexpected new file: ${rel}`);
      }
    }
  } catch (e) {
    log.warn(`Integrity check error: ${e.message}`);
  }
  return { ok: true, warnings };
}

module.exports = { saveIntegritySnapshot, checkIntegrity, scanProjectFiles, SNAPSHOT_PATH };
