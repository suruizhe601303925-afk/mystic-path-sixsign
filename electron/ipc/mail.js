const fs = require('fs');
const path = require('path');
const net = require('net');

const IPC_TIMEOUT_MS = 12000;

/**
 * Load email config from config.local.json or config.json in the app root.
 */
function loadFileConfig() {
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
        console.error(`[mail] Failed to parse config file ${filePath}:`, err.message);
      }
    }
  }
  return null;
}

/**
 * Resolve stored email config path.
 */
function getStoredConfigPath() {
  const { app } = require('electron');
  return path.join(app.getPath('userData'), 'email-config.json');
}

function readStoredConfig() {
  const configPath = getStoredConfigPath();
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
      console.error('[mail] Failed to parse stored email config:', err.message);
      return null;
    }
  }
  return null;
}

function writeStoredConfig(config) {
  const configPath = getStoredConfigPath();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

/**
 * Test TCP connectivity with a timeout (used for IMAP/SMTP host+port check).
 */
function testTcpConnection(host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Connection timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    socket.connect(port, host, () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(true);
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      socket.destroy();
      reject(err);
    });
  });
}

/**
 * Wrap a promise with an overall timeout.
 */
function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

function register(ipcMain) {
  // Test IMAP connectivity
  ipcMain.handle('mail:testImap', async (_event, config) => {
    const { host, port } = config || {};
    if (!host || !port) {
      return { success: false, error: 'IMAP host and port are required' };
    }
    try {
      await withTimeout(
        testTcpConnection(host, Number(port), IPC_TIMEOUT_MS),
        IPC_TIMEOUT_MS,
        'IMAP test',
      );
      return { success: true, message: `IMAP connection to ${host}:${port} succeeded` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Test SMTP connectivity
  ipcMain.handle('mail:testSmtp', async (_event, config) => {
    const { host, port } = config || {};
    if (!host || !port) {
      return { success: false, error: 'SMTP host and port are required' };
    }
    try {
      await withTimeout(
        testTcpConnection(host, Number(port), IPC_TIMEOUT_MS),
        IPC_TIMEOUT_MS,
        'SMTP test',
      );
      return { success: true, message: `SMTP connection to ${host}:${port} succeeded` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Get email config (stored > file config fallback)
  ipcMain.handle('mail:getEmailConfig', async () => {
    const stored = readStoredConfig();
    if (stored) return { success: true, config: stored };

    const fileConfig = loadFileConfig();
    if (fileConfig) {
      const config = {
        imapHost: fileConfig.imapHost || fileConfig.imap_host || '',
        imapPort: fileConfig.imapPort || fileConfig.imap_port || 993,
        imapUser: fileConfig.imapUser || fileConfig.imap_user || fileConfig.email || '',
        imapPass: fileConfig.imapPass || fileConfig.imap_pass || fileConfig.password || '',
        smtpHost: fileConfig.smtpHost || fileConfig.smtp_host || '',
        smtpPort: fileConfig.smtpPort || fileConfig.smtp_port || 465,
        smtpUser: fileConfig.smtpUser || fileConfig.smtp_user || fileConfig.email || '',
        smtpPass: fileConfig.smtpPass || fileConfig.smtp_pass || fileConfig.password || '',
      };
      return { success: true, config, source: 'file' };
    }

    return { success: true, config: null };
  });

  // Save email config
  ipcMain.handle('mail:saveEmailConfig', async (_event, config) => {
    try {
      writeStoredConfig(config);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { register };
