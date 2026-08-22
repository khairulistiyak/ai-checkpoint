const esbuild = require('esbuild');
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

async function buildEngine() {
  try {
    console.log('🔧 Starting Global Engine build...');

    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR, { recursive: true });
    }
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    const rawFile = path.join(DIST_DIR, 'engine.raw.js');
    const binFile = path.join(ASSETS_DIR, 'engine.bin.js');

    console.log('📦 Bundling core with esbuild...');
    await esbuild.build({
      entryPoints: [path.join(ROOT_DIR, 'packages', 'cli', 'index.js')],
      outfile: rawFile,
      bundle: true,
      platform: 'node',
      format: 'cjs',
      minify: true,
      external: ['chokidar'] // Exclude native modules
    });

    console.log('🔒 Obfuscating raw bundle...');
    const rawCode = fs.readFileSync(rawFile, 'utf8');
    
    const obfuscationResult = JavaScriptObfuscator.obfuscate(rawCode, {
      compact: true,
      controlFlowFlattening: true,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      deadCodeInjection: true
    });

    fs.writeFileSync(binFile, obfuscationResult.getObfuscatedCode());
    
    console.log('🧹 Cleaning up intermediate files...');
    if (fs.existsSync(rawFile)) {
      fs.unlinkSync(rawFile);
    }

    console.log('✅ Global Engine built successfully at:', binFile);
  } catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
  }
}

buildEngine();
