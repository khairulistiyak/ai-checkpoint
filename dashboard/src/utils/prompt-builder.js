/**
 * dashboard/src/utils/prompt-builder.js
 * Universal Zero-Regression & Non-Breaking AI Prompt Generator (Client-Side)
 */

export function buildSurgicalFixPrompt(opts = {}) {
  const { file = 'Project root', line = 'N/A', severity = 'warning', type = 'diagnostic', message = '', guidance = '' } = opts;
  return [
    `# [CRITICAL INSTRUCTION: ZERO REGRESSION & SURGICAL FIX]`,
    `You are tasked with fixing a specific code issue without introducing regressions or altering existing functionality.`,
    ``,
    `## 🎯 Target Information:`,
    `- File: \`${file}\``,
    `- Line: ${line}`,
    `- Issue Type: [${(severity || 'warning').toUpperCase()}] ${type}`,
    `- Diagnosis: ${message}`,
    guidance ? `- Recommended Approach: ${guidance}` : '',
    ``,
    `## 🛡️ Strict Non-Breaking Rules (MANDATORY):`,
    `1. CONTRACT PRESERVATION: Do NOT modify function signatures, exported names, component props, or return types. Only fix internal implementation.`,
    `2. SURGICAL EDIT: Touch ONLY the offending lines or helper. Do NOT rewrite unrelated code or entire files.`,
    `3. ZERO DEPENDENCIES: Do NOT add new npm dependencies or third-party packages.`,
    `4. RULE 0 COMPLIANCE: The target file must remain strictly <= 150 lines and cyclomatic complexity <= 4.`,
    `5. TEST VERIFICATION: Before completing, verify your fix with \`./l v && npm test\`. Revert immediately if any test fails.`
  ].filter(Boolean).join('\n');
}

export function buildBulkIssuesPrompt(opts = {}) {
  const { category = 'All', issues = [] } = opts;
  const issueLines = issues.map((iss, i) => {
    const loc = iss.file ? `${iss.file}${iss.line ? `:${iss.line}` : ''}` : 'Project file';
    const severity = (iss.severity || 'warning').toUpperCase();
    const type = iss.type || iss.category || category || 'issue';
    const msg = iss.message || iss.error || iss.msg || 'Diagnostic issue detected';
    const guidance = iss.guidance || '';
    return `${i + 1}. [${severity}] \`${loc}\` — ${type}: ${msg}${guidance ? ` (Guidance: ${guidance})` : ''}`;
  }).join('\n');

  return [
    `# [BULK SURGICAL REMEDIATION: CATEGORY ${category.toUpperCase()}]`,
    `Please resolve the following ${issues.length} issues sequentially using strict zero-regression standards:`,
    ``,
    `## 🛡️ Global Non-Breaking Rules (MANDATORY):`,
    `1. CONTRACT PRESERVATION: Do NOT modify function signatures, exported names, component props, or return types. Only fix internal implementation.`,
    `2. SURGICAL EDIT: Touch ONLY the offending lines. Do NOT rewrite unrelated code or entire files.`,
    `3. ZERO DEPENDENCIES: Do NOT add new npm dependencies or third-party packages.`,
    `4. RULE 0 COMPLIANCE: Every target file must remain strictly <= 150 lines and cyclomatic complexity <= 4.`,
    `5. STEP-BY-STEP VERIFICATION: After fixing each file, run \`./l v && npm test\`. Revert immediately if anything fails.`,
    ``,
    `## 🔍 Issues to Resolve (${issues.length}):`,
    issueLines || 'No issues found in this category.'
  ].join('\n');
}

export function buildDiagnosticReportPrompt(opts = {}) {
  const { projectId = 'Current Project', score = 100, healthScore = 100, qualityScore = 100, passed = true, filesScanned = 0, issues = [], breakdown = {} } = opts;
  const issueLines = issues.map((iss, i) => {
    const loc = iss.file ? `${iss.file}${iss.line ? `:${iss.line}` : ''}` : 'Project root';
    return `${i + 1}. [${(iss.severity || 'warning').toUpperCase()}] \`${loc}\` — ${iss.error || iss.msg || iss.message || iss.type}`;
  }).join('\n');

  return [
    `# AI Checkpoint System Diagnostic Report`,
    `Project ID: ${projectId} | Health Score: ${score}/100 (Health: ${healthScore}%, Quality: ${qualityScore}%)`,
    `Status: ${passed ? 'PASSED ✅' : 'ISSUES DETECTED ⚠️'} | Files Scanned: ${filesScanned}`,
    ``,
    `## 📊 Issue Breakdown:`,
    `- Security Warnings / Critical: ${(breakdown.criticalSecurity || 0) + (breakdown.warningSecurity || 0)}`,
    `- Rule 0 Violations (>150 lines): ${breakdown.rule0Violations || 0}`,
    `- Syntax Errors / Broken Imports: ${(breakdown.syntaxErrors || 0) + (breakdown.brokenImports || 0)}`,
    `- Hygiene / Clutter: ${breakdown.hygieneIssues || 0}`,
    `- Complexity / DRY Issues: ${(breakdown.complexityIssues || 0) + (breakdown.structureIssues || 0)}`,
    ``,
    `## 🔍 Detected Issues (${issues.length}):`,
    issueLines || 'No issues detected.',
    ``,
    `## 🛡️ Global Execution Protocol:`,
    `1. Execute 1 issue at a time sequentially.`,
    `2. Do NOT break existing component interfaces, function parameters, or exports.`,
    `3. Verify every modification with \`./l v && npm test\`.`,
    `4. Keep all edited files strictly under 150 lines.`
  ].join('\n');
}

export function buildStepExecutionPrompt(opts = {}) {
  const { stepNumber = 'X.Y', title = 'Step Title', filePath = '', projectPath = '', status = 'pending', doneCheck = '' } = opts;
  return [
    `# [AI AGENT TASK: STEP ${stepNumber}]`,
    `Execute Step ${stepNumber} — ${title}`,
    ``,
    `## 📁 Context:`,
    `- Project Root: ${projectPath || 'Current Workspace'}`,
    `- Target File: \`${filePath || 'Check plan/*.md'}\``,
    `- Current Status: ${status === 'running' ? 'In Progress ⏳' : 'Pending 📋'}`,
    doneCheck ? `- Declared Done-Check: \`${doneCheck}\`` : '',
    ``,
    `## ⚙️ Standard Operating Procedure (SOP):`,
    `1. Start step: \`./l start ${stepNumber}\``,
    `2. Modify ONLY the declared target file (\`${filePath || 'target file'}\`).`,
    `3. Run done-check command and project validation: \`./l v && npm test\`.`,
    `4. Commit step completion: \`./l c ${stepNumber} "Completed: ${title}"\`.`,
    `5. Strictly enforce Rule 0 (<= 150 lines per file).`
  ].filter(Boolean).join('\n');
}
