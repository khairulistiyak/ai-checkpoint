import { getSettings } from './settings.js';
import intelligenceReport from '../../../packages/core/intelligence-report.js';
import intelligenceHistory from '../../../packages/core/intelligence-history.js';

const { generateIntelligenceReport } = intelligenceReport;
const { appendHistory, getHistory } = intelligenceHistory;

export function handleGetIntelligence(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Generate the latest report
    const report = generateIntelligenceReport(project.path);
    
    // Append to history
    const history = appendHistory(project.path, report);

    res.json({
      success: true,
      report,
      history
    });
  } catch (error) {
    console.error('Failed to get intelligence report:', error);
    res.status(500).json({ error: 'Failed to generate intelligence report' });
  }
}
