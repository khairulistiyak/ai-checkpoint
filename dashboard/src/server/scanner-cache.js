/**
 * scanner-cache.js — In-memory TTL cache for scanner results.
 * Prevents repeated heavy scans from blocking the event loop.
 */

const DEFAULT_TTL = 30000; // 30 seconds

class ScannerCache {
  constructor() {
    this.store = new Map();
  }

  /**
   * Get cached result if not expired.
   * @param {string} key — cache key (e.g. "health:projectId")
   * @returns {object|null} — cached data or null if miss/expired
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Store result with TTL.
   * @param {string} key
   * @param {object} data
   * @param {number} [ttlMs=30000]
   */
  set(key, data, ttlMs = DEFAULT_TTL) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
  }

  /**
   * Force-clear a specific key.
   * @param {string} key
   */
  invalidate(key) {
    this.store.delete(key);
  }

  /** Clear all cached entries. */
  clear() {
    this.store.clear();
  }
}

const scanCache = new ScannerCache();

export { scanCache, ScannerCache };
