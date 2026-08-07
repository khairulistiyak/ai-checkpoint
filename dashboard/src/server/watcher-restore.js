import fs from 'fs';
import path from 'path';
import { POINTER_CONTENT, TEMPLATE_RESTORABLE, POINTER_FILES, WARN_ONLY_FILES } from './watcher-events.js';

export function handleDeletion(relativePath, ctx) {
  const { sseManager, projectId } = ctx;

  const templateName = TEMPLATE_RESTORABLE[relativePath];
  if (templateName) {
    restoreFromTemplate(relativePath, templateName, ctx);
    return;
  }

  const basename = path.basename(relativePath);
  if (POINTER_FILES.includes(basename) && !relativePath.includes(path.sep)) {
    restorePointerFile(relativePath, ctx);
    return;
  }

  if (WARN_ONLY_FILES.includes(relativePath)) {
    sseManager.broadcast(projectId, 'file-deleted-warning', {
      file: relativePath,
      message: `⚠️ ${relativePath} was deleted! Accept to recreate from template.`,
      canRestore: true,
    });
    return;
  }

  if (relativePath.startsWith('plan' + path.sep) && relativePath.endsWith('.md')) {
    sseManager.broadcast(projectId, 'plan-deleted', {
      file: relativePath,
    });
  }
}

export function restoreFromTemplate(relativePath, templateName, ctx) {
  const { projectPath, sseManager, projectId, templatesDir, logger, setRestoring } = ctx;
  const templatePath = path.join(templatesDir, templateName);
  const destPath = path.join(projectPath, relativePath);

  if (!fs.existsSync(templatePath)) {
    console.error(`⚠️ Template not found: ${templatePath}`); // keep
    return;
  }

  setRestoring(true);
  try {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(templatePath, destPath);
    console.log(`🔄 Auto-restored: ${relativePath}`); // keep
    logger.log('RESTORED', relativePath);
    sseManager.broadcast(projectId, 'file-restored', {
      file: relativePath,
      message: `🔄 ${relativePath} auto-restored from template`,
    });
  } catch (e) {
    console.error(`⚠️ Failed to restore ${relativePath}:`, e.message); // keep
  } finally {
    setTimeout(() => { setRestoring(false); }, 500);
  }
}

export function restorePointerFile(filename, ctx) {
  const { projectPath, sseManager, projectId, logger, setRestoring } = ctx;
  const destPath = path.join(projectPath, filename);

  setRestoring(true);
  try {
    fs.writeFileSync(destPath, POINTER_CONTENT, 'utf8');
    console.log(`🔄 Auto-restored pointer: ${filename}`); // keep
    logger.log('RESTORED', filename);
    sseManager.broadcast(projectId, 'file-restored', {
      file: filename,
      message: `🔄 ${filename} auto-restored`,
    });
  } catch (e) {
    console.error(`⚠️ Failed to restore pointer ${filename}:`, e.message); // keep
  } finally {
    setTimeout(() => { setRestoring(false); }, 500);
  }
}
