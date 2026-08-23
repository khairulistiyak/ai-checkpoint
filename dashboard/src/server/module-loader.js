import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadCoreModule(moduleName = 'index.js') {
  const corePath = path.resolve(__dirname, '..', '..', '..', 'packages', 'core', moduleName);
  try {
    return require(corePath);
  } catch {
    return null;
  }
}

export function loadHealthModule() {
  return loadCoreModule('health-score.js');
}
