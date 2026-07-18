# Changelog

All notable changes to ai-checkpoint are documented here.

This project follows Keep a Changelog and Semantic Versioning.

## [Unreleased]

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

### Changed
- Step completion now requires validation.
- Setup preserves existing project-managed templates.

## [0.1.0] - 2026-07-11

### Added
- Initial dashboard and progress tracker.
- Project setup script and templates.

[Unreleased]: https://github.com/khairulistiyak/ai-checkpoint/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/khairulistiyak/ai-checkpoint/releases/tag/v0.1.0
