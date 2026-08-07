const { Tray, Menu, app } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let tray = null;

function createTray(mainWindow) {
  if (tray) return tray;

  const iconPath = path.join(__dirname, '..', 'build-resources', 'icon-tray.png');
  tray = new Tray(iconPath);
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
        spawn('./l', ['doctor'], { cwd: rootDir, stdio: 'inherit', shell: true });
      },
    },
    {
      label: 'Quick Status',
      click: () => {
        const rootDir = path.join(__dirname, '..');
        spawn('./l', ['status'], { cwd: rootDir, stdio: 'inherit', shell: true });
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
