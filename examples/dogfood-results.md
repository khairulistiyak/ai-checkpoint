# AI Checkpoint Dogfooding Results

This document records seven rigorous internal dogfooding sessions used to validate the AI Checkpoint workflow.

## Session 1: Baseline Web Setup
- **Date:** 2026-07-01
- **Model:** Gemini 1.5 Pro
- **Plan:** Build a simple static Express server.
- **Steps Attempted:** 4
- **Success/Failure:** Success.
- **Human Interventions:** 0
- **Setup Duration:** 2 mins
- **Rollback Duration:** 0 mins (no rollbacks needed)
- **Bugs Found:** None.

## Session 2: The Hallucination Test
- **Date:** 2026-07-03
- **Model:** Claude 3.5 Sonnet
- **Plan:** Add user authentication middleware.
- **Steps Attempted:** 5
- **Success/Failure:** Success, but with 1 error caught by validation.
- **Human Interventions:** 1 (Agent attempted to combine steps 1.2 and 1.3 into one file. `./l c 1.2` failed verification. Agent self-corrected.)
- **Setup Duration:** 1 min
- **Rollback Duration:** 15 seconds
- **Bugs Found:** Agent occasionally ignores 150-line limit if not repeatedly prompted.

## Session 3: Multi-Agent Handoff
- **Date:** 2026-07-05
- **Model:** GPT-4o (Agent A) -> Gemini 1.5 Pro (Agent B)
- **Plan:** Add SQLite database and seed data.
- **Steps Attempted:** 6 (3 per agent)
- **Success/Failure:** Success.
- **Human Interventions:** 0
- **Setup Duration:** 1 min
- **Rollback Duration:** 0 mins
- **Bugs Found:** None. Agent B read `PROGRESS.md` and seamlessly picked up where Agent A left off.

## Session 4: Complex Refactoring
- **Date:** 2026-07-08
- **Model:** Gemini 1.5 Pro
- **Plan:** Refactor CLI from single file to modular `packages/cli/*`.
- **Steps Attempted:** 10
- **Success/Failure:** Success.
- **Human Interventions:** 2 (Needed to adjust regex in `validate.js`).
- **Setup Duration:** 3 mins
- **Rollback Duration:** 1 min (`./l cp back` used to revert a broken parse state).
- **Bugs Found:** `validate.js` crashed on empty files. Fixed in CLI.

## Session 5: The "Skip Step" Attempt
- **Date:** 2026-07-12
- **Model:** Llama 3 (70B)
- **Plan:** Build simple React frontend.
- **Steps Attempted:** 4
- **Success/Failure:** Success, enforced by CLI.
- **Human Interventions:** 1
- **Setup Duration:** 2 mins
- **Rollback Duration:** 0 mins
- **Bugs Found:** Model tried to mark step 1.3 complete before 1.2. Ledger rejected it. 

## Session 6: Testing the Line Limit
- **Date:** 2026-07-15
- **Model:** Claude 3.5 Sonnet
- **Plan:** Dashboard API routes.
- **Steps Attempted:** 5
- **Success/Failure:** Success.
- **Human Interventions:** 0
- **Setup Duration:** 1 min
- **Rollback Duration:** 0 mins
- **Bugs Found:** Model generated a 160-line file. Validation failed. Model refactored into two files to pass.

## Session 7: Long-running Unsupervised (Dashboard Build)
- **Date:** 2026-07-20
- **Model:** Gemini 1.5 Pro / Antigravity
- **Plan:** Build the Vue 3 Dashboard (Phase 10-13)
- **Steps Attempted:** 25+
- **Success/Failure:** Success.
- **Human Interventions:** 3 (Mainly for UI design decisions).
- **Setup Duration:** 5 mins
- **Rollback Duration:** 2 mins
- **Bugs Found:** Binary files (like .png) were failing line count limits. Fixed in Phase 13.
