import os from 'os';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const GLOBAL_DIR = path.join(os.homedir(), '.ai-checkpoint');

export function getProjectDataDir(projectId) {
  return path.join(GLOBAL_DIR, 'projects', projectId);
}

export function ensureProjectDataDir(projectId) {
  const dir = getProjectDataDir(projectId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getProgressPath(projectId) {
  return path.join(getProjectDataDir(projectId), 'PROGRESS.md');
}

export function getRulesPath(projectId) {
  return path.join(getProjectDataDir(projectId), 'RULES.md');
}

export function getAgentsPath(projectId) {
  return path.join(getProjectDataDir(projectId), 'AGENTS.md');
}

export function getSystemGuidePath(projectId) {
  return path.join(getProjectDataDir(projectId), 'SYSTEM_GUIDE.md');
}

export function getAiConfigPath(projectId) {
  return path.join(getProjectDataDir(projectId), 'ai-config.json');
}

export function getActivityLogPath(projectId) {
  return path.join(getProjectDataDir(projectId), 'activity-log.jsonl');
}

export function getIntelligenceHistoryPath(projectId) {
  return path.join(getProjectDataDir(projectId), 'intelligence-history.json');
}

export function getSnapshotPath(projectId) {
  return path.join(getProjectDataDir(projectId), 'snapshot.json');
}

export function getPlanBackupDir(projectId) {
  return path.join(getProjectDataDir(projectId), 'plan-backup');
}

export function getSnapshotsDir(projectId) {
  return path.join(getProjectDataDir(projectId), 'snapshots');
}

export function getGlobalEnginePath() {
  return path.join(GLOBAL_DIR, 'engine.bin.js');
}

export function deployGlobalEngine(engineSourcePath) {
  if (!fs.existsSync(GLOBAL_DIR)) {
    fs.mkdirSync(GLOBAL_DIR, { recursive: true });
  }
  
  if (fs.existsSync(engineSourcePath)) {
    fs.copyFileSync(engineSourcePath, getGlobalEnginePath());
  }
}

export function backupPlanFile(projectId, projectPath, filename) {
  const planBackupDir = getPlanBackupDir(projectId);
  if (!fs.existsSync(planBackupDir)) {
    fs.mkdirSync(planBackupDir, { recursive: true });
  }
  
  const sourceFile = path.join(projectPath, 'plan', filename);
  const destFile = path.join(planBackupDir, filename);
  
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, destFile);
  }
}

export function migrateFromDotAgents(projectId, projectPath) {
  const oldAgentsDir = path.join(projectPath, '.agents');
  if (!fs.existsSync(oldAgentsDir)) {
    return { migrated: false };
  }
  
  ensureProjectDataDir(projectId);
  const migratedFiles = [];
  
  const filesToMove = [
    { name: 'PROGRESS.md', dest: getProgressPath(projectId) },
    { name: 'RULES.md', dest: getRulesPath(projectId) },
    { name: 'AGENTS.md', dest: getAgentsPath(projectId) },
    { name: 'SYSTEM_GUIDE.md', dest: getSystemGuidePath(projectId) },
    { name: 'ai-config.json', dest: getAiConfigPath(projectId) },
    { name: 'activity-log.jsonl', dest: getActivityLogPath(projectId) },
    { name: 'intelligence-history.json', dest: getIntelligenceHistoryPath(projectId) }
  ];
  
  for (const file of filesToMove) {
    const src = path.join(oldAgentsDir, file.name);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, file.dest);
      migratedFiles.push(file.name);
    }
  }
  
  // Rename old .agents to prevent re-migration and clean up
  try {
    fs.renameSync(oldAgentsDir, path.join(projectPath, '.agents.bak'));
  } catch (e) {
    console.error('⚠️ Could not rename .agents to .agents.bak:', e.message);
  }
  
  return { migrated: true, files: migratedFiles };
}

export function saveSnapshot(projectId, projectPath) {
  const snapshotsDir = getSnapshotsDir(projectId);
  if (!fs.existsSync(snapshotsDir)) {
    fs.mkdirSync(snapshotsDir, { recursive: true });
  }
  
  const snapshotPath = getSnapshotPath(projectId);
  
  // Backup existing snapshot as history
  if (fs.existsSync(snapshotPath)) {
    const timestamp = Date.now();
    const historyPath = path.join(snapshotsDir, `snapshot-${timestamp}.json`);
    fs.copyFileSync(snapshotPath, historyPath);
    
    // Cleanup old snapshots (keep last 10)
    const files = fs.readdirSync(snapshotsDir)
      .filter(f => f.startsWith('snapshot-'))
      .sort((a, b) => {
        return fs.statSync(path.join(snapshotsDir, b)).mtime.getTime() - 
               fs.statSync(path.join(snapshotsDir, a)).mtime.getTime();
      });
      
    if (files.length > 10) {
      for (let i = 10; i < files.length; i++) {
        fs.unlinkSync(path.join(snapshotsDir, files[i]));
      }
    }
  }
  
  // Create new snapshot
  const planDir = path.join(projectPath, 'plan');
  const planFiles = fs.existsSync(planDir) ? fs.readdirSync(planDir).filter(f => f.endsWith('.md')) : [];
  
  const snapshotData = {
    timestamp: new Date().toISOString(),
    planFilesCount: planFiles.length,
    projectId,
    projectPath
  };
  
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshotData, null, 2));
}

// BUG FIX: Added ensureProjectDataDir before writeFileSync
export function recoverProgressFromPlans(projectId, projectPath) {
  const progressPath = getProgressPath(projectId);
  if (fs.existsSync(progressPath)) return { recovered: true, message: 'Already exists' };

  try {
    ensureProjectDataDir(projectId);
    const skeleton = `# Project Progress

[░░░░░░░░░░░░░░░░░░░░] 0% (0/0 steps complete)

## 👉 NEXT: None

---

## 🔷 Phase 1: Core Hardening — 🔴 0% PENDING

- [ ] **Step 1.1** — Initial setup
`;
    fs.writeFileSync(progressPath, skeleton, 'utf8');
    
    const enginePath = getGlobalEnginePath();
    if (fs.existsSync(enginePath)) {
      const { execSync } = require('child_process');
      execSync(`node "${enginePath}" sync`, { cwd: projectPath, stdio: 'ignore' });
    }
    return { recovered: true };
  } catch (e) {
    console.error('⚠️ Progress recovery failed:', e.message);
    return { recovered: false, error: e.message };
  }
}