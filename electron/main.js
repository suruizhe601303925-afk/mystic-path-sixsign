const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// IPC handlers
const mailHandlers = require('./ipc/mail');
const knowledgeHandlers = require('./ipc/knowledge');
const systemHandlers = require('./ipc/system');
const workspaceHandlers = require('./ipc/workspace');
const adminHandlers = require('./ipc/admin');
const aiBridgeHandlers = require('./ipc/ai-bridge');
const { setupNotifier } = require('./notifier');

let mainWindow = null;

function getIsPackaged() {
  // Safe check for app.isPackaged (may be undefined in some Node/Electron versions)
  return typeof app.isPackaged === 'boolean' ? app.isPackaged : false;
}

function getPreloadPath() {
  return path.join(__dirname, 'preload.js');
}

function getIndexPath() {
  if (getIsPackaged()) {
    return path.join(process.resourcesPath, 'app', 'dist', 'index.html');
  }
  return path.join(__dirname, '..', 'dist', 'index.html');
}

function getDevUrl() {
  return process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const isDev = !getIsPackaged() && process.env.NODE_ENV !== 'production';

  if (isDev) {
    try {
      await mainWindow.loadURL(getDevUrl());
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    } catch (err) {
      console.error('Failed to load dev URL, falling back to file:', err.message);
      await mainWindow.loadFile(getIndexPath());
    }
  } else {
    await mainWindow.loadFile(getIndexPath());
  }

  // Setup notification bridge
  setupNotifier(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register all IPC handlers
function registerIpcHandlers() {
  mailHandlers.register(ipcMain);
  knowledgeHandlers.register(ipcMain);
  systemHandlers.register(ipcMain);
  workspaceHandlers.register(ipcMain);
  adminHandlers.register(ipcMain);
  aiBridgeHandlers.register(ipcMain);
}

app.whenReady().then(async () => {
  registerIpcHandlers();
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
