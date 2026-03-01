const { contextBridge, ipcRenderer } = require('electron');

// Expose amailing API to renderer process via context bridge
contextBridge.exposeInMainWorld('amailing', {
  // Mail / Email connection
  testImap: (config) => ipcRenderer.invoke('mail:testImap', config),
  testSmtp: (config) => ipcRenderer.invoke('mail:testSmtp', config),
  getEmailConfig: () => ipcRenderer.invoke('mail:getEmailConfig'),
  saveEmailConfig: (config) => ipcRenderer.invoke('mail:saveEmailConfig', config),

  // System / Backend config
  getBackendConfig: () => ipcRenderer.invoke('system:getBackendConfig'),

  // Knowledge base
  getKnowledgeStats: () => ipcRenderer.invoke('knowledge:getStats'),
  bulkImportEmails: (options) => ipcRenderer.invoke('knowledge:bulkImport', options),
  clearKnowledge: () => ipcRenderer.invoke('knowledge:clear'),

  // Workspace / Schedule / Limit settings
  getWorkspaceSettings: () => ipcRenderer.invoke('workspace:getSettings'),
  saveWorkspaceSettings: (settings) => ipcRenderer.invoke('workspace:saveSettings', settings),
  getScheduleSettings: () => ipcRenderer.invoke('workspace:getScheduleSettings'),
  saveScheduleSettings: (settings) => ipcRenderer.invoke('workspace:saveScheduleSettings', settings),
  getLimitSettings: () => ipcRenderer.invoke('workspace:getLimitSettings'),
  saveLimitSettings: (settings) => ipcRenderer.invoke('workspace:saveLimitSettings', settings),

  // Analytics
  getAnalytics: () => ipcRenderer.invoke('admin:getAnalytics'),
  getSyncStatus: () => ipcRenderer.invoke('admin:getSyncStatus'),

  // AI bridge
  generateReply: (context) => ipcRenderer.invoke('ai:generateReply', context),
  summarizeThread: (thread) => ipcRenderer.invoke('ai:summarizeThread', thread),

  // Notification listener — returns a cleanup function that removes only this listener.
  onNotification: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('notify', handler);
    return () => ipcRenderer.removeListener('notify', handler);
  },
});
