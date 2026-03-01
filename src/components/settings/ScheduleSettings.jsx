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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Schedule settings panel — configure auto-sync schedule.
 * All saves show a toast notification (no silent failures).
 */
export function ScheduleSettings() {
  const amailing = window.amailing;

  const [settings, setSettings] = useState({
    enabled: false,
    interval: 30,
    startHour: 8,
    endHour: 20,
    daysOfWeek: [1, 2, 3, 4, 5],
  });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => setToast({ message, type }), []);
  const hideToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!amailing) return;
    amailing.getScheduleSettings().then((res) => {
      if (res?.settings) setSettings(res.settings);
    });
  }, [amailing]);

  const toggleDay = (dayIndex) => {
    setSettings((prev) => {
      const days = prev.daysOfWeek.includes(dayIndex)
        ? prev.daysOfWeek.filter((d) => d !== dayIndex)
        : [...prev.daysOfWeek, dayIndex].sort();
      return { ...prev, daysOfWeek: days };
    });
  };

  const handleSave = async () => {
    if (!amailing) {
      showToast('amailing API not available (not running in Electron)', 'error');
      return;
    }
    showToast('Saving schedule settings…', 'loading');
    try {
      const res = await amailing.saveScheduleSettings(settings);
      if (res?.success) {
        showToast('Schedule settings saved', 'success');
      } else {
        showToast(res?.error || 'Failed to save schedule settings', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save schedule settings', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <h2 className="text-lg font-semibold">Schedule Settings</h2>

      <div className="rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Enable Auto-Sync</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.enabled}
              onChange={(e) => setSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
            <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Sync Interval: {settings.interval} minutes
          </label>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={settings.interval}
            onChange={(e) => setSettings((prev) => ({ ...prev, interval: Number(e.target.value) }))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>5 min</span>
            <span>120 min</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Start Hour</label>
            <input
              type="number"
              min={0}
              max={23}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
              value={settings.startHour}
              onChange={(e) => setSettings((prev) => ({ ...prev, startHour: Number(e.target.value) }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">End Hour</label>
            <input
              type="number"
              min={0}
              max={23}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
              value={settings.endHour}
              onChange={(e) => setSettings((prev) => ({ ...prev, endHour: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Active Days</span>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => toggleDay(i)}
                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                  settings.daysOfWeek.includes(i)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Save Schedule
        </button>
      </div>
    </div>
  );
}
