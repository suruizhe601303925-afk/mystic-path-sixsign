import React, { useState, useEffect, useCallback, useRef } from 'react';

const POLL_INTERVAL_MS = 5000;

/**
 * Analytics view — polls for analytics data every 5 seconds and responds to
 * window.amailing.onNotification events for instant refresh.
 */
export function Analytics() {
  const amailing = window.amailing;

  const [analytics, setAnalytics] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ status: 'idle', lastSync: null });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!amailing) return;
    try {
      const [analyticsRes, syncRes] = await Promise.all([
        amailing.getAnalytics(),
        amailing.getSyncStatus(),
      ]);
      if (analyticsRes?.success) {
        setAnalytics(analyticsRes.analytics);
      }
      if (syncRes?.success) {
        setSyncStatus({ status: syncRes.status, lastSync: syncRes.lastSync });
      }
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    }
  }, [amailing]);

  // Initial fetch + 5-second polling
  useEffect(() => {
    fetchData();
    pollRef.current = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchData]);

  // Instant refresh on notification
  useEffect(() => {
    if (!amailing) return;
    const off = amailing.onNotification((data) => {
      if (data?.type === 'sync' || data?.type === 'import') {
        fetchData();
      }
    });
    return () => { if (typeof off === 'function') off(); };
  }, [amailing, fetchData]);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
  };

  const formatLastUpdated = (date) => {
    if (!date) return '—';
    return date.toLocaleTimeString();
  };

  const syncStatusColor = {
    idle: 'text-green-600 bg-green-50',
    syncing: 'text-blue-600 bg-blue-50',
    error: 'text-red-600 bg-red-50',
  };

  if (!amailing) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-sm">Analytics requires running inside Electron.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center gap-3">
          {/* Sync status badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize ${
              syncStatusColor[syncStatus.status] || 'text-gray-600 bg-gray-100'
            }`}
          >
            {syncStatus.status === 'syncing' && (
              <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {syncStatus.status}
          </span>
          {/* Last updated */}
          <span className="text-xs text-gray-400">
            Updated: {formatLastUpdated(lastUpdated)}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!analytics ? (
        <div className="flex items-center justify-center py-12">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-gray-500">Loading analytics…</span>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Emails" value={analytics.totalEmails ?? 0} />
            <StatCard label="Processed Today" value={analytics.processedToday ?? 0} />
            <StatCard label="AI Replies" value={analytics.aiRepliesGenerated ?? 0} />
            <StatCard label="Sync Runs" value={analytics.syncRuns ?? 0} />
          </div>

          {/* Detail rows */}
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
            <DetailRow label="Last Sync" value={formatDate(syncStatus.lastSync)} />
            <DetailRow label="Sync Status" value={syncStatus.status} />
            <DetailRow label="Error Count" value={analytics.errorCount ?? 0} />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
