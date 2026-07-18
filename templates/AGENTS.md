# Agent Workflow Rules

> Auto-loaded every session. Follow this order exactly.

---

## Before Starting

1. Read `.agents/PROGRESS.md`.
2. Read `.agents/RULES.md`.
3. Find the next pending step in `plan/*.md`.
4. Confirm the step has File, Action, Content, Done-check, and Depends.
5. Run `./l start X.Y`.

## Strict Loop

1. Read one step only.
2. Change the one declared file only.
3. Run the declared Done-check.
4. If it fails, fix the same file and run it once more.
5. If it fails twice, mark the step BLOCKED and stop.
6. Run `./l v`.
7. Fix validation failures without changing step scope.
8. Run `./l c X.Y "note"`.
9. Report completion and stop before the next step.

## Rules

- One step = one file = one action.
- Never skip or redo completed steps.
- Never execute `plan/drafts/`.
- Never guess missing requirements; mark BLOCKED.
- Never add features or refactors outside the step.
- Never complete a step when Done-check or `./l v` fails.

## Checkpoints

- Before risky changes: `./l cp save "description"`.
- After a complex verified step: `./l cp save "description"`.
- On failure: `./l cp back --force <tag>`.
- Checkpoint save requires `./l v` to pass.

## Completion Report

```text
Step X.Y complete — [title]
File: [path]
Done-check: passed
Validation: passed
Progress: X/Y
Next: Step X.Y — [title]
```

## Blocked Report

```text
Step X.Y BLOCKED — [title]
File: [path]
Done-check failed twice: [command]
Error: [exact output]
Required clarification: [one precise requirement]
```
