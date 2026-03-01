import React, { useState, useEffect, useCallback } from 'react';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
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

const DEFAULT_RULES = {
  skipMarketing: true,
  chunkSize: 500,
  domainWhitelist: '',
  minBodyLength: 50,
};

/**
 * Bulk email importer for the Knowledge Base.
 * Supports configurable import rules:
 * - Skip marketing emails
 * - Chunk size for splitting long email bodies
 * - Domain whitelist (comma-separated)
 * - Minimum body length filter
 *
 * Displays import statistics after each run.
 */
export function BulkImporter() {
  const amailing = window.amailing;

  const [rules, setRules] = useState(DEFAULT_RULES);
  const [emailsText, setEmailsText] = useState('');
  const [stats, setStats] = useState(null);
  const [kbStats, setKbStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const showToast = useCallback((message, type = 'info') => setToast({ message, type }), []);
  const hideToast = useCallback(() => setToast(null), []);

  const fetchKbStats = useCallback(async () => {
    if (!amailing) return;
    try {
      const res = await amailing.getKnowledgeStats();
      if (res?.success) setKbStats(res.stats);
    } catch (err) {
      console.error('Failed to fetch knowledge base stats:', err.message);
    }
  }, [amailing]);

  useEffect(() => {
    fetchKbStats();
  }, [fetchKbStats]);

  /**
   * Parse raw text into email objects.
   * Expected format (one email per block separated by blank lines):
   *   Subject: ...
   *   From: ...
   *   Date: ...
   *   Body: ...
   *
   * Falls back to treating each non-empty line as a body-only email.
   */
  const parseEmails = (text) => {
    if (!text.trim()) return [];
    const blocks = text.split(/\n{2,}/);
    return blocks
      .map((block) => {
        const lines = block.trim().split('\n');
        const email = { subject: '', from: '', date: '', body: '' };
        let bodyLines = [];
        let inBody = false;
        for (const line of lines) {
          if (inBody) {
            bodyLines.push(line);
          } else if (/^subject:/i.test(line)) {
            email.subject = line.replace(/^subject:\s*/i, '');
          } else if (/^from:/i.test(line)) {
            email.from = line.replace(/^from:\s*/i, '');
          } else if (/^date:/i.test(line)) {
            email.date = line.replace(/^date:\s*/i, '');
          } else if (/^body:/i.test(line)) {
            inBody = true;
            bodyLines.push(line.replace(/^body:\s*/i, ''));
          } else {
            bodyLines.push(line);
          }
        }
        email.body = bodyLines.join('\n').trim() || block.trim();
        return email;
      })
      .filter((e) => e.body.length > 0);
  };

  const handleImport = async () => {
    if (!amailing) {
      showToast('amailing API not available (not running in Electron)', 'error');
      return;
    }

    const emails = parseEmails(emailsText);
    if (emails.length === 0) {
      showToast('No email content to import', 'error');
      return;
    }

    setIsImporting(true);
    showToast(`Importing ${emails.length} email(s)…`, 'loading');

    try {
      const domainWhitelist = rules.domainWhitelist
        ? rules.domainWhitelist.split(',').map((d) => d.trim()).filter(Boolean)
        : [];

      const res = await amailing.bulkImportEmails({
        emails,
        skipMarketing: rules.skipMarketing,
        chunkSize: Number(rules.chunkSize),
        domainWhitelist,
        minBodyLength: Number(rules.minBodyLength),
      });

      setIsImporting(false);

      if (res?.success) {
        setStats(res);
        showToast(`Import complete: ${res.added} chunks added, ${res.skipped} skipped`, 'success');
        fetchKbStats();
      } else {
        showToast(res?.error || 'Import failed', 'error');
      }
    } catch (err) {
      setIsImporting(false);
      showToast(err.message || 'Import failed', 'error');
    }
  };

  const handleClear = async () => {
    if (!amailing) {
      showToast('amailing API not available (not running in Electron)', 'error');
      return;
    }
    if (!window.confirm('Clear all knowledge base entries?')) return;
    try {
      const res = await amailing.clearKnowledge();
      if (res?.success) {
        showToast('Knowledge base cleared', 'success');
        setStats(null);
        fetchKbStats();
      } else {
        showToast(res?.error || 'Failed to clear knowledge base', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to clear knowledge base', 'error');
    }
  };

  if (!amailing) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        Bulk Importer requires running inside Electron.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Knowledge Base — Email Import</h1>
        {kbStats && (
          <div className="text-sm text-gray-500">
            {kbStats.entryCount} entries · imported {kbStats.importedCount}
            {kbStats.lastImport && (
              <span> · last {new Date(kbStats.lastImport).toLocaleString()}</span>
            )}
          </div>
        )}
      </div>

      {/* Import rules config */}
      <div className="rounded-lg border border-gray-200 p-4 space-y-4">
        <h2 className="font-semibold text-gray-800">Import Rules</h2>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Skip Marketing Emails</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={rules.skipMarketing}
              onChange={(e) => setRules((r) => ({ ...r, skipMarketing: e.target.checked }))}
            />
            <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Chunk Size (chars)</label>
            <input
              type="number"
              min={100}
              max={5000}
              step={100}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
              value={rules.chunkSize}
              onChange={(e) => setRules((r) => ({ ...r, chunkSize: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Min Body Length (chars)</label>
            <input
              type="number"
              min={0}
              max={1000}
              step={10}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
              value={rules.minBodyLength}
              onChange={(e) => setRules((r) => ({ ...r, minBodyLength: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Sender Domain Whitelist <span className="text-gray-400">(comma-separated, leave blank to allow all)</span>
          </label>
          <input
            type="text"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. company.com, example.org"
            value={rules.domainWhitelist}
            onChange={(e) => setRules((r) => ({ ...r, domainWhitelist: e.target.value }))}
          />
        </div>
      </div>

      {/* Email content input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Email Content{' '}
          <span className="text-gray-400">
            (paste emails — separate blocks with a blank line; optional Subject:/From:/Body: prefixes)
          </span>
        </label>
        <textarea
          rows={10}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Subject: Meeting notes\nFrom: alice@company.com\nBody: Here are the notes from today's meeting...\n\nSubject: Follow-up\nFrom: bob@example.org\nBody: Following up on our conversation...`}
          value={emailsText}
          onChange={(e) => setEmailsText(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleClear}
          className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Clear Knowledge Base
        </button>
        <button
          onClick={handleImport}
          disabled={isImporting || !emailsText.trim()}
          className="flex items-center gap-2 rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {isImporting && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {isImporting ? 'Importing…' : 'Import Emails'}
        </button>
      </div>

      {/* Import stats */}
      {stats && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
          <p className="font-semibold text-green-800 mb-2">Import Statistics</p>
          <div className="grid grid-cols-3 gap-2 text-green-700">
            <div>
              <span className="font-medium">Added:</span> {stats.added}
            </div>
            <div>
              <span className="font-medium">Skipped:</span> {stats.skipped}
            </div>
            <div>
              <span className="font-medium">Total entries:</span> {stats.total}
            </div>
          </div>
          {stats.lastImport && (
            <p className="mt-1 text-xs text-green-600">
              Last import: {new Date(stats.lastImport).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
