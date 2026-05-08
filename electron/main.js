const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const net = require('net');
const fs = require('fs');

const isDev = !app.isPackaged;

// Log to a file so we can debug packaged builds
const logPath = path.join(app.getPath('userData'), 'omnistream.log');
function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
  process.stdout.write(line);
  try { fs.appendFileSync(logPath, line); } catch (err) { /* ignore write errors */ }
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

let mainWindow;

async function start() {
  log('start() called, isDev:', isDev);
  log('resourcesPath:', process.resourcesPath);
  log('__dirname:', __dirname);

  if (!isDev) {
    const port = await getFreePort();
    log('Using port:', port);

    process.env.PORT = String(port);
    process.env.FRONTEND_DIST = path.join(process.resourcesPath, 'frontend', 'dist');
    log('FRONTEND_DIST:', process.env.FRONTEND_DIST);
    log('FRONTEND_DIST exists:', fs.existsSync(process.env.FRONTEND_DIST));

    log('Loading backend...');
    const { serverReady } = require('../backend/src/app.js');
    log('Waiting for server...');
    await serverReady;
    log('Server ready on port', port);
  }

  const url = isDev
    ? 'http://localhost:5173'
    : `http://localhost:${process.env.PORT}`;

  log('Opening window at', url);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#07070e',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(url);

  mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
    log('Page failed to load:', code, desc);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: href }) => {
    shell.openExternal(href);
    return { action: 'deny' };
  });
}

app.whenReady().then(start).catch((err) => {
  log('FATAL ERROR:', err.message, err.stack);
  dialog.showErrorBox(
    'OmniStream failed to start',
    `${err.message}\n\nLog: ${logPath}`
  );
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) start().catch((err) => {
    log('ERROR on activate:', err.message);
  });
});
