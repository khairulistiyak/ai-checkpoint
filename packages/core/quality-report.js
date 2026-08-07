const { analyzeStructure } = require('./structure-analyzer.js');
const { checkNaming } = require('./naming-checker.js');
const { scanHygiene } = require('./code-hygiene.js');

let analyzeComplexity, scanDependencyHygiene, checkProjectConfig;
try { analyzeComplexity = require('./complexity-analyzer.js').analyzeComplexity; } catch { analyzeComplexity = null; }
try { scanDependencyHygiene = require('./dep-hygiene.js').scanDependencyHygiene; } catch { scanDependencyHygiene = null; }
try { checkProjectConfig = require('./project-config-checker.js').checkProjectConfig; } catch { checkProjectConfig = null; }

function generateQualityReport(projectPath) {
  const structure = analyzeStructure(projectPath);
  const naming = checkNaming(projectPath);
  const hygiene = scanHygiene(projectPath);

  const allIssues = [
    ...structure.issues.map(i => ({ ...i, category: 'structure' })),
    ...naming.issues.map(i => ({ ...i, category: 'naming' })),
    ...hygiene.issues.map(i => ({ ...i, category: 'hygiene' })),
  ];

  // Deep scanners (optional — fail gracefully)
  let complexityStats = null;
  if (analyzeComplexity) {
    const c = analyzeComplexity(projectPath);
    complexityStats = c.stats;
    allIssues.push(...c.issues.map(i => ({ ...i, category: 'complexity' })));
  }

  let depStats = null;
  if (scanDependencyHygiene) {
    const d = scanDependencyHygiene(projectPath);
    depStats = { totalDeps: d.totalDeps, totalDevDeps: d.totalDevDeps };
    allIssues.push(...d.issues.map(i => ({ ...i, category: 'dependencies' })));
  }

  let configChecks = null;
  if (checkProjectConfig) {
    const p = checkProjectConfig(projectPath);
    configChecks = p.checks;
    allIssues.push(...p.issues.map(i => ({ ...i, category: 'config' })));
  }

  let score = 100;
  score -= structure.issues.filter(i => i.type === 'junk-file').length * 3;
  score -= structure.issues.filter(i => i.type === 'empty-file').length * 5;
  score -= naming.issues.length * 2;
  score -= hygiene.issues.filter(i => i.type === 'debug-log').length * 1;
  score -= hygiene.issues.filter(i => i.type === 'todo-comment').length * 1;
  if (complexityStats) score -= complexityStats.complexFunctions * 3;
  if (depStats) score -= allIssues.filter(i => i.category === 'dependencies').length * 2;
  if (configChecks) score -= allIssues.filter(i => i.category === 'config').length * 1;
  if (score < 0) score = 0;

  return {
    score,
    maxScore: 100,
    passed: score >= 80,
    breakdown: {
      structureIssues: structure.issues.length,
      namingIssues: naming.issues.length,
      hygieneIssues: hygiene.issues.length,
      complexityIssues: complexityStats ? complexityStats.complexFunctions : 0,
      dependencyIssues: allIssues.filter(i => i.category === 'dependencies').length,
      configIssues: allIssues.filter(i => i.category === 'config').length,
      totalFiles: structure.totalFiles,
      totalDirs: structure.totalDirs,
    },
    issues: allIssues,
  };
}

module.exports = { generateQualityReport };
