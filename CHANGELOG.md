# Changelog

All notable changes to ai-checkpoint are documented here.

This project follows Keep a Changelog and Semantic Versioning.

## [Unreleased]

## [1.0.1] - 2026-08-23

### Added
- Electron desktop app with tray icon, auto-updater, and native folder picker.
- Real-time analytics telemetry engine with live dashboard.
- Intelligence Hub with radar chart, smart insights, and HUD.
- Worker-thread scanner with caching for zero-freeze health checks.
- `setup.sh` now installs `l` CLI wrapper automatically.
- CLI auto-run entry point (`require.main === module`).
- Release gate verification script.

### Fixed
- Health score raised to 100/100 — zero Rule 0 violations.
- All 42 diagnostic issues resolved (Phase 95).
- BATS test suite restored to 31/31 passing.
- Removed ghost duplicate directories (`server/server`, `electron/electron`).
- Empty catch blocks replaced with safe `void err`.
- macOS `._*` junk files cleaned and gitignored.

### Changed
- Extracted reusable hooks (`useTelemetryReporter`, `useAppShortcuts`).
- Decomposed oversized components (`IssueCard`, `HUDCoreBalance`).
- Split `api.js`, `global-store.js` into focused modules.

## [1.0.0] - 2026-07-24

### Added
- `doctor` project health checks.
- Validation gates for completed files, plan sync, and 150-line limits.
- Git checkpoint save, list, and non-destructive rollback commands.
- RULE 0 micro-file architecture template.
- RULE 1 atomic-step template.
- `new-plan` template generator.
- Strict two-attempt agent workflow.
- One-command installer and idempotent setup.
- Atomic examples, walkthrough, and macOS/Linux CI.
- Full BATS test coverage for CLI commands.
- React + Vite visual dashboard on port 20226.

### Changed
- CLI micro-file refactor: Refactored single-file `ledger.cjs` into modular `packages/cli/*`.
- Step completion now requires validation.
- Setup preserves existing project-managed templates.

### Known Limitations
- The dashboard `npm run dev` and Express backend currently run in the same process, lacking a daemonizer.
- Strict 150-line file limits are enforced, which may require artificial splitting of complex logic.

## [0.1.0] - 2026-07-11

### Added
- Initial dashboard and progress tracker.
- Project setup script and templates.

[Unreleased]: https://github.com/khairulistiyak/ai-checkpoint/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/khairulistiyak/ai-checkpoint/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/khairulistiyak/ai-checkpoint/releases/tag/v0.1.0
