# Phase 35: AI Page Structured Workflow Overhaul

## Goal
Transform the AI Plan Builder (`PlanGeneratorTab.jsx`) into an organized step-by-step numbered workflow (`01 Plan Identifier`, `02 Goal & Scope Description`, `03 Model Autonomy Tier`), removing unnecessary badges and clutter for a pristine Apple Studio minimal aesthetic.

## Proposed Changes

### Step 35.1 — Refactor PlanGeneratorTab.jsx into an organized 3-step numbered workflow
- **File**: `dashboard/src/components/plans/PlanGeneratorTab.jsx`

- Refactor the form layout into 3 explicit numbered steps with clean `01`, `02`, `03` step badges.
- Remove unnecessary badges like `RULE 1 Spec Engine` and simplify header messaging.
- Ensure line count is under 150 lines and zero visual clutter.

## Verification Plan
- Run `npm run build` in `dashboard/` to verify clean build.
- Check line length and syntax.
