import React, { useState, useEffect, useCallback } from 'react';

const TIMEOUT_MS = 12000;

/**
 * Toast notification component.
 */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    loading: 'bg-blue-600',
    info: 'bg-gray-700',
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-white shadow-lg text-sm ${colors[type] || colors.info}`}
    >
      {type === 'loading' && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      <span>{message}</span>
      <button className="ml-2 opacity-70 hover:opacity-100" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}

/**
 * Email connection form — supports IMAP and SMTP config with:
 * - "Load from Backend Config" button to auto-fill QQ mail / backend settings
 * - Test IMAP / Test SMTP buttons with loading / success / error feedback
 * - Save button with toast notification
 */
export function EmailConnectionForm() {
  const amailing = window.amailing;

  const [config, setConfig] = useState({
    imapHost: '',
    imapPort: 993,
    imapUser: '',
    imapPass: '',
    smtpHost: '',
    smtpPort: 465,
    smtpUser: '',
    smtpPass: '',
  });

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  // Load stored or backend config on mount
  useEffect(() => {
    if (!amailing) return;
    amailing.getEmailConfig().then((res) => {
      if (res?.config) {
        setConfig((prev) => ({ ...prev, ...res.config }));
        if (res.source === 'file') {
          showToast('Backend config loaded automatically', 'info');
        }
      }
    });
  }, [amailing, showToast]);

  const handleLoadBackendConfig = async () => {
    if (!amailing) {
      showToast('amailing API not available (not running in Electron)', 'error');
      return;
    }
    showToast('Loading backend config…', 'loading');
    try {
      const res = await Promise.race([
        amailing.getBackendConfig(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS),
        ),
      ]);
      if (res?.success && res.config) {
        const c = res.config;
        setConfig({
          imapHost: c.imapHost || c.imap_host || config.imapHost,
          imapPort: c.imapPort || c.imap_port || config.imapPort,
          imapUser: c.imapUser || c.imap_user || c.email || config.imapUser,
          imapPass: c.imapPass || c.imap_pass || c.password || config.imapPass,
          smtpHost: c.smtpHost || c.smtp_host || config.smtpHost,
          smtpPort: c.smtpPort || c.smtp_port || config.smtpPort,
          smtpUser: c.smtpUser || c.smtp_user || c.email || config.smtpUser,
          smtpPass: c.smtpPass || c.smtp_pass || c.password || config.smtpPass,
        });
        showToast('Backend config loaded successfully', 'success');
      } else {
        showToast(res?.error || 'No backend config found', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to load backend config', 'error');
    }
  };

  const handleTestImap = async () => {
    if (!amailing) {
      showToast('amailing API not available (not running in Electron)', 'error');
      return;
    }
    showToast('Testing IMAP connection…', 'loading');
    try {
      const res = await Promise.race([
        amailing.testImap({ host: config.imapHost, port: config.imapPort }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('IMAP test timed out')), TIMEOUT_MS),
        ),
      ]);
      if (res?.success) {
        showToast(res.message || 'IMAP connection successful', 'success');
      } else {
        showToast(res?.error || 'IMAP connection failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'IMAP test failed', 'error');
    }
  };

  const handleTestSmtp = async () => {
    if (!amailing) {
      showToast('amailing API not available (not running in Electron)', 'error');
      return;
    }
    showToast('Testing SMTP connection…', 'loading');
    try {
      const res = await Promise.race([
        amailing.testSmtp({ host: config.smtpHost, port: config.smtpPort }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SMTP test timed out')), TIMEOUT_MS),
        ),
      ]);
      if (res?.success) {
        showToast(res.message || 'SMTP connection successful', 'success');
      } else {
        showToast(res?.error || 'SMTP connection failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'SMTP test failed', 'error');
    }
  };

  const handleSave = async () => {
    if (!amailing) {
      showToast('amailing API not available (not running in Electron)', 'error');
      return;
    }
    showToast('Saving email config…', 'loading');
    try {
      const res = await amailing.saveEmailConfig(config);
      if (res?.success) {
        showToast('Email config saved successfully', 'success');
      } else {
        showToast(res?.error || 'Failed to save email config', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save email config', 'error');
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={config[key]}
        onChange={(e) => setConfig((prev) => ({ ...prev, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Email Connection</h2>
        <button
          onClick={handleLoadBackendConfig}
          className="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Load from Backend Config
        </button>
      </div>

      {/* IMAP Section */}
      <div className="rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800">IMAP (Incoming)</h3>
          <button
            onClick={handleTestImap}
            className="rounded bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            Test IMAP
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field('Host', 'imapHost', 'text', 'imap.qq.com')}
          {field('Port', 'imapPort', 'number', '993')}
          {field('Username', 'imapUser', 'text', 'user@qq.com')}
          {field('Password / Auth Token', 'imapPass', 'password', '••••••••')}
        </div>
      </div>

      {/* SMTP Section */}
      <div className="rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800">SMTP (Outgoing)</h3>
          <button
            onClick={handleTestSmtp}
            className="rounded bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            Test SMTP
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field('Host', 'smtpHost', 'text', 'smtp.qq.com')}
          {field('Port', 'smtpPort', 'number', '465')}
          {field('Username', 'smtpUser', 'text', 'user@qq.com')}
          {field('Password / Auth Token', 'smtpPass', 'password', '••••••••')}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Save Email Settings
        </button>
      </div>
    </div>
  );
}
