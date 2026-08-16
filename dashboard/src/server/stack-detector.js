import fs from 'fs';
import path from 'path';
import { getSettings } from './settings.js';

export function detectProjectStack(projectPath) {
  const result = {
    stack: 'Generic Project',
    framework: 'General',
    language: 'Polyglot',
    type: 'general',
    recommendedArch: 'Clean Architecture',
    suggestedLimit: 150,
    suggestedModule: 'mixed',
    badges: []
  };

  try {
    const pkgPath = path.join(projectPath, 'package.json');
    const isNode = fs.existsSync(pkgPath);
    const isPhp = fs.existsSync(path.join(projectPath, 'composer.json')) || fs.existsSync(path.join(projectPath, 'artisan'));
    const isRust = fs.existsSync(path.join(projectPath, 'Cargo.toml'));
    const isPython = fs.existsSync(path.join(projectPath, 'requirements.txt')) || fs.existsSync(path.join(projectPath, 'pyproject.toml'));
    const isGo = fs.existsSync(path.join(projectPath, 'go.mod'));
    const isFlutter = fs.existsSync(path.join(projectPath, 'pubspec.yaml'));
    const isJava = fs.existsSync(path.join(projectPath, 'pom.xml')) || fs.existsSync(path.join(projectPath, 'build.gradle'));

    if (isPhp) {
      const isLaravel = fs.existsSync(path.join(projectPath, 'artisan'));
      result.stack = isLaravel ? 'PHP / Laravel Framework' : 'PHP Application';
      result.framework = isLaravel ? 'Laravel' : 'PHP';
      result.language = 'PHP';
      result.type = 'backend';
      result.recommendedArch = 'Clean Architecture (PSR-12)';
      result.badges.push('PHP', isLaravel ? 'Laravel' : 'Composer');
    } else if (isNode) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      const isMonorepo = fs.existsSync(path.join(projectPath, 'packages')) && fs.existsSync(path.join(projectPath, 'dashboard'));
      
      if (deps['next']) {
        result.stack = 'Next.js App Router';
        result.framework = 'Next.js';
        result.language = 'TypeScript / JS';
        result.type = 'fullstack';
        result.recommendedArch = 'Next.js Fullstack Standards';
        result.badges.push('Next.js', 'React', 'SSR');
      } else if (deps['react'] || deps['vite']) {
        result.stack = isMonorepo ? 'Monorepo (React + Node.js Core)' : 'React + Vite UI';
        result.framework = 'React';
        result.language = 'JavaScript / TS';
        result.type = isMonorepo ? 'monorepo' : 'frontend';
        result.recommendedArch = isMonorepo ? 'Strict Monorepo & Micro-Files' : 'Clean Architecture';
        result.badges.push(isMonorepo ? 'Monorepo' : 'SPA', 'React', 'Vite');
      } else if (deps['express'] || deps['fastify'] || deps['koa']) {
        result.stack = 'Node.js Backend API';
        result.framework = 'Node.js';
        result.language = 'JavaScript';
        result.type = 'backend';
        result.recommendedArch = 'Clean Backend (Controllers/Services)';
        result.badges.push('Node.js', 'REST API');
      } else {
        result.stack = 'Node.js Environment';
        result.framework = 'Node.js';
        result.language = 'JavaScript';
        result.badges.push('Node.js');
      }
    } else if (isRust) {
      result.stack = 'Rust High-Performance Crate';
      result.framework = 'Cargo';
      result.language = 'Rust';
      result.type = 'systems';
      result.recommendedArch = 'Rust Safety & Traits Standards';
      result.badges.push('Rust', 'Cargo', 'Zero-Cost');
    } else if (isPython) {
      result.stack = 'Python / Data Science Stack';
      result.framework = 'Python';
      result.language = 'Python';
      result.type = 'python';
      result.recommendedArch = 'Python & Type Hints Standards';
      result.badges.push('Python', 'Asyncio');
    } else if (isGo) {
      result.stack = 'Go Microservice';
      result.framework = 'Go';
      result.language = 'Go';
      result.type = 'backend';
      result.recommendedArch = 'Golang Idiomatic Standards';
      result.badges.push('Go', 'Microservice');
    } else if (isFlutter) {
      result.stack = 'Flutter Cross-Platform App';
      result.framework = 'Flutter';
      result.language = 'Dart';
      result.type = 'mobile';
      result.recommendedArch = 'Flutter Clean Architecture';
      result.badges.push('Flutter', 'Dart', 'Cross-Platform');
    } else if (isJava) {
      result.stack = 'Java Enterprise Application';
      result.framework = 'Spring / Maven';
      result.language = 'Java';
      result.type = 'backend';
      result.recommendedArch = 'Clean Architecture';
      result.badges.push('Java', 'JVM');
    }
  } catch (e) {
    /* fallback to generic */
  }

  return result;
}

export function handleDetectStack(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find((p) => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const stackInfo = detectProjectStack(project.path);
    res.json(stackInfo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
