/**
 * packages/core/prompt-generator.js
 * Universal Zero-Regression & Non-Breaking AI Prompt Generator Engine
 */

function buildSurgicalFixPrompt(opts = {}) {
  const { file = 'Project root', line = 'N/A', severity = 'warning', type = 'diagnostic', message = '', guidance = '' } = opts;
  return [
    `# [CRITICAL INSTRUCTION: ZERO REGRESSION & SURGICAL FIX]`,
    `You are tasked with fixing a specific code issue without introducing regressions or altering existing functionality.`,
    ``,
    `## 🎯 Target Information:`,
    `- File: \`${file}\``,
    `- Line: ${line}`,
    `- Issue Type: [${severity.toUpperCase()}] ${type}`,
    `- Diagnosis: ${message}`,
    guidance ? `- Guidance: ${guidance}` : '',
    ``,
    `## 🛡️ Strict Non-Breaking Rules (MANDATORY):`,
    `1. CONTRACT PRESERVATION: Do NOT modify function signatures, exported names, component props, or return types. Only fix internal implementation.`,
    `2. SURGICAL EDIT: Touch ONLY the offending lines or helper. Do NOT rewrite unrelated code or entire files.`,
    `3. ZERO DEPENDENCIES: Do NOT add new npm dependencies or third-party packages.`,
    `4. RULE 0 COMPLIANCE: The target file must remain strictly <= 150 lines and cyclomatic complexity <= 4.`,
    `5. TEST VERIFICATION: Before completing, verify your fix with \`./l v && npm test\`. Revert immediately if any test fails.`
  ].filter(Boolean).join('\n');
}

function buildDiagnosticReportPrompt(opts = {}) {
  const { projectId = 'Current Project', score = 100, healthScore = 100, qualityScore = 100, passed = true, filesScanned = 0, issues = [], breakdown = {} } = opts;
  const issueLines = issues.map((iss, i) => {
    const loc = iss.file ? `${iss.file}${iss.line ? `:${iss.line}` : ''}` : 'Project root';
    return `${i + 1}. [${(iss.severity || 'warning').toUpperCase()}] ${loc} — ${iss.error || iss.msg || iss.message || iss.type}`;
  }).join('\n');

  return [
    `# AI Checkpoint System Diagnostic Report`,
    `Project ID: ${projectId}`,
    `Overall Health Score: ${score}/100 (Health: ${healthScore}%, Quality: ${qualityScore}%)`,
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
    `## 🛡️ Execution Protocol for AI Assistant:`,
    `1. Execute 1 issue at a time per atomic step.`,
    `2. Do NOT break existing component interfaces, function parameters, or exports.`,
    `3. Verify every modification with \`./l v && npm test\`.`,
    `4. Keep all edited files strictly under 150 lines.`
  ].join('\n');
}

function buildStepExecutionPrompt(opts = {}) {
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

function buildRefactorPrompt(opts = {}) {
  const { targetFile = '', guidance = '', proposedContent = '', sourceFiles = [] } = opts;
  return [
    `# [SURGICAL REFACTOR PROPOSAL: DRY CONSOLIDATION]`,
    guidance ? `Goal: ${guidance}` : 'Consolidate duplicated logic into a shared helper module.',
    ``,
    `- Target File: \`${targetFile}\``,
    sourceFiles.length > 0 ? `- Sources: ${sourceFiles.join(', ')}` : '',
    ``,
    `## Proposed Shared Content:`,
    '```javascript',
    proposedContent,
    '```',
    ``,
    `## Rules:`,
    `1. Ensure existing call sites in source files remain fully functional without API breakage.`,
    `2. Keep target file <= 150 lines.`,
    `3. Validate with \`./l v && npm test\`.`
  ].filter(Boolean).join('\n');
}

module.exports = {
  buildSurgicalFixPrompt,
  buildDiagnosticReportPrompt,
  buildStepExecutionPrompt,
  buildRefactorPrompt
};
