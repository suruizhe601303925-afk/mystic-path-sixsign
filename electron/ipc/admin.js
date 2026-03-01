const fs = require('fs');
const path = require('path');
const { notify } = require('../notifier');

function getAnalyticsPath() {
  const { app } = require('electron');
  return path.join(app.getPath('userData'), 'analytics.json');
}

function readAnalytics() {
  const filePath = getAnalyticsPath();
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error('[admin] Failed to parse analytics data:', err.message);
      return null;
    }
  }
  return null;
}

const DEFAULT_ANALYTICS = {
  totalEmails: 0,
  processedToday: 0,
  aiRepliesGenerated: 0,
  syncRuns: 0,
  lastSync: null,
  syncStatus: 'idle',
  errorCount: 0,
};

function register(ipcMain) {
  // Get analytics data
  ipcMain.handle('admin:getAnalytics', async () => {
    try {
      const analytics = readAnalytics();
      return { success: true, analytics: analytics || DEFAULT_ANALYTICS };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Get sync status
  ipcMain.handle('admin:getSyncStatus', async () => {
    try {
      const analytics = readAnalytics();
      const data = analytics || DEFAULT_ANALYTICS;
      return {
        success: true,
        status: data.syncStatus || 'idle',
        lastSync: data.lastSync,
        syncRuns: data.syncRuns || 0,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Trigger manual sync (updates analytics and notifies renderer)
  ipcMain.handle('admin:triggerSync', async () => {
    try {
      const filePath = getAnalyticsPath();
      const analytics = readAnalytics() || { ...DEFAULT_ANALYTICS };
      analytics.syncStatus = 'syncing';
      analytics.syncRuns = (analytics.syncRuns || 0) + 1;
      analytics.lastSync = new Date().toISOString();
      fs.writeFileSync(filePath, JSON.stringify(analytics, null, 2), 'utf8');

      notify({ type: 'sync', message: 'Sync started', payload: { status: 'syncing' } });

      // Simulate async sync completion
      setTimeout(() => {
        const current = readAnalytics() || analytics;
        current.syncStatus = 'idle';
        fs.writeFileSync(filePath, JSON.stringify(current, null, 2), 'utf8');
        notify({ type: 'sync', message: 'Sync completed', payload: { status: 'idle' } });
      }, 3000);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { register };
