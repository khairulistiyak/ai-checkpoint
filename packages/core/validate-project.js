const fs = require('fs');
const path = require('path');

function findFileRecursively(dir, fileName, depth = 0) {
  if (depth > 10) return null;
  let files;
  try { files = fs.readdirSync(dir); } catch { return null; }
  for (const file of files) {
    const fullPath = path.join(dir, file);
    let stat;
    try { stat = fs.lstatSync(fullPath); } catch { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) {
      if (['node_modules', 'dist', '.git', '.agents', 'plan'].includes(file)) continue;
      const found = findFileRecursively(fullPath, fileName, depth + 1);
      if (found) return found;
    } else if (file === fileName) return fullPath;
  }
  return null;
}

function verifyTargetFileCore(stepTitle, cwd) {
  const fileMatches = stepTitle.match(/[`(]([^`)]+\.(?:tsx|ts|css|js|json|jsx|md|sh|yml|cjs))[`)]/);
  if (!fileMatches) return { verified: true };
  const targetName = fileMatches[1].trim();
  let absPath = path.join(cwd, targetName);
  if (!fs.existsSync(absPath)) {
    const srcDir = path.join(cwd, 'src');
    const foundPath = fs.existsSync(srcDir) ? findFileRecursively(srcDir, path.basename(targetName)) : null;
    if (foundPath) absPath = foundPath;
    else return { verified: false, error: `❌ target file "${targetName}" does not exist.` };
  }
  const stats = fs.statSync(absPath);
  if (stats.size === 0) return { verified: false, error: `❌ target file "${targetName}" is empty.` };
  if (stats.size < 10) return { verified: false, error: `❌ target file "${targetName}" has no meaningful content.` };
  return { verified: true, path: absPath };
}

function extractFileFromTitle(title) {
  const m = title.match(/[`(]([^`)]+\.[a-zA-Z0-9]+)[`)]/);
  return m ? m[1].replace(/^\.\//, '').trim() : null;
}

function parseStepHeaders(line) {
  const headMatch = line.match(/^#{2,4}\s+(?:\[?[A-Z]+\]?\s*)?(?:Step\s+)?(\d+\.\d+)\s*(?:—|-|:)\s*(.+)/i);
  const checkMatch = line.match(/^\s*-\s*\[[ x!/~]\]\s*(?:\*\*Step\s+|\*\*|\bStep\s+)?(\d+\.\d+)\*?\*?\s*(?:—|-|:|\s)\s*(.+)/i);
  const tableMatch = line.match(/^\s*\|\s*(?:Step\s+)?(\d+\.\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)/i);

  if (headMatch) return { num: headMatch[1], title: headMatch[2].trim(), declared: extractFileFromTitle(headMatch[2]), isHead: true };
  if (checkMatch) return { num: checkMatch[1], title: checkMatch[2].trim(), declared: extractFileFromTitle(checkMatch[2]), isHead: false };
  if (tableMatch) {
    const col1 = tableMatch[2].trim().replace(/`/g, '');
    const col2 = tableMatch[3].trim();
    return { num: tableMatch[1], title: col2, declared: col1.includes('.') ? col1 : extractFileFromTitle(col2), isHead: false };
  }
  return null;
}

function parseStepsFromPlanContent(content, planFile) {
  const lines = content.split(/\r?\n/), steps = new Map();
  let currentStep = null, inFence = false, activePhaseInFile = null;
  const filePhaseMatch = planFile.match(/phase-(\d+)/i);
  if (filePhaseMatch) activePhaseInFile = parseInt(filePhaseMatch[1], 10);

  for (const line of lines) {
    if (/^```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const phaseHeader = line.match(/^#{1,3}\s+(?:\[?Phase\s+(\d+)\]?|Phase\s+(\d+))[:\s—-]*(.*)/i);
    if (phaseHeader && (phaseHeader[1] || phaseHeader[2])) activePhaseInFile = parseInt(phaseHeader[1] || phaseHeader[2], 10);

    const parsed = parseStepHeaders(line);
    if (parsed) {
      const stepPhase = parseInt(parsed.num.split('.')[0], 10);
      if (activePhaseInFile && stepPhase !== activePhaseInFile && !parsed.isHead) continue;
      if (!steps.has(parsed.num)) {
        currentStep = { number: parsed.num, title: parsed.title, file: parsed.declared || '.agents/PROGRESS.md', planFile, action: 'EDIT' };
        steps.set(parsed.num, currentStep);
      } else {
        currentStep = steps.get(parsed.num);
        if (parsed.declared && currentStep.file === '.agents/PROGRESS.md') currentStep.file = parsed.declared;
      }
      continue;
    }
    if (currentStep) {
      const fMatch = line.match(/^-\s+\*\*File:?\*\*:?\s+`([^`]+)`/i);
      if (fMatch) currentStep.file = fMatch[1].trim();
      const aMatch = line.match(/^-\s+\*\*Action:?\*\*:?\s+([A-Za-z_]+)/i);
      if (aMatch) currentStep.action = aMatch[1].toUpperCase();
    }
  }
  return steps;
}

function validateProject(phases, planFilesContents, cwd) {
  const progressSteps = new Map();
  phases.forEach(p => p.steps.forEach(s => progressSteps.set(s.number, { ...s, file: extractFileFromTitle(s.title) })));
  const planSteps = new Map(), errors = [];
  planFilesContents.forEach(({ planFile, content }) => {
    parseStepsFromPlanContent(content, planFile).forEach((s, n) => planSteps.set(n, s));
  });

  planSteps.forEach((s, n) => { if (!progressSteps.has(n)) errors.push(`Step ${n} in plan/${s.planFile} missing in PROGRESS.md`); });
  progressSteps.forEach((step, number) => {
    const planStep = planSteps.get(number);
    if (!planStep) return errors.push(`Step ${number} in PROGRESS.md missing in plan files`);
    let resolved = planStep.file !== '.agents/PROGRESS.md' ? planStep.file : (step.file || planStep.file);
    if (!resolved) return errors.push(`Step ${number} has no declared File`);
    if (resolved === 'PROGRESS.md') resolved = '.agents/PROGRESS.md';

    let target = path.join(cwd, resolved);
    const isBuildArtifact = /^(release\/|dist\/|dashboard\/dist\/)/i.test(resolved);
    if (step.status === 'done' && planStep.action !== 'DELETE' && !isBuildArtifact && !fs.existsSync(target)) {
      if (fs.existsSync(path.join(cwd, '.agents', resolved))) target = path.join(cwd, '.agents', resolved);
      else {
        const inArchive = fs.existsSync(path.join(cwd, '_archive', resolved)) || (fs.existsSync(path.join(cwd, '_archive')) && findFileRecursively(path.join(cwd, '_archive'), path.basename(resolved)));
        if (!inArchive) errors.push(`${resolved} missing for completed Step ${number}`);
        return;
      }
    }
    if (step.status !== 'running' || !fs.existsSync(target) || fs.statSync(target).isDirectory() || resolved.startsWith('.agents/') || resolved.startsWith('marketing/') || resolved.startsWith('_archive/') || /\.(png|jpe?g|gif|svg|ico|md|txt)$/i.test(resolved)) return;
    const lines = fs.readFileSync(target, 'utf8').split(/\r?\n/).filter(l => l.trim() && !/^\s*(\/\/|#(?!\!)|\/\*|\*|<!--)/.test(l)).length;
    if (lines > 150) errors.push(`${resolved} exceeds 150 lines (${lines} lines)`);
  });
  return errors;
}

module.exports = { verifyTargetFileCore, validateProject, findFileRecursively };
