import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import {
  getProgressPath,
  getRulesPath,
  getAgentsPath,
  getSystemGuidePath,
  getAiConfigPath,
  getActivityLogPath,
  getIntelligenceHistoryPath,
  getSnapshotsDir,
  getSnapshotPath,
  getGlobalEnginePath,
  ensureProjectDataDir
} from './global-store.js';

export function migrateOldAgentsDir(projectId, projectPath) {
  const oldAgentsDir = path.join(projectPath, '.agents');
  if (!fs.existsSync(oldAgentsDir)) {
    return { migrated: false, reason: 'No .agents directory found' };
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

  try {
    fs.renameSync(oldAgentsDir, path.join(projectPath, '.agents.bak'));
  } catch (e) {
    void e;
  }

  return { migrated: true, files: migratedFiles };
}

export function saveSnapshot(projectId, projectPath) {
  const snapshotsDir = getSnapshotsDir(projectId);
  if (!fs.existsSync(snapshotsDir)) {
    fs.mkdirSync(snapshotsDir, { recursive: true });
  }

  const snapshotPath = getSnapshotPath(projectId);

  if (fs.existsSync(snapshotPath)) {
    const timestamp = Date.now();
    const historyPath = path.join(snapshotsDir, `snapshot-${timestamp}.json`);
    fs.copyFileSync(snapshotPath, historyPath);

    const files = fs.readdirSync(snapshotsDir)
      .filter((f) => f.startsWith('snapshot-'))
      .sort((a, b) => {
        return fs.statSync(path.join(snapshotsDir, b)).mtime.getTime() -
               fs.statSync(path.join(snapshotsDir, a)).mtime.getTime();
      });

    if (files.length > 10) {
      for (let i = 10; i < files.length; i++) {
        try {
          fs.unlinkSync(path.join(snapshotsDir, files[i]));
        } catch (err) {
          void err;
        }
      }
    }
  }

  const planDir = path.join(projectPath, 'plan');
  const planFiles = fs.existsSync(planDir) ? fs.readdirSync(planDir).filter((f) => f.endsWith('.md')) : [];

  const snapshotData = {
    timestamp: new Date().toISOString(),
    planFilesCount: planFiles.length,
    projectId,
    projectPath
  };

  fs.writeFileSync(snapshotPath, JSON.stringify(snapshotData, null, 2));
}

export function recoverProgressFromPlans(projectId, projectPath) {
  const progressPath = getProgressPath(projectId);
  if (fs.existsSync(progressPath)) return { recovered: true, message: 'Already exists' };

  try {
    ensureProjectDataDir(projectId);
    const skeleton = `# Progress Tracker

[░░░░░░░░░░░░░░░░░░░░] 0% (0/0 steps complete)

## 👉 NEXT: Create your first plan file in \`plan/\`

---

<!--
No phases yet. Add plan files to the plan/ directory,
then click "Sync Plans" to populate this tracker.
-->
`;
    fs.writeFileSync(progressPath, skeleton, 'utf8');

    const enginePath = getGlobalEnginePath();
    if (fs.existsSync(enginePath)) {
      execSync(`node "${enginePath}" sync`, { cwd: projectPath, stdio: 'ignore' });
    }
    return { recovered: true };
  } catch (e) {
    return { recovered: false, error: e.message };
  }
}
