import fs from 'fs';
import os from 'os';
import { execSync } from 'child_process';

function pickDirectoryLinux() {
  const cmds = [
    'zenity --file-selection --directory --title="Select Project Folder" 2>/dev/null',
    'kdialog --getexistingdirectory "$HOME" 2>/dev/null',
    'yad --file --directory --title="Select Project Folder" 2>/dev/null',
    'python3 -c "import tkinter, tkinter.filedialog as fd; r=tkinter.Tk(); r.withdraw(); p=fd.askdirectory(); print(p or \'\')" 2>/dev/null'
  ];
  for (const cmd of cmds) {
    try {
      const out = execSync(cmd, { encoding: 'utf8', timeout: 60000 }).trim();
      if (out && fs.existsSync(out)) return out;
    } catch (err) {
      void err;
    }
  }
  return null;
}

/**
 * handleBrowseDirectory — Cross-platform native folder picker dialog
 */
export function handleBrowseDirectory(req, res) {
  try {
    const platform = os.platform();
    let result = '';
    if (platform === 'darwin') {
      const cmd = `osascript -e 'tell application (path to frontmost application as text) to set myFolder to choose folder with prompt "Select Project Folder"' -e 'POSIX path of myFolder'`;
      result = execSync(cmd, { encoding: 'utf8', timeout: 60000 }).trim();
    } else if (platform === 'win32') {
      const cmd = `powershell -NoProfile -Command "(new-object -COM 'Shell.Application').BrowseForFolder(0,'Select Project Folder',0,0).self.path"`;
      result = execSync(cmd, { encoding: 'utf8', timeout: 60000 }).trim();
    } else {
      result = pickDirectoryLinux() || '';
    }
    res.json({ path: result && fs.existsSync(result) ? result : null });
  } catch (err) {
    void err;
    res.json({ path: null });
  }
}
