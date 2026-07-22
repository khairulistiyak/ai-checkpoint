import fs from 'fs';
import path from 'path';

export function parseProgress(projectPath) {
  try {
    const progressFile = path.join(projectPath, '.agents', 'PROGRESS.md');
    if (!fs.existsSync(progressFile)) return null;

    const content = fs.readFileSync(progressFile, 'utf8');
    const lines = content.split(/\r?\n/);

    const phases = [];
    let currentPhase = null;
    let overall = { percentage: 0, completed: 0, total: 0 };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const overallMatch = line.match(/\[(█+|░+)\]\s+(\d+)%\s+\((\d+)\/(\d+)/);
      if (overallMatch) {
        overall = {
          percentage: parseInt(overallMatch[2]) || 0,
          completed: parseInt(overallMatch[3]) || 0,
          total: parseInt(overallMatch[4]) || 0
        };
      }

      const phaseMatch = line.match(/^## (?:.*?)\s*Phase (\d+):\s*(.*?)\s*—\s*(.*)$/);
      if (phaseMatch) {
        if (currentPhase) phases.push(currentPhase);
        currentPhase = {
          number: parseInt(phaseMatch[1]) || 0,
          name: phaseMatch[2].trim(),
          statusText: phaseMatch[3].trim(),
          steps: []
        };
        continue;
      }

      const stepMatch = line.match(/^\s*-\s*\[([ x!/~])\]\s*\*\*Step (\d+\.\d+)\*\*\s*—\s*(.*)$/);
      if (stepMatch && currentPhase) {
        currentPhase.steps.push({
          status: stepMatch[1] === 'x' ? 'done' : (stepMatch[1] === '/' || stepMatch[1] === '~') ? 'running' : stepMatch[1] === '!' ? 'blocked' : 'pending',
          number: stepMatch[2].trim(),
          title: stepMatch[3].trim()
        });
      }
    }
    if (currentPhase) phases.push(currentPhase);

    phases.forEach(p => {
      const done = p.steps.filter(s => s.status === 'done').length;
      p.percentage = p.steps.length > 0 ? Math.round((done / p.steps.length) * 100) : 0;
    });

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
            timeline.push({ time: logMatch[1], message: logMatch[2] });
          } else {
            timeline.push({ time: '', message: line });
          }
        }
      }
    }

    return { phases, overall, timeline };
  } catch (e) {
    console.error(`⚠️ Exception parsing PROGRESS.md for ${projectPath}:`, e.message);
    return null;
  }
}
