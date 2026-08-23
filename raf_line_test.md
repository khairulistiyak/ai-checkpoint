# [CRITICAL INSTRUCTION: ZERO REGRESSION & SURGICAL FIX]
You are tasked with fixing a specific code issue without introducing regressions or altering existing functionality.
## 🎯 Target Information:
- File: `/Volumes/SSD/0.1/ai-checkpoint/dashboard/src/components/AddProjectModal.jsx`
- Line: N/A
- Issue Type: [A11Y] a11y
- Diagnosis: Found 1 clickable <div/span> tag(s) missing 'role' or 'tabIndex'. Use a <button> or add ARIA attributes.
- Recommended Approach: Add missing ARIA attributes, semantic roles, or keyboard navigation
## 🛡️ Strict Non-Breaking Rules (MANDATORY):
1. CONTRACT PRESERVATION: Do NOT modify function signatures, exported names, component props, or return types. Only fix internal implementation.
2. SURGICAL EDIT: Touch ONLY the offending lines or helper. Do NOT rewrite unrelated code or entire files.
3. ZERO DEPENDENCIES: Do NOT add new npm dependencies or third-party packages.
4. RULE 0 COMPLIANCE: The target file must remain strictly <= 150 lines and cyclomatic complexity <= 4.
5. TEST VERIFICATION: Before completing, verify your fix with `./l v && npm test`. Revert immediately if any test fails.