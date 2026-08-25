# Phase 179: Telemetry Circuit Breaker & Silent Offline Handling

> **Objective:** Prevent `net::ERR_CONNECTION_REFUSED` and unhandled promise rejection errors in the browser console when the optional analytics server on port 4100 is offline. Implement a smart circuit-breaker in `useTelemetryReporter.js` to silence offline network errors and cancel recurring heartbeat intervals if the server is unreachable.

---

## 📋 Execution Steps

### Step 179.1 — Add Smart Circuit Breaker & Safe Request Handling (`dashboard/src/hooks/useTelemetryReporter.js`)
- **File**: `dashboard/src/hooks/useTelemetryReporter.js`
- **Action**: EDIT
- **Content**: Implement circuit breaker state that suppresses heartbeat polling when port 4100 is unreachable, along with silent error handling and fast AbortController timeout. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build`
- **Depends**: None

---

### Step 179.2 — Rebuild Engine & Dashboard Assets, Verify Tests & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Rebuild global engine and dashboard assets, verify all bats tests and release checks, update progress ledger.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm run release:check`
- **Depends**: 179.1
