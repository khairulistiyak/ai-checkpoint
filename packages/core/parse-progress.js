function parseProgressText(content) {
  const lines = content.split(/\r?\n/);
  
  const phases = [];
  let currentPhase = null;
  let overall = { percentage: 0, completed: 0, total: 0 };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const overallMatch = line.match(/\[([█░]*)\]\s+(\d+)%\s+\((\d+)\/(\d+)/);
    if (overallMatch) {
      overall = {
        percentage: parseInt(overallMatch[2]) || 0,
        completed: parseInt(overallMatch[3]) || 0,
        total: parseInt(overallMatch[4]) || 0
      };
    }
    
    const phaseMatch = line.match(/^##\s+(?:.*?)Phase (\d+):\s*(.*?)\s*—\s*(.*)$/);
    if (phaseMatch) {
      if (currentPhase) phases.push(currentPhase);
      currentPhase = {
        number: parseInt(phaseMatch[1]) || 0,
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
      currentPhase.steps.push({
        status: stepMatch[1] === 'x' ? 'done' : (stepMatch[1] === '/' || stepMatch[1] === '~') ? 'running' : stepMatch[1] === '!' ? 'blocked' : 'pending',
        number: stepMatch[2].trim(),
        title: stepMatch[3].trim(),
        lineIndex: i,
        lineContent: line
      });
    }
  }
  if (currentPhase) phases.push(currentPhase);
  
  phases.forEach(p => {
    const done = p.steps.filter(s => s.status === 'done').length;
    p.percentage = p.steps.length > 0 ? Math.round((done / p.steps.length) * 100) : 0;
  });

  let calculatedTotal = 0;
  let calculatedDone = 0;
  phases.forEach(p => {
    calculatedTotal += p.steps.length;
    calculatedDone += p.steps.filter(s => s.status === 'done').length;
  });

  if (calculatedTotal > 0) {
    overall = {
      percentage: Math.round((calculatedDone / calculatedTotal) * 100),
      completed: calculatedDone,
      total: calculatedTotal
    };
  }
  
  const timeline = [];
  let inLog = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('UPDATE LOG:')) {
      inLog = true;
      continue;
    }
    if (inLog && lines[i].includes('-->')) {
      inLog = false;
      break;
    }
    if (inLog) {
      const line = lines[i].trim();
      if (line && !line.startsWith('UPDATE LOG:')) {
        const logMatch = line.match(/^\[(.*?)\]\s+(.*)$/);
        if (logMatch) {
          const timestamp = logMatch[1].trim();
          const message = logMatch[2].trim();
          timeline.push({ time: timestamp, message });
          
          const stepCompletedMatch = message.match(/^Step\s+(\d+\.\d+)\s+completed/i);
          if (stepCompletedMatch) {
            const stepNum = stepCompletedMatch[1];
            for (const phase of phases) {
              const step = phase.steps.find(s => s.number === stepNum);
              if (step) {
                step.completedAt = timestamp;
                break;
              }
            }
          }
        } else {
          timeline.push({ time: '', message: line });
        }
      }
    }
  }
  
  return { content, lines, phases, overall, timeline };
}

module.exports = { parseProgressText };
