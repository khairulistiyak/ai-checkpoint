# Phase 90: Deep Code Health & Rule 0 Remediation
**Status**: NOT STARTED
**Description**: Resolve all Rule 0 (>150 lines) violations, trailing whitespaces, complexity, and structural duplications across the codebase to achieve 100% Health Score.

---

## Technical Architecture

### 1. Rule 0 Micro-File Decompositions (<= 150 lines)
- `dashboard/src/components/health/HealthIssueExplorer.jsx` (161 lines) -> Split out `HealthIssueCard.jsx` (~65 lines) and `HealthIssueFilterBar.jsx` (~60 lines).
- `dashboard/src/components/intelligence/AdvancedHUDV1.jsx` (156 lines) -> Extract `AdvancedHUDScoreRing.jsx` and strip all trailing whitespaces.
- `dashboard/src/server/api.js` (161 lines) -> Delegate endpoint handlers into micro-controllers to ensure strict compliance.

### 2. Hygiene & Whitespace Cleanup
- Clean trailing whitespace from `ProjectGrid.jsx` and `AdvancedHUDV1.jsx`.

### 3. Complexity Optimization
- Flatten branching in `StatusBadge.jsx`, `parse-plan-content.js`, `cmd-start.js`, and `cmd-complete.js`.

---

## Step-by-Step Implementation Plan

### Step 90.1: Health Issue Explorer Decomposition
**Files**:
- `dashboard/src/components/health/HealthIssueCard.jsx`
- `dashboard/src/components/health/HealthIssueExplorer.jsx`

### Step 90.2: AdvancedHUDV1 Modularization & Hygiene
**Files**:
- `dashboard/src/components/intelligence/AdvancedHUDScoreRing.jsx`
- `dashboard/src/components/intelligence/AdvancedHUDV1.jsx`

### Step 90.3: Server API Micro-Router Split
**Files**:
- `dashboard/src/server/api-helpers.js`
- `dashboard/src/server/api.js`

### Step 90.4: Code Hygiene & Complexity Polish
**Files**:
- `dashboard/src/components/ProjectGrid.jsx`
- `dashboard/src/components/ui/StatusBadge.jsx`
- `dashboard/src/server/project-commands.js`

### Step 90.5: Full System Health & Validation Verification
**Files**:
- `packages/core/health-scanner.js`
- Verify 0 Rule 0 violations and 90%+ Health Score.
