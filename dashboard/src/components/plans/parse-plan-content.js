export function parsePlanContent(content, filename) {
  if (!content) return { title: filename, modules: [], stats: { totalTasks: 0, completedTasks: 0, codeBlocks: 0, totalSteps: 0 } };
  const lines = content.split('\n');
  let mainTitle = filename;
  let currentModule = { number: '00', title: 'Overview & Core Architecture', blocks: [], tasksTotal: 0, tasksDone: 0, codeCount: 0, stepsCount: 0 };
  const parsedModules = [];
  let modCount = 0;
  let totalTasks = 0;
  let completedTasks = 0;
  let codeBlocks = 0;
  let totalSteps = 0;

  let i = 0;
  while (i < lines.length) {
    const prevI = i;
    const line = lines[i];

    if (line.startsWith('# ')) { mainTitle = line.slice(2).trim(); i++; continue; }
    if (line.startsWith('## ')) {
      if (currentModule.blocks.length > 0 || modCount > 0) parsedModules.push(currentModule);
      modCount++;
      const numStr = modCount < 10 ? `0${modCount}` : `${modCount}`;
      currentModule = { number: numStr, title: line.slice(3).trim(), blocks: [], tasksTotal: 0, tasksDone: 0, codeCount: 0, stepsCount: 0 };
      i++;
      continue;
    }

    const stepMatch = line.match(/^###\s+(Step\s+([0-9]+(?:\.[0-9]+)?)[^:\n—\-]*)[—\-:]?\s*(.*)/i);
    if (stepMatch) {
      const stepRaw = stepMatch[1].trim();
      const stepNum = stepMatch[2].trim();
      const stepTitle = (stepMatch[3] || stepRaw).trim();
      totalSteps++;
      currentModule.stepsCount++;
      const stepBody = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('#')) { stepBody.push(lines[i]); i++; }
      currentModule.blocks.push({ type: 'step', stepNum, stepTitle, rawHeading: line.replace(/^###+\s*/, '').trim(), body: stepBody.join('\n').trim() });
      continue;
    }

    if (/^###+\s/.test(line)) { currentModule.blocks.push({ type: 'h3', text: line.replace(/^###+\s*/, '').trim() }); i++; continue; }

    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'code';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { codeLines.push(lines[i]); i++; }
      codeBlocks++;
      currentModule.codeCount++;
      currentModule.blocks.push({ type: 'codeblock', language: lang, code: codeLines.join('\n') });
      if (i < lines.length) i++;
      continue;
    }

    if (/^\s*[-*]\s*\[([ xX~_-]?)\]\s*(.*)/.test(line)) {
      const items = [];
      while (i < lines.length) {
        const match = lines[i].match(/^\s*[-*]\s*\[([ xX~_-]?)\]\s*(.*)/);
        if (!match) break;
        const checked = match[1].toLowerCase() === 'x';
        items.push({ checked, text: match[2].trim() || 'Task checkpoint' });
        totalTasks++;
        currentModule.tasksTotal++;
        if (checked) { completedTasks++; currentModule.tasksDone++; }
        i++;
      }
      if (items.length > 0) { currentModule.blocks.push({ type: 'checklist', items }); continue; }
    }

    if (/^\s*[-*]\s+(.+)/.test(line)) {
      const items = [];
      while (i < lines.length) {
        const match = lines[i].match(/^\s*[-*]\s+(.+)/);
        if (!match || /^\s*[-*]\s*\[/.test(lines[i])) break;
        items.push(match[1].trim());
        i++;
      }
      if (items.length > 0) { currentModule.blocks.push({ type: 'list', items }); continue; }
    }

    if (line.trim().startsWith('>')) {
      const quotes = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) { quotes.push(lines[i].trim().replace(/^>\s*/, '')); i++; }
      currentModule.blocks.push({ type: 'quote', text: quotes.join(' ') });
      continue;
    }

    if (!line.trim()) { i++; continue; }

    const paraLines = [];
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].trim().startsWith('```') && !/^\s*[-*]\s/.test(lines[i]) && !lines[i].trim().startsWith('>')) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) { currentModule.blocks.push({ type: 'paragraph', text: paraLines.join(' ') }); continue; }

    if (i === prevI) {
      if (lines[i].trim()) currentModule.blocks.push({ type: 'paragraph', text: lines[i].trim() });
      i++;
    }
  }

  if (currentModule.blocks.length > 0 || parsedModules.length === 0) parsedModules.push(currentModule);

  return { title: mainTitle, modules: parsedModules, stats: { totalTasks, completedTasks, codeBlocks, totalModules: parsedModules.length, totalSteps } };
}
