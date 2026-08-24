function parseStepBlock(lines, i) {
  const line = lines[i];
  const stepMatch = line.match(/^###\s+(Step\s+([0-9]+(?:\.[0-9]+)?)[^:\n—\-]*)[—\-:]?\s*(.*)/i);
  const stepRaw = stepMatch[1].trim(), stepNum = stepMatch[2].trim(), stepTitle = (stepMatch[3] || stepRaw).trim();
  const stepBody = [];
  let nextI = i + 1;
  while (nextI < lines.length && !lines[nextI].startsWith('#')) {
    stepBody.push(lines[nextI]);
    nextI++;
  }
  return { nextI, block: { type: 'step', stepNum, stepTitle, rawHeading: line.replace(/^###+\s*/, '').trim(), body: stepBody.join('\n').trim() } };
}

function parseCodeBlock(lines, i) {
  const lang = lines[i].trim().slice(3).trim() || 'code', codeLines = [];
  let nextI = i + 1;
  while (nextI < lines.length && !lines[nextI].trim().startsWith('```')) {
    codeLines.push(lines[nextI]);
    nextI++;
  }
  if (nextI < lines.length) nextI++;
  return { nextI, block: { type: 'codeblock', language: lang, code: codeLines.join('\n') } };
}

function parseChecklistBlock(lines, i) {
  const items = [];
  let tasksTotal = 0, tasksDone = 0, nextI = i;
  while (nextI < lines.length) {
    const match = lines[nextI].match(/^\s*[-*]\s*\[([ xX~_-]?)\]\s*(.*)/);
    if (!match) break;
    const checked = match[1].toLowerCase() === 'x';
    items.push({ checked, text: match[2].trim() || 'Task checkpoint' });
    tasksTotal++;
    if (checked) tasksDone++;
    nextI++;
  }
  return { nextI, tasksTotal, tasksDone, block: { type: 'checklist', items } };
}

function parseTableBlock(lines, i) {
  const parseRow = (line) => line.split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
  const headers = parseRow(lines[i]), rows = [];
  let nextI = i + 2;
  while (nextI < lines.length && /^\s*\|.+\|\s*$/.test(lines[nextI])) {
    rows.push(parseRow(lines[nextI]));
    nextI++;
  }
  return { nextI, block: { type: 'table', headers, rows } };
}

function parseListOrQuote(lines, i) {
  const line = lines[i];
  if (/^\s*[-*]\s+(.+)/.test(line)) {
    const items = [];
    let nextI = i;
    while (nextI < lines.length) {
      const match = lines[nextI].match(/^\s*[-*]\s+(.+)/);
      if (!match || /^\s*[-*]\s*\[/.test(lines[nextI])) break;
      items.push(match[1].trim());
      nextI++;
    }
    return { nextI, block: { type: 'list', items } };
  }
  const quotes = [];
  let nextI = i;
  while (nextI < lines.length && lines[nextI].trim().startsWith('>')) {
    quotes.push(lines[nextI].trim().replace(/^>\s*/, ''));
    nextI++;
  }
  const text = quotes.join(' ');
  const alertMatch = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/i);
  if (alertMatch) return { nextI, block: { type: 'alert', variant: alertMatch[1].toLowerCase(), text: alertMatch[2] } };
  return { nextI, block: { type: 'quote', text } };
}

function parseParagraph(lines, i) {
  const paraLines = [];
  let nextI = i;
  const isStop = (l) => !l.trim() || l.startsWith('#') || l.trim().startsWith('```') || /^\s*[-*]\s/.test(l) || l.trim().startsWith('>') || /^\s*\|.+\|\s*$/.test(l) || /^\s*(\-{3,}|\*{3,}|_{3,})\s*$/.test(l);
  while (nextI < lines.length && !isStop(lines[nextI])) {
    paraLines.push(lines[nextI]);
    nextI++;
  }
  return { nextI, block: { type: 'paragraph', text: paraLines.join(' ') } };
}

export function parsePlanContent(content, filename) {
  if (!content) return { title: filename, modules: [], stats: { totalTasks: 0, completedTasks: 0, codeBlocks: 0, totalSteps: 0 } };
  const lines = content.split('\n'), parsedModules = [];
  let mainTitle = filename, currentMod = { number: '00', title: 'Overview & Core Architecture', blocks: [], tasksTotal: 0, tasksDone: 0, codeCount: 0, stepsCount: 0 };
  let modCount = 0, totalTasks = 0, completedTasks = 0, codeBlocks = 0, totalSteps = 0, i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('# ')) { mainTitle = line.slice(2).trim(); i++; continue; }
    if (line.startsWith('## ')) {
      if (currentMod.blocks.length > 0 || modCount > 0) parsedModules.push(currentMod);
      modCount++;
      const numStr = modCount < 10 ? `0${modCount}` : `${modCount}`;
      currentMod = { number: numStr, title: line.slice(3).trim(), blocks: [], tasksTotal: 0, tasksDone: 0, codeCount: 0, stepsCount: 0 };
      i++; continue;
    }
    if (/^###\s+Step\s+[0-9]/i.test(line)) {
      const res = parseStepBlock(lines, i);
      totalSteps++; currentMod.stepsCount++; currentMod.blocks.push(res.block); i = res.nextI; continue;
    }
    if (/^###+\s/.test(line)) { currentMod.blocks.push({ type: 'h3', text: line.replace(/^###+\s*/, '').trim() }); i++; continue; }
    if (line.trim().startsWith('```')) {
      const res = parseCodeBlock(lines, i);
      codeBlocks++; currentMod.codeCount++; currentMod.blocks.push(res.block); i = res.nextI; continue;
    }
    if (/^\s*\|.+\|\s*$/.test(line) && lines[i + 1] && /^\s*\|[\s\-:|]+\|\s*$/.test(lines[i + 1])) {
      const res = parseTableBlock(lines, i);
      currentMod.blocks.push(res.block); i = res.nextI; continue;
    }
    if (/^\s*(\-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      currentMod.blocks.push({ type: 'hr' }); i++; continue;
    }
    if (/^\s*[-*]\s*\[/.test(line)) {
      const res = parseChecklistBlock(lines, i);
      totalTasks += res.tasksTotal; completedTasks += res.tasksDone;
      currentMod.tasksTotal += res.tasksTotal; currentMod.tasksDone += res.tasksDone;
      currentMod.blocks.push(res.block); i = res.nextI; continue;
    }
    if (/^\s*[-*]\s/.test(line) || line.trim().startsWith('>')) {
      const res = parseListOrQuote(lines, i);
      currentMod.blocks.push(res.block); i = res.nextI; continue;
    }
    if (!line.trim()) { i++; continue; }
    const pRes = parseParagraph(lines, i);
    currentMod.blocks.push(pRes.block); i = pRes.nextI;
  }
  if (currentMod.blocks.length > 0 || parsedModules.length === 0) parsedModules.push(currentMod);
  return { title: mainTitle, modules: parsedModules, stats: { totalTasks, completedTasks, codeBlocks, totalModules: parsedModules.length, totalSteps } };
}
