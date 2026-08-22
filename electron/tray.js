const { Tray, Menu, app, nativeImage } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { execFile } = require('child_process');

let tray = null;

function createTray(mainWindow) {
  if (tray) return tray;

  let iconPath = path.join(__dirname, '..', 'build-resources', 'icon-tray.png');
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(process.resourcesPath || __dirname, 'build-resources', 'icon-tray.png');
  }

  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) trayIcon = iconPath;
  } catch {
    trayIcon = iconPath;
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('AI Checkpoint');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Run Doctor',
      click: () => {
        const rootDir = path.join(__dirname, '..');
        const enginePath = path.join(os.homedir(), '.ai-checkpoint', 'engine.bin.js');
        execFile('node', [enginePath, 'doctor'], { cwd: rootDir, stdio: 'inherit' });
      },
    },
    {
      label: 'Quick Status',
      click: () => {
        const rootDir = path.join(__dirname, '..');
        const enginePath = path.join(os.homedir(), '.ai-checkpoint', 'engine.bin.js');
        execFile('node', [enginePath, 'status'], { cwd: rootDir, stdio: 'inherit' });
      },
    },
    { type: 'separator' },
    {
      label: 'Quit AI Checkpoint',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  return tray;
}

module.exports = { createTray };
