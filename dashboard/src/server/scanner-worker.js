/**
 * scanner-worker.js — Runs heavy scanners in a Worker Thread.
 *
 * Usage: new Worker('./scanner-worker.js', { workerData: { projectPath, scanType } })
 * scanType: 'health' | 'quality' | 'intelligence'
 *
 * Sends result back via parentPort.postMessage().
 */

import { workerData, parentPort } from 'worker_threads';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { projectPath, scanType } = workerData;

function runScan() {
  const corePath = path.resolve(__dirname, '..', '..', '..', 'packages', 'core');

  if (scanType === 'health') {
    const { calculateHealth } = require(path.join(corePath, 'health-score.js'));
    return calculateHealth(projectPath);
  }

  if (scanType === 'quality') {
    const { generateQualityReport } = require(path.join(corePath, 'quality-report.js'));
    return generateQualityReport(projectPath);
  }

  if (scanType === 'intelligence') {
    const { generateIntelligenceReport } = require(path.join(corePath, 'intelligence-report.js'));
    return generateIntelligenceReport(projectPath);
  }

  return { error: `Unknown scanType: ${scanType}` };
}

try {
  const result = runScan();
  parentPort.postMessage({ success: true, result });
} catch (err) {
  parentPort.postMessage({ success: false, error: err.message });
}
