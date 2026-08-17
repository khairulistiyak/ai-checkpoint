# Phase 86: Instant Plan-to-Roadmap & Steps Live Synchronization

## Summary
নতুন `.md` প্ল্যান ফাইল তৈরি বা এডিট করা মাত্রই কোনো ম্যানুয়াল সিঙ্ক বা রিফ্রেশ ছাড়াই ড্যাশবোর্ডের **Roadmap & Steps**, **PhaseView**, এবং **Cockpit**-এ রিয়েল-টাইমে ফেজ এবং সমস্ত স্টেপস দৃশ্যমান করা।

---

## Steps

### packages/cli/ — Robust Universal Plan Parser

- [ ] 86.1 Enhance `packages/cli/plan-sync-utils.js`
  - Support universal phase matchers: `# Phase X:`, `## Phase X:`, `# [Phase X]`, and filename fallback (`phase-83-...md`)
  - Support universal step matchers: `- [ ] X.Y Title`, `- [ ] **Step X.Y** — Title`, `### Step X.Y — Title`, `#### Step X.Y`, `### X.Y: Title`
  - Clean extraction of step numbers, titles, and target files
  - Under 150 lines rule

### dashboard/src/server/ — Real-Time Auto-Sync Engine

- [ ] 86.2 Update `dashboard/src/server/plan-sync-server.js`
  - Enhance `syncPlanToProgress` with robust error handling and multi-format parser support
  - Ensure zero duplication and preserve existing completed/running status

- [ ] 86.3 Update `dashboard/src/server/watcher-events.js`
  - On `plan/*.md` change: trigger `syncPlanToProgress` automatically
  - Broadcast both `plan-updated` and `progress-updated` via SSE for zero-latency UI re-render

- [ ] 86.4 Update `dashboard/src/server/project-plans.js`
  - On `handleSavePlanFile`: immediately trigger `syncPlanToProgress`
  - Return `{ success: true, synced: true }`

### dashboard/src/server/ — On-The-Fly Resilient Parser

- [ ] 86.5 Update `dashboard/src/server/parser.js`
  - In `enrichProject(p)`: if plan files exist with phases not yet in `progress.phases`, dynamically merge them with 0% pending status
  - Guarantees 100% instant visibility in Roadmap and Cockpit even before disk write completes

### Verification

- [ ] 86.6 Full Verification & Live Test
  - Verify parsing of Phase 83, 84, 85
  - Test auto-sync on new file creation
  - Run `./l v` and `./l health` (100/100)
  - Verify dashboard build
