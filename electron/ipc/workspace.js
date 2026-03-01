const fs = require('fs');
const path = require('path');

function getSettingsPath(filename) {
  const { app } = require('electron');
  return path.join(app.getPath('userData'), filename);
}

function readJson(filename) {
  const filePath = getSettingsPath(filename);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(`[workspace] Failed to parse ${filename}:`, err.message);
      return null;
    }
  }
  return null;
}

function writeJson(filename, data) {
  fs.writeFileSync(getSettingsPath(filename), JSON.stringify(data, null, 2), 'utf8');
}

const DEFAULT_SCHEDULE = {
  enabled: false,
  interval: 30,       // minutes
  startHour: 8,       // hour of day to start syncing
  endHour: 20,        // hour of day to stop syncing
  daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
};

const DEFAULT_LIMITS = {
  maxEmailsPerSync: 100,
  maxAttachmentSizeMb: 10,
  maxStorageMb: 500,
  rateLimitPerMinute: 60,
};

function register(ipcMain) {
  // General workspace settings
  ipcMain.handle('workspace:getSettings', async () => {
    const settings = readJson('workspace-settings.json');
    return { success: true, settings: settings || {} };
  });

  ipcMain.handle('workspace:saveSettings', async (_event, settings) => {
    try {
      writeJson('workspace-settings.json', settings);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Schedule settings
  ipcMain.handle('workspace:getScheduleSettings', async () => {
    const settings = readJson('schedule-settings.json');
    return { success: true, settings: settings || DEFAULT_SCHEDULE };
  });

  ipcMain.handle('workspace:saveScheduleSettings', async (_event, settings) => {
    try {
      writeJson('schedule-settings.json', settings);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Limit settings
  ipcMain.handle('workspace:getLimitSettings', async () => {
    const settings = readJson('limit-settings.json');
    return { success: true, settings: settings || DEFAULT_LIMITS };
  });

  ipcMain.handle('workspace:saveLimitSettings', async (_event, settings) => {
    try {
      writeJson('limit-settings.json', settings);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { register };
