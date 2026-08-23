import os from 'os';
import path from 'path';
import fs from 'fs';

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

export {
  migrateOldAgentsDir as migrateFromDotAgents,
  migrateOldAgentsDir,
  saveSnapshot,
  recoverProgressFromPlans
} from './global-store-ops.js';