const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const resDir = path.join(rootDir, 'build-resources');
const basePng = path.join(resDir, 'icon.png');

// 1. Convert icon.png to true 512x512 PNG
execSync(`sips -s format png "${basePng}" -o "${basePng}"`, { stdio: 'ignore' });

// 2. Generate macOS .icns
const icnsPath = path.join(resDir, 'icon.icns');
execSync(`sips -s format icns "${basePng}" -o "${icnsPath}"`, { stdio: 'ignore' });

// 3. Generate 32x32 tray icon
const trayPath = path.join(resDir, 'icon-tray.png');
execSync(`sips -z 32 32 "${basePng}" -o "${trayPath}"`, { stdio: 'ignore' });

// 4. Generate Windows multi-resolution .ico
const sizes = [16, 32, 48, 64, 128, 256];
const pngs = [];
for (const s of sizes) {
  const tmpPath = path.join(rootDir, `.tmp_icon_${s}.png`);
  execSync(`sips -z ${s} ${s} "${basePng}" -o "${tmpPath}"`, { stdio: 'ignore' });
  pngs.push({ size: s, data: fs.readFileSync(tmpPath) });
  fs.unlinkSync(tmpPath);
}

let offset = 6 + sizes.length * 16;
const dirHeader = Buffer.alloc(6);
dirHeader.writeUInt16LE(0, 0); // reserved
dirHeader.writeUInt16LE(1, 2); // icon type
dirHeader.writeUInt16LE(sizes.length, 4); // count

const entries = [];
for (const p of pngs) {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(p.size >= 256 ? 0 : p.size, 0);
  entry.writeUInt8(p.size >= 256 ? 0 : p.size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(p.data.length, 8);
  entry.writeUInt32LE(offset, 12);
  entries.push(entry);
  offset += p.data.length;
}

const icoBuf = Buffer.concat([dirHeader, ...entries, ...pngs.map(p => p.data)]);
fs.writeFileSync(path.join(resDir, 'icon.ico'), icoBuf);
process.stdout.write('✅ Generated native icon.png, icon.icns, icon.ico, icon-tray.png\n');
