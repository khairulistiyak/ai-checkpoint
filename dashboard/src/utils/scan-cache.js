/**
 * Pure In-Memory Scan Store (Client-Side RAM Only)
 * Guarantees zero disk writes to project directories.
 */

const healthStore = new Map();
const intelligenceStore = new Map();

export function getCachedHealth(projectId) {
  if (!projectId) return null;
  const entry = healthStore.get(String(projectId));
  if (!entry) return null;
  return entry.data;
}

export function getHealthTimestamp(projectId) {
  if (!projectId) return null;
  const entry = healthStore.get(String(projectId));
  return entry ? entry.timestamp : null;
}

export function setCachedHealth(projectId, data) {
  if (!projectId || !data) return;
  healthStore.set(String(projectId), {
    data,
    timestamp: Date.now()
  });
}

export function getCachedIntelligence(projectId) {
  if (!projectId) return null;
  const entry = intelligenceStore.get(String(projectId));
  if (!entry) return null;
  return entry.data;
}

export function getIntelligenceTimestamp(projectId) {
  if (!projectId) return null;
  const entry = intelligenceStore.get(String(projectId));
  return entry ? entry.timestamp : null;
}

export function setCachedIntelligence(projectId, data) {
  if (!projectId || !data) return;
  intelligenceStore.set(String(projectId), {
    data,
    timestamp: Date.now()
  });
}

export function invalidateScanCache(projectId) {
  if (!projectId) {
    healthStore.clear();
    intelligenceStore.clear();
    return;
  }
  const pid = String(projectId);
  healthStore.delete(pid);
  intelligenceStore.delete(pid);
}

export function clearAllScanCache() {
  healthStore.clear();
  intelligenceStore.clear();
}
