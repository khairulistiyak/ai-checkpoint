# Release Notes: v1.0.0

## AI Behavior Impact
- Strictly enforces validation gates preventing AI from skipping or combining steps.
- Introduces line limit restrictions (150 lines) forcing AI to write modular, micro-file architecture code.
- Prevents destruction of wildcard and protected files.

## Human Workflow Impact
- Provides visual Vue 3 dashboard (`npm run dev`) for monitoring project progress.
- Simple installation and setup process.
- Introduces non-destructive `checkpoint` and rollback workflows.

## Upgrade Instructions
To upgrade from an older ledger version:
1. Run `bash setup.sh` to update the `l` binary.
2. Run `./l doctor` to verify compatibility with existing `.agents/PROGRESS.md` state.
3. No manual migration of ledger files is required.
