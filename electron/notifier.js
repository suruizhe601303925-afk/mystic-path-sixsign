let _mainWindow = null;

/**
 * Setup the notifier with a reference to the main window.
 * @param {import('electron').BrowserWindow} mainWindow
 */
function setupNotifier(mainWindow) {
  _mainWindow = mainWindow;
}

/**
 * Send a notification event to the renderer process.
 * @param {object} data - Notification payload
 * @param {string} data.type - Notification type (e.g. 'sync', 'import', 'error')
 * @param {string} data.message - Human-readable message
 * @param {*} [data.payload] - Optional additional data
 */
function notify(data) {
  if (_mainWindow && !_mainWindow.isDestroyed()) {
    _mainWindow.webContents.send('notify', data);
  }
}

module.exports = { setupNotifier, notify };
