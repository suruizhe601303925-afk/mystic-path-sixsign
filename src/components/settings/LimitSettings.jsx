import React, { useState, useEffect, useCallback } from 'react';

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
      <button className="ml-2 opacity-70 hover:opacity-100" onClick={onClose}>✕</button>
    </div>
  );
}

/**
 * Limit settings panel — configure rate limits, storage caps, and per-sync maximums.
 * All saves show a toast notification (no silent failures).
 */
export function LimitSettings() {
  const amailing = window.amailing;

  const [settings, setSettings] = useState({
    maxEmailsPerSync: 100,
    maxAttachmentSizeMb: 10,
    maxStorageMb: 500,
    rateLimitPerMinute: 60,
  });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => setToast({ message, type }), []);
  const hideToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!amailing) return;
    amailing.getLimitSettings().then((res) => {
      if (res?.settings) setSettings(res.settings);
    });
  }, [amailing]);

  const handleSave = async () => {
    if (!amailing) {
      showToast('amailing API not available (not running in Electron)', 'error');
      return;
    }
    showToast('Saving limit settings…', 'loading');
    try {
      const res = await amailing.saveLimitSettings(settings);
      if (res?.success) {
        showToast('Limit settings saved', 'success');
      } else {
        showToast(res?.error || 'Failed to save limit settings', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save limit settings', 'error');
    }
  };

  const numberField = (label, key, min, max, step = 1, unit = '') => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}{unit ? ` (${unit})` : ''}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={settings[key]}
        onChange={(e) => setSettings((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <h2 className="text-lg font-semibold">Limit Settings</h2>

      <div className="rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {numberField('Max Emails per Sync', 'maxEmailsPerSync', 1, 10000, 1, 'emails')}
          {numberField('Max Attachment Size', 'maxAttachmentSizeMb', 1, 100, 1, 'MB')}
          {numberField('Max Storage', 'maxStorageMb', 100, 10000, 100, 'MB')}
          {numberField('Rate Limit', 'rateLimitPerMinute', 1, 600, 1, 'req/min')}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Save Limits
        </button>
      </div>
    </div>
  );
}
