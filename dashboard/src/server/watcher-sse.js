export class SSEClientManager {
  constructor() {
    // projectId → Set<res>
    this.clients = new Map();
  }

  addClient(projectId, res) {
    if (!this.clients.has(projectId)) {
      this.clients.set(projectId, new Set());
    }
    this.clients.get(projectId).add(res);
  }

  removeClient(projectId, res) {
    const set = this.clients.get(projectId);
    if (set) {
      set.delete(res);
      if (set.size === 0) this.clients.delete(projectId);
    }
  }

  broadcast(projectId, event, data) {
    const set = this.clients.get(projectId);
    if (!set || set.size === 0) return;
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of set) {
      try { res.write(payload); } catch (e) { /* client gone */ }
    }
  }

  broadcastAll(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [, set] of this.clients) {
      for (const res of set) {
        try { res.write(payload); } catch (e) { /* client gone */ }
      }
    }
  }
}
