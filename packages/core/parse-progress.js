function parseStepMatch(match, i, line) {
  const flag = match[1];
  const status = flag === 'x' ? 'done' : (flag === '/' || flag === '~') ? 'running' : flag === '!' ? 'blocked' : 'pending';
  return {
    status,
    number: match[2].trim(),
    title: match[3].trim(),
    lineIndex: i,
    lineContent: line
  };
}

function parsePhasesAndSteps(lines) {
  const phases = [];
  let currentPhase = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const phaseMatch = line.match(/^##\s+(?:.*?)Phase (\d+):\s*(.*?)\s*—\s*(.*)$/);
    if (phaseMatch) {
      if (currentPhase) phases.push(currentPhase);
      currentPhase = {
        number: parseInt(phaseMatch[1], 10) || 0,
        name: phaseMatch[2].trim(),
        statusText: phaseMatch[3].trim(),
        steps: [],
        headerIndex: i,
        headerLine: line
      };
      continue;
    }

    const stepMatch = line.match(/^\s*-\s*\[([ x!/~])\]\s*\*\*Step (\d+\.\d+)\*\*\s*—\s*(.*)$/);
    if (stepMatch && currentPhase) {
      currentPhase.steps.push(parseStepMatch(stepMatch, i, line));
    }
  }
  if (currentPhase) phases.push(currentPhase);

  phases.forEach(p => {
    const done = p.steps.filter(s => s.status === 'done').length;
    p.percentage = p.steps.length > 0 ? (done === p.steps.length ? 100 : Math.min(99, Math.floor((done / p.steps.length) * 100))) : 0;
  });
  return phases;
}

function calculateOverallProgress(phases) {
  let calculatedTotal = 0, calculatedDone = 0;
  phases.forEach(p => {
    calculatedTotal += p.steps.length;
    calculatedDone += p.steps.filter(s => s.status === 'done').length;
  });
  if (calculatedTotal === 0) return { percentage: 0, completed: 0, total: 0 };
  return {
    percentage: (calculatedDone === calculatedTotal) ? 100 : Math.min(99, Math.floor((calculatedDone / calculatedTotal) * 100)),
    completed: calculatedDone,
    total: calculatedTotal
  };
}

function parseTimelineLogs(lines, phases) {
  const timeline = [];
  let inLog = false;
  for (const rawLine of lines) {
    if (rawLine.includes('UPDATE LOG:')) { inLog = true; continue; }
    if (inLog && rawLine.includes('-->')) break;
    if (!inLog) continue;

    const line = rawLine.trim();
    if (!line || line.startsWith('UPDATE LOG:')) continue;

    const logMatch = line.match(/^\[(.*?)\]\s+(.*)$/);
    if (logMatch) {
      const timestamp = logMatch[1].trim();
      const message = logMatch[2].trim();
      timeline.push({ time: timestamp, message });
      const stepMatch = message.match(/^Step\s+(\d+\.\d+)\s+completed/i);
      if (stepMatch) {
        const stepNum = stepMatch[1];
        for (const phase of phases) {
          const step = phase.steps.find(s => s.number === stepNum);
          if (step) { step.completedAt = timestamp; break; }
        }
      }
    } else {
      timeline.push({ time: '', message: line });
    }
  }
  return timeline;
}

function parseProgressText(content) {
  const lines = content.split(/\r?\n/);
  const phases = parsePhasesAndSteps(lines);
  const overall = calculateOverallProgress(phases);
  const timeline = parseTimelineLogs(lines, phases);
  return { content, lines, phases, overall, timeline };
}

module.exports = { parseProgressText };
