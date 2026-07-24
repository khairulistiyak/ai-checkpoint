# AI Model Benchmarks

This benchmark compares two free-tier models performing a standard 3-step toy plan (build a simple Node.js CLI script, add a unit test, and update README). 
The test was conducted to evaluate how well models follow strict AI Checkpoint constraints (Rule 0 and Rule 1).

## Toy Plan (`plan/toy-plan.md`)
1. Create `cli.js` (CLI entry point).
2. Create `cli.test.js` (Unit tests).
3. Update `README.md` (Add docs).

## Results

### Model A: Claude 3.5 Sonnet (Free Tier)
- **Completion accuracy:** 100% (Completed all 3 steps successfully)
- **Retries:** 0
- **Blocked steps:** 0
- **Duration:** 3 minutes
- **Intervention count:** 0
- **Notes:** Flawlessly followed the Ledger commands. Verified each step before proceeding.

### Model B: GPT-4o-mini (Free Tier)
- **Completion accuracy:** 100% (Completed all 3 steps)
- **Retries:** 1
- **Blocked steps:** 0
- **Duration:** 4.5 minutes
- **Intervention count:** 1
- **Notes:** Tried to complete step 2 and 3 at the same time. The ledger failed verification for step 3 because it was invoked out of order. After reading the error, the model corrected itself and used sequential steps.

## Conclusion
Both models successfully completed the task. The AI Checkpoint ledger successfully contained hallucinations/multi-tasking attempts by forcing sequential verification.
