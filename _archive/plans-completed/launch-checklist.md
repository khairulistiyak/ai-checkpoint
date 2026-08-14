# Launch Checklist for v1.0.0

## Pre-Launch

- [ ] Phase 1-4 complete; `./l v` passes
- [ ] One-week dogfood completed; issues recorded and fixed
- [ ] `scripts/pre-release-check.sh` passes on macOS and Linux CI
- [ ] Fresh-directory installer test passes
- [ ] README, walkthrough, examples, and changelog reviewed
- [ ] LICENSE and social preview verified
- [ ] GitHub description and topics configured

## Release Day

- [ ] Run `scripts/pre-release-check.sh`
- [ ] Run `scripts/release.sh 1.0.0`
- [ ] Push `main` and `v1.0.0`
- [ ] Create GitHub release from `.github/RELEASE_TEMPLATE.md`
- [ ] Test the published curl installer in a clean repository

## Show HN

**Title:** ai-checkpoint – Atomic plans and checkpoints for AI-assisted coding

Explain the two constraints: files stay below 150 effective lines; every plan step names one file, action, and runnable Done-check. Link the repository and walkthrough.

## r/LocalLLaMA

**Title:** [Tool] Make small coding models reliable with micro-files and atomic steps

Describe the validation gate, two-attempt BLOCKED workflow, and non-destructive Git rollback. Include the free-tier model dogfood result.

## Post-Launch

- [ ] Monitor issues for seven days
- [ ] Record install time and first-step completion time
- [ ] Collect three user workflows
- [ ] Plan v1.1 only from observed friction

## Success Metrics

- Setup to first completed step under five minutes
- Ten successful external users
- Five community issues or pull requests
- Three published testimonials
