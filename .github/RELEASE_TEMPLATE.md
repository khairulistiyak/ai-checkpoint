# ai-checkpoint v{VERSION}

Git-based progress tracking for reliable AI-assisted development.

## What's New

- **Checkpoint System:** validated save, list, and non-destructive rollback
- **Validation:** plan sync, completed-file checks, and 150-line enforcement
- **RULE 0 + RULE 1:** micro-file architecture and atomic plans
- **Strict Agent Loop:** two failures mark a step BLOCKED
- **One-command Install:**
  `curl -fsSL https://raw.githubusercontent.com/khairulistiyak/ai-checkpoint/main/install.sh | bash`

## Quick Start

```bash
./l new-plan my-feature
./l start 1.1
./l v
./l c 1.1 "done"
./l cp save "feature complete"
```

## Documentation

- [60-Second Quickstart](https://github.com/khairulistiyak/ai-checkpoint#60-second-quickstart)
- [Complete Walkthrough](https://github.com/khairulistiyak/ai-checkpoint/blob/main/examples/walkthrough.md)
- [Atomic Plan Example](https://github.com/khairulistiyak/ai-checkpoint/blob/main/examples/atomic-plan-example.md)
- [Changelog](https://github.com/khairulistiyak/ai-checkpoint/blob/main/CHANGELOG.md)

## Feedback

Report issues at https://github.com/khairulistiyak/ai-checkpoint/issues.
