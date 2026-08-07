const fs = require('fs');
const path = require('path');
const { analyzeStructure } = require('./structure-analyzer.js');

function cleanStructure(projectPath, options) {
  if (!options) options = {};
  const dryRun = options.dryRun !== false; // default: dry run
  const report = analyzeStructure(projectPath);
  const cleaned = [];

  for (const issue of report.issues) {
    if (issue.type === 'junk-file' || issue.type === 'junk-pattern') {
      if (dryRun) {
        cleaned.push({ action: 'would-delete', file: issue.file, reason: issue.msg });
      } else {
        try {
          fs.unlinkSync(issue.file);
          cleaned.push({ action: 'deleted', file: issue.file, reason: issue.msg });
        } catch (err) {
          cleaned.push({ action: 'error', file: issue.file, reason: err.message });
        }
      }
    }
  }

  return {
    dryRun,
    totalIssues: report.issues.length,
    cleanedCount: cleaned.length,
    cleaned,
  };
}

module.exports = { cleanStructure };
