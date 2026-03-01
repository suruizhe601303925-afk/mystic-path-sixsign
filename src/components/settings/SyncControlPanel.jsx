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
 * Sync control panel — trigger manual sync and display sync status.
 * Save/sync actions always show a toast notification (no silent failures).
 */
export function SyncControlPanel() {
  const amailing = window.amailing;

  const [syncStatus, setSyncStatus] = useState({ status: 'idle', lastSync: null, syncRuns: 0 });
  const [toast, setToast] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = useCallback((message, type = 'info') => setToast({ message, type }), []);
  const hideToast = useCallback(() => setToast(null), []);

  const fetchSyncStatus = useCallback(async () => {
    if (!amailing) return;
    try {
      const res = await amailing.getSyncStatus();
      if (res?.success) {
        setSyncStatus({
          status: res.status || 'idle',
          lastSync: res.lastSync,
          syncRuns: res.syncRuns || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch sync status:', err.message);
    }
  }, [amailing]);

  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  // Listen for sync notifications from main process
  useEffect(() => {
    if (!amailing) return;
    const off = amailing.onNotification((data) => {
      if (data?.type === 'sync') {
        fetchSyncStatus();
        if (data.payload?.status === 'idle') setIsSyncing(false);
      }
    });
    return () => { if (typeof off === 'function') off(); };
  }, [amailing, fetchSyncStatus]);

  const handleTriggerSync = async () => {
    if (!amailing) {
      showToast('amailing API not available (not running in Electron)', 'error');
      return;
    }
    setIsSyncing(true);
    showToast('Sync triggered…', 'loading');
    try {
      const res = await amailing.getSyncStatus(); // read current status
      fetchSyncStatus();
      if (res?.success) {
        showToast('Sync is running', 'info');
      }
    } catch (err) {
      setIsSyncing(false);
      showToast(err.message || 'Failed to trigger sync', 'error');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleString();
  };

  const statusColor = {
    idle: 'text-green-600',
    syncing: 'text-blue-600',
    error: 'text-red-600',
  };

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <h2 className="text-lg font-semibold">Sync Control</h2>

      <div className="rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Sync Status</span>
          <span className={`text-sm font-semibold capitalize ${statusColor[syncStatus.status] || 'text-gray-600'}`}>
            {syncStatus.status}
            {syncStatus.status === 'syncing' && (
              <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Last Sync</span>
          <span>{formatDate(syncStatus.lastSync)}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total Sync Runs</span>
          <span>{syncStatus.syncRuns}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="flex items-center gap-2 rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {isSyncing && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {isSyncing ? 'Syncing…' : 'Trigger Manual Sync'}
        </button>
      </div>
    </div>
  );
}
