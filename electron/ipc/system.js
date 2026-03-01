const fs = require('fs');
const path = require('path');

/**
 * Read config.local.json or config.json from the app root directory.
 * Returns merged config object or null if no config file found.
 */
function loadBackendConfig() {
  const roots = [
    path.join(__dirname, '..', '..', 'config.local.json'),
    path.join(__dirname, '..', '..', 'config.json'),
  ];

  for (const filePath of roots) {
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw);
      } catch (err) {
        console.error(`[system] Failed to parse config file ${filePath}:`, err.message);
      }
    }
  }

  return null;
}

function register(ipcMain) {
  // Get backend config (IMAP/SMTP and other backend settings)
  ipcMain.handle('system:getBackendConfig', async () => {
    try {
      const config = loadBackendConfig();
      if (!config) {
        return { success: false, error: 'No backend config file found (config.local.json or config.json)' };
      }
      return { success: true, config };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Get app health/version info
  ipcMain.handle('system:getHealth', async () => {
    const { app } = require('electron');
    return {
      success: true,
      version: app.getVersion(),
      platform: process.platform,
      uptime: process.uptime(),
    };
  });
}

module.exports = { register };
