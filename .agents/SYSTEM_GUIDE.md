# 🧠 AI-Checkpoint — Complete System Guide

> এই ফাইল পড়লেই যেকোনো AI model প্রজেক্টে কাজ করতে পারবে।
> প্রতি সেশনে এটা পড়ো। কোনো কিছু না বুঝলে এই ফাইলে খোঁজো।

---

## 🔵 প্রজেক্ট কী?

AI-Checkpoint হলো **AI কোডিং এজেন্টদের জন্য একটি checkpoint ও task management framework**।

এটা কী করে:
- একটা **PROGRESS.md** ফাইল ব্যবহার করে সব কাজের স্টেট ট্র্যাক করে
- **CLI কমান্ড** (`./l`) দিয়ে step start/complete/checkpoint ম্যানেজ করে
- একটা **React Dashboard** (ওয়েব UI) আছে যেখানে সব দেখা যায়
- একটা **Electron Desktop App** আছে dashboard কে wrap করে

---

## 🔵 টেকনোলজি স্ট্যাক

| কী | কী ব্যবহার হয় |
|---|---|
| **ভাষা** | JavaScript (Node.js 18+) |
| **CLI** | CommonJS (`require`) — `packages/cli/` ও `packages/core/` |
| **Dashboard Backend** | ESM (`import/export`) — Express.js — `dashboard/server.js` |
| **Dashboard Frontend** | ESM — React + Vite — `dashboard/src/` |
| **Desktop App** | CommonJS — Electron — `electron/` |
| **টেস্ট** | bats (bash test framework) — `tests/` |
| **স্টাইলিং** | Vanilla CSS — `dashboard/src/index.css` |

---

## 🔴 সবচেয়ে গুরুত্বপূর্ণ নিয়ম

### Module System (এটা ভুল করলে crash করবে!)

```
packages/cli/   → CommonJS (require/module.exports)
packages/core/  → CommonJS (require/module.exports)
dashboard/      → ESM (import/export)
electron/       → CommonJS (require/module.exports)
scripts/        → CommonJS (require/module.exports)
```

**কখনো মেশাবে না!**
- `packages/` এ `import` লিখবে না, `require()` লিখবে
- `dashboard/` এ `require()` লিখবে না, `import` লিখবে
- Dashboard থেকে core ফাইল লাগলে `createRequire` ব্যবহার করবে:
  ```js
  import { createRequire } from 'module';
  const require = createRequire(import.meta.url);
  const { someFunc } = require('../../../packages/core/some-file.js');
  ```

### 150 Line Rule

প্রতিটি ফাইল সর্বোচ্চ **150 effective lines** হবে। বেশি হলে split করো।

---

## 🔵 ফোল্ডার ম্যাপ (পুরো প্রজেক্ট)

```
ai-checkpoint/
├── .agents/                    ← Agent system state (PROGRESS, RULES, logs)
│   ├── PROGRESS.md             ← সব কাজের রেকর্ড (এটাই state file)
│   ├── RULES.md                ← কোডিং নিয়মাবলী
│   ├── AGENTS.md               ← Agent workflow instructions
│   └── activity-log.jsonl      ← File change log
│
├── plan/                       ← Plan files (step definitions)
│   ├── phase-XX-name.md        ← প্রতিটি plan ফাইল
│   └── drafts/                 ← Draft plans (NEVER auto-execute!)
│
├── packages/                   ← Source code (CommonJS)
│   ├── cli/                    ← CLI commands & utilities
│   │   ├── index.js            ← CLI entry point & command router
│   │   ├── cmd-start.js        ← `./l start X.Y` command
│   │   ├── cmd-complete.js     ← `./l c X.Y "note"` command
│   │   ├── cmd-status.js       ← `./l` or `./l status` command
│   │   ├── cmd-checkpoint.js   ← `./l cp save|list|back`
│   │   ├── cmd-health.js       ← `./l health` command
│   │   ├── cmd-quality.js      ← `./l quality` command
│   │   ├── cmd-watch.js        ← `./l watch` (live reload)
│   │   ├── cmd-sync.js         ← `./l sync` (plan → PROGRESS)
│   │   ├── cmd-run.js          ← `./l run [name]` (project run)
│   │   ├── cmd-new-plan.js     ← `./l new-plan <name>`
│   │   ├── cmd-lint-plan.js    ← `./l lint-plan`
│   │   ├── cmd-block.js        ← `./l block X.Y "reason"`
│   │   ├── cmd-projects.js     ← `./l projects`
│   │   ├── validate.js         ← `./l v` (validation)
│   │   ├── doctor.js           ← `./l doctor` (health check)
│   │   ├── colors.js           ← Terminal colors & log helpers
│   │   ├── paths.js            ← Path constants (AGENTS_DIR, etc.)
│   │   ├── parse-progress.js   ← PROGRESS.md parser
│   │   ├── progress-updater.js ← PROGRESS.md writer/updater
│   │   ├── plan-sync.js        ← Plan → PROGRESS sync logic
│   │   ├── plan-sync-utils.js  ← Plan sync helpers
│   │   ├── integrity-guard.js  ← File integrity snapshots
│   │   └── syntax-checker.js   ← Syntax check (JS/CSS/JSON/Bash)
│   │
│   └── core/                   ← Shared library (CommonJS)
│       ├── index.js            ← Barrel export (use this to import)
│       ├── health-score.js     ← Health score calculator
│       ├── quality-report.js   ← Quality report generator
│       ├── security-scanner.js ← Security pattern scanner
│       ├── workspace-scanner.js← File walker & issue finder
│       ├── auto-fixer.js       ← Auto-fix for common issues
│       ├── validate-project.js ← Project validation logic
│       ├── parse-progress.js   ← Standalone progress parser
│       ├── run-config.js       ← Project run config detector
│       ├── run-config-detect.js← Ecosystem command detector
│       ├── circular-dep-detector.js ← Circular dependency finder
│       ├── code-hygiene.js     ← Code hygiene scanner
│       ├── complexity-analyzer.js   ← Complexity analysis
│       ├── naming-checker.js   ← Naming convention checker
│       ├── structure-analyzer.js    ← Project structure analysis
│       ├── structure-cleaner.js     ← Junk file cleaner
│       ├── dep-hygiene.js      ← Dependency hygiene
│       ├── hygiene-fixer.js    ← Hygiene auto-fixer
│       └── project-config-checker.js ← Config validation
│
├── dashboard/                  ← Dashboard Web App (ESM)
│   ├── server.js               ← Express backend (port 20226)
│   ├── package.json            ← Dashboard deps (vite, react)
│   ├── vite.config.js          ← Vite build config
│   ├── src/
│   │   ├── main.jsx            ← React entry point
│   │   ├── App.jsx             ← Root app component & routing
│   │   ├── index.css           ← Global styles
│   │   ├── pages/
│   │   │   ├── HomePage.jsx    ← Main page (project grid)
│   │   │   ├── ProjectPage.jsx ← Single project view
│   │   │   └── PlansPage.jsx   ← Plans management
│   │   ├── components/         ← 39 React components (see list below)
│   │   ├── hooks/              ← Custom React hooks
│   │   │   ├── useProjects.js  ← Project data fetcher
│   │   │   ├── useFileWatcher.js ← SSE file watcher
│   │   │   ├── useHashRoute.js ← Hash-based routing
│   │   │   └── use-sidebar-reorder.js ← Sidebar DnD
│   │   ├── utils/
│   │   │   └── api.js          ← Frontend API client
│   │   └── server/             ← Backend route handlers
│   │       ├── api.js          ← Main API routes
│   │       ├── settings.js     ← Settings read/write
│   │       ├── projects.js     ← Project CRUD
│   │       ├── checkpoints.js  ← Git checkpoint routes
│   │       ├── config.js       ← RULES/AGENTS config
│   │       ├── health.js       ← Health endpoint
│   │       ├── project-health.js ← Health score handler
│   │       ├── run-config.js   ← Run config routes
│   │       ├── run-command.js  ← Safe command executor
│   │       ├── watcher.js      ← File watcher manager
│   │       ├── watcher-events.js ← File change events
│   │       ├── watcher-sse.js  ← SSE broadcast
│   │       ├── watcher-restore.js ← File restore
│   │       ├── plan-watcher.js ← Plan directory watcher
│   │       ├── plan-templates.js ← Plan template engine
│   │       ├── project-plans.js  ← Plan file API
│   │       ├── project-commands.js ← Command runner
│   │       ├── project-activity.js ← Activity log API
│   │       ├── activity-logger.js ← File activity logger
│   │       ├── activity-ignore.js ← Activity ignore patterns
│   │       ├── activity-log-rotate.js ← Log rotation
│   │       ├── ai-tier.js      ← AI model tier config
│   │       ├── parser.js       ← PROGRESS.md parser
│   │       └── settings.js     ← ~/.ai-checkpoint-dashboard/settings.json
│   └── dist/                   ← Production build output
│
├── electron/                   ← Desktop App (CommonJS)
│   ├── main.js                 ← Electron main process
│   ├── preload.js              ← Context bridge (IPC only!)
│   ├── tray.js                 ← System tray menu
│   └── updater.js              ← Auto-updater
│
├── scripts/                    ← Build & utility scripts
│   ├── ledger.cjs              ← CLI launcher (bin entry)
│   ├── build-desktop.sh        ← Electron build script
│   ├── pre-release-check.sh    ← Release validation
│   └── release.sh              ← Release automation
│
├── templates/                  ← Template files for new projects
│   ├── PROGRESS.md             ← New project progress template
│   ├── RULES.md                ← New project rules template
│   ├── AGENTS.md               ← New project agent guide
│   ├── PLAN_TEMPLATE.md        ← Plan file template
│   └── SYSTEM_GUIDE.md         ← System guide template
│
├── tests/                      ← Test files (bats)
├── l                           ← CLI shortcut (runs scripts/ledger.cjs)
├── setup.sh                    ← Project setup script
├── install.sh                  ← npm global install helper
└── package.json                ← Root package config
```

---

## 🔵 CLI কমান্ড সমূহ (সব কমান্ড)

| কমান্ড | শর্টকাট | কী করে |
|---|---|---|
| `./l` | `./l status` / `./l s` | বর্তমান status দেখায় |
| `./l start 1.1` | — | Step 1.1 শুরু করে |
| `./l c 1.1 "done"` | `./l complete` | Step 1.1 complete করে |
| `./l v` | `./l validate` | Plan + file + 150-line check |
| `./l doctor` | — | Project health check |
| `./l health` | `./l hl` | Full health scan (score/100) |
| `./l quality` | `./l q` | Code quality report |
| `./l cp save "note"` | — | Git checkpoint save |
| `./l cp list` | — | Checkpoint list দেখায় |
| `./l cp back <tag>` | — | Checkpoint এ rollback |
| `./l watch` | `./l w` | Live watch mode |
| `./l sync` | — | plan/*.md → PROGRESS.md sync |
| `./l new-plan myplan` | `./l np` | Template থেকে plan তৈরি |
| `./l lint-plan` | `./l lp` | Plan format check |
| `./l run dev` | `./l r` | Project command run |
| `./l block 1.1 "reason"` | `./l b` | Step block করে |
| `./l projects` | `./l p` | Multi-project list |
| `./l h` | `./l help` | Help দেখায় |
| `./l dash` | `./l ui` | Dashboard server start |

---

## 🔵 Dashboard API Routes

সব route `/api/` prefix ব্যবহার করে। Backend port: `20226`

| Method | Route | কী করে |
|---|---|---|
| GET | `/api/projects` | সব project list |
| POST | `/api/projects` | নতুন project add |
| DELETE | `/api/projects/:id` | Project remove |
| GET | `/api/projects/:id/progress` | Progress data |
| GET | `/api/projects/:id/health` | Health score |
| POST | `/api/projects/:id/health/autofix` | Auto-fix issues |
| GET | `/api/projects/:id/checkpoints` | Checkpoint list |
| POST | `/api/projects/:id/rollback` | Rollback to checkpoint |
| GET | `/api/projects/:id/config` | RULES/AGENTS config |
| POST | `/api/projects/:id/config` | Config update |
| GET | `/api/projects/:id/run-config` | Run commands |
| POST | `/api/projects/:id/run-config` | Save custom commands |
| GET | `/api/projects/:id/activity` | Activity log |
| GET | `/api/projects/:id/plans` | Plan files |
| POST | `/api/projects/:id/command` | Run a command |
| GET | `/api/settings` | Dashboard settings |
| PUT | `/api/settings` | Save settings |
| GET | `/api/events/:id` | SSE live updates |

---

## 🔵 Data Flow (কীভাবে কাজ করে)

```
User/AI Agent
    │
    ▼
CLI (./l start 1.1)
    │
    ├─► parse-progress.js  → PROGRESS.md পড়ে
    ├─► progress-updater.js → PROGRESS.md update করে
    ├─► integrity-guard.js  → File hash snapshot নেয়
    └─► syntax-checker.js   → Code check করে
    │
    ▼
PROGRESS.md  ← Single Source of Truth
    │
    ▼
Dashboard (React)
    │
    ├─► useProjects.js → /api/projects fetch করে
    ├─► useFileWatcher.js → SSE দিয়ে live update পায়
    └─► Components render করে
```

---

## 🔵 Settings & Config ফাইলের অবস্থান

| ফাইল | অবস্থান | কী রাখে |
|---|---|---|
| Dashboard settings | `~/.ai-checkpoint-dashboard/settings.json` | Projects list, theme, refresh |
| Project state | `.agents/PROGRESS.md` | Step progress, activity log |
| Project rules | `.agents/RULES.md` | Coding conventions |
| Agent workflow | `.agents/AGENTS.md` | Agent instructions |
| File integrity | `.agents/.integrity-snapshot.json` | File hash snapshots |
| Activity log | `.agents/activity-log.jsonl` | File change history |
| Custom run config | `.agents/run-config.json` | Custom project commands |

---

## 🔵 React Component তালিকা (Dashboard)

### Pages
| Component | কী দেখায় |
|---|---|
| `HomePage.jsx` | Project grid, global overview |
| `ProjectPage.jsx` | Single project detailed view |
| `PlansPage.jsx` | Plan files management |

### Main Components
| Component | কী করে |
|---|---|
| `ProjectGrid.jsx` | Project cards grid layout |
| `ProjectCard.jsx` | Single project card |
| `Sidebar.jsx` | Left sidebar navigation |
| `SidebarHeader.jsx` | Sidebar top section |
| `SidebarItem.jsx` | Sidebar menu item |
| `SidebarFooter.jsx` | Sidebar bottom section |
| `Header.jsx` | Top header bar |
| `PhaseView.jsx` | Phase accordion with steps |
| `StepItem.jsx` | Single step line item |
| `ProgressRing.jsx` | Circular progress indicator |
| `MetricsDashboard.jsx` | Stats cards |
| `CockpitTab.jsx` | Project cockpit |
| `CommandPalette.jsx` | Keyboard command palette |
| `LogPanel.jsx` | Activity log viewer |
| `ActivityLog.jsx` | Activity timeline |
| `GitVisualizer.jsx` | Git checkpoint visualizer |
| `ConfigEditor.jsx` | RULES/AGENTS editor |
| `HealthCommandCenter.jsx` | Health score dashboard |
| `PlansCenter.jsx` | Plans management view |
| `PlanCard.jsx` | Single plan card |
| `DeveloperActionDock.jsx` | Quick action buttons |
| `QuickTerminalDrawer.jsx` | Terminal drawer |
| `GlobalOverview.jsx` | Multi-project overview |
| `ProjectTabBar.jsx` | Project page tab bar |
| `ProjectTabsContent.jsx` | Tab content switcher |

### Modals
| Component | কী করে |
|---|---|
| `AddProjectModal.jsx` | New project add form |
| `ConfirmModal.jsx` | Yes/No confirmation |
| `SettingsModal.jsx` | App settings |
| `ProgressDeleteWarningModal.jsx` | Delete warning |
| `AppModals.jsx` | Modal container |
| `AiTierSelector.jsx` | AI model tier picker |

### Utilities
| Component | কী করে |
|---|---|
| `ErrorBoundary.jsx` | React error boundary |
| `ThemeProvider.jsx` | Dark/light theme |
| `ToastProvider.jsx` | Toast notifications |
| `ExportButton.jsx` | Export functionality |
| `UpdateNotification.jsx` | Auto-update notice |
| `InitializingView.jsx` | Loading screen |
| `NotInitializedView.jsx` | Setup required screen |
| `AuditRulesTab.jsx` | Rules audit view |

---

## 🔵 Electron App কীভাবে কাজ করে

```
electron/main.js (main process)
    │
    ├─► dashboard/server.js import করে → embedded server start করে
    ├─► BrowserWindow তৈরি করে → server URL load করে
    ├─► electron/tray.js → system tray menu তৈরি করে
    ├─► electron/updater.js → auto-update check করে
    │
    └─► electron/preload.js (renderer bridge)
         │
         ├─► contextBridge দিয়ে safe API expose করে
         ├─► সব কিছু IPC দিয়ে যায় (direct shell access নেই)
         └─► window.electronAPI object renderer এ available
```

**Electron IPC Channels:**
| Channel | Direction | কী করে |
|---|---|---|
| `app:version` | renderer → main | App version return |
| `shell:open-external` | renderer → main | URL open (http/https only) |
| `window:minimize` | renderer → main | Window minimize |
| `window:maximize` | renderer → main | Window maximize/restore |
| `window:close` | renderer → main | Window close/hide |
| `updater:download` | renderer → main | Download update |
| `updater:install` | renderer → main | Install update |
| `update-available` | main → renderer | Update notification |
| `update-downloaded` | main → renderer | Download complete |

---

## 🔴 যা করা যাবে না (Danger Zone)

1. **`packages/` ফোল্ডারে `import/export` লিখবে না** — শুধু `require/module.exports`
2. **`dashboard/` ফোল্ডারে `require()` লিখবে না** — শুধু `import/export`
3. **`.agents/PROGRESS.md` এর format ভাঙবে না** — এটা CLI parser পড়ে
4. **কোনো ফাইল 150 লাইনের বেশি করবে না** — split করো
5. **`plan/drafts/` এর ফাইল auto-execute করবে না**
6. **`.agents/`, `.git/`, secret files সরাসরি edit করবে না** — CLI দিয়ে করো
7. **`eval()` ব্যবহার করবে না** — security scanner flag করবে
8. **debug `console.log` রাখবে না** — production code এ
9. **`shell: true` ব্যবহার করবে না** — `execFile` বা `execFileSync` ব্যবহার করো
10. **barrel export (`index.js`) এর নাম source file এর নামের সাথে মিলাও** — না মিলালে `undefined` হবে

---

## 🔵 নতুন ফাইল তৈরির template

### CLI Command (packages/cli/)
```js
const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH } = require('./paths.js');
const { log } = require('./colors.js');

function myNewCommand(arg1) {
  // command logic
  log.success('Done');
}

module.exports = { myNewCommand };
```

### Core Module (packages/core/)
```js
const fs = require('fs');
const path = require('path');

function myFunction(projectPath) {
  // logic
  return { result: true };
}

module.exports = { myFunction };
```

### Dashboard Server Route (dashboard/src/server/)
```js
import express from 'express';
import { getSettings } from './settings.js';

const router = express.Router();

router.get('/projects/:id/my-route', (req, res) => {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    // logic
    res.json({ data: 'result' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
```

### React Component (dashboard/src/components/)
```jsx
import { useState } from 'react';

export default function MyComponent({ data, onAction }) {
  const [state, setState] = useState(null);
  return (
    <div className="my-component">
      {/* JSX */}
    </div>
  );
}
```

---

## 🔵 Build & Run Commands

| কাজ | কমান্ড | কোথায় চালাবে |
|---|---|---|
| CLI চালাও | `./l` | root (`/`) |
| Dashboard dev | `cd dashboard && npm run dev` | root |
| Dashboard build | `cd dashboard && npm run build` | root |
| Electron dev | `npm run electron:dev` | root |
| Electron build (mac) | `npm run electron:build:mac` | root |
| Electron build (all) | `npm run electron:build:all` | root |
| Tests চালাও | `npm test` | root |
| Validate | `./l v` | root |
| Health check | `./l doctor` | root |

---

## 🔵 PROGRESS.md Format

```markdown
# Progress Tracker

## Project
| Key | Value |
|-----|-------|
| Project | ai-checkpoint Pro v1.0 |
| Started | 2026-07-18 |

## 📊 Overall Progress: 75% (30/40 steps complete)
[████████████████░░░░] 75% (30/40 steps complete)

## 👉 NEXT: Step 5.1 — Add login page

## 🔷 Phase 1: Setup — ✅ 100% COMPLETE
- [x] **Step 1.1** — Create project (`package.json`)
- [x] **Step 1.2** — Add CLI (`cli/index.js`)

## 🔷 Phase 5: Auth — 🔄 IN PROGRESS
- [x] **Step 5.1** — Add login form (`LoginPage.jsx`)
- [ ] **Step 5.2** — Add auth API (`auth.js`)
- [~] **Step 5.3** — Running: Add session (`session.js`)
```

**Step Status Icons:**
| Mark | মানে |
|---|---|
| `[x]` | ✅ Complete |
| `[ ]` | ⬜ Pending |
| `[~]` | 🔄 Running |
| `[!]` | 🚫 Blocked |

---

## 🔵 Import Rules (কোন ফাইল কোথা থেকে import করবে)

### packages/cli/ থেকে:
```js
// নিজের ফাইল
const { log } = require('./colors.js');
const { PROGRESS_PATH } = require('./paths.js');

// core ফাইল (সরাসরি)
const { calculateHealth } = require('../core/health-score.js');

// core barrel (index.js দিয়ে)
const { scanWorkspace } = require('../core/index.js');
```

### dashboard/src/server/ থেকে:
```js
// নিজের ফাইল (ESM)
import { getSettings } from './settings.js';
import { runCommand } from './run-command.js';

// core ফাইল (CJS → ESM bridge)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { calculateHealth } = require('../../../packages/core/health-score.js');
```

### dashboard/src/components/ থেকে:
```jsx
// React
import { useState, useEffect } from 'react';
// নিজের utils
import * as api from '../utils/api';
// নিজের hooks
import { useProjects } from '../hooks/useProjects';
```

---

_Last Updated: 2026-08-11_
_This file should be updated when new modules are added._
