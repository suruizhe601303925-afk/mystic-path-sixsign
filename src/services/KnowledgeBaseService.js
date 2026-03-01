/**
 * KnowledgeBaseService — thin wrapper around the window.amailing IPC API
 * for managing the knowledge base from renderer process code.
 */

const amailing = () => {
  if (typeof window !== 'undefined' && window.amailing) return window.amailing;
  return null;
};

/**
 * Get knowledge base statistics.
 * @returns {Promise<{entryCount: number, importedCount: number, lastImport: string|null}>}
 */
export async function getKnowledgeStats() {
  const api = amailing();
  if (!api) throw new Error('amailing API not available');
  const res = await api.getKnowledgeStats();
  if (!res?.success) throw new Error(res?.error || 'Failed to get knowledge stats');
  return res.stats;
}

/**
 * Bulk import emails into the knowledge base.
 *
 * @param {Array<{subject?: string, from?: string, date?: string, body: string}>} emails
 * @param {object} [options]
 * @param {boolean} [options.skipMarketing=true] - Skip emails with marketing keywords
 * @param {number} [options.chunkSize=500] - Split body text into chunks of this size
 * @param {string[]} [options.domainWhitelist=[]] - Only import emails from these domains
 * @param {number} [options.minBodyLength=50] - Skip emails with body shorter than this
 * @returns {Promise<{added: number, skipped: number, total: number, lastImport: string}>}
 */
export async function bulkImportEmails(emails, options = {}) {
  const api = amailing();
  if (!api) throw new Error('amailing API not available');
  const res = await api.bulkImportEmails({ emails, ...options });
  if (!res?.success) throw new Error(res?.error || 'Bulk import failed');
  return res;
}

/**
 * Clear all entries from the knowledge base.
 * @returns {Promise<void>}
 */
export async function clearKnowledgeBase() {
  const api = amailing();
  if (!api) throw new Error('amailing API not available');
  const res = await api.clearKnowledge();
  if (!res?.success) throw new Error(res?.error || 'Failed to clear knowledge base');
}
