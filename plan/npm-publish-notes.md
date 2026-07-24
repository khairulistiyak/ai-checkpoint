# NPM Publish Dry-Run Notes

## Output of `npm publish --dry-run`

```text
npm warn publish npm auto-corrected some errors in your package.json when publishing.  Please run "npm pkg fix" to address these errors.
npm warn publish errors corrected:
npm warn publish "bin[ai-checkpoint]" script name was cleaned
npm notice
npm notice 📦  ai-checkpoint@1.0.0
npm notice Tarball Contents
npm notice 1.1kB LICENSE
npm notice 8.0kB README.md
... (truncated for brevity, but all essential files are included) ...
npm notice 192B scripts/ledger.cjs
npm notice 1.8kB scripts/pre-release-check.sh
npm notice 1.2kB scripts/release.sh
npm notice 1.5kB templates/AGENTS.md
npm notice 169B templates/drafts-README.md
npm notice 1.3kB templates/PLAN_TEMPLATE.md
npm notice 527B templates/PROGRESS.md
npm notice 2.7kB templates/RULES.md
npm notice 1.5kB templates/SYSTEM_GUIDE.md
npm notice 1.2kB templates/vscode-tasks.json
npm notice Tarball Details
npm notice name: ai-checkpoint
npm notice version: 1.0.0
npm notice package size: 570.7 kB
npm notice unpacked size: 801.0 kB
npm notice total files: 79
npm notice
+ ai-checkpoint@1.0.0
```

## Package Contents Verified
- `packages/` (CLI and Core logic)
- `templates/` (Markdown templates and tasks)
- `dashboard/` (React dashboard app)
- `scripts/` (Ledger runner and bash scripts)
- `README.md` and `LICENSE`

## Install Verification Steps
1. Once published, a user runs: `npm install -g ai-checkpoint`
2. Run `ai-checkpoint` to verify it loads the CLI.
3. In a new folder, run `ai-checkpoint init` (to be added) or the standard curl script to initialize the `.agents` structure.
4. Verify `ai-checkpoint status` works without errors.
