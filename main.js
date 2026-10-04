const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const OFFICIAL_LOGO = path.join(__dirname, 'assets', 'images', 'sing_logo.png');

function appIcon() {
  // use the supplied Sing logo as the launcher/window icon when it is present
  try {
    if (fs.existsSync(OFFICIAL_LOGO) && fs.statSync(OFFICIAL_LOGO).size > 0) {
      return OFFICIAL_LOGO;
    }
  } catch (_) { /* fall through to the packaged default */ }
  return undefined;
}

function createWindow() {
  const icon = appIcon();
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 320,
    minHeight: 400,
    ...(icon ? { icon } : {}),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});