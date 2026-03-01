const fs = require('fs');
const path = require('path');

function getKnowledgePath() {
  const { app } = require('electron');
  return path.join(app.getPath('userData'), 'knowledge-base.json');
}

function readKnowledge() {
  const kbPath = getKnowledgePath();
  if (fs.existsSync(kbPath)) {
    try {
      return JSON.parse(fs.readFileSync(kbPath, 'utf8'));
    } catch (err) {
      console.error('[knowledge] Failed to read knowledge base:', err.message);
      return { entries: [], importedCount: 0, lastImport: null };
    }
  }
  return { entries: [], importedCount: 0, lastImport: null };
}

function writeKnowledge(kb) {
  fs.writeFileSync(getKnowledgePath(), JSON.stringify(kb, null, 2), 'utf8');
}

/**
 * Check if an email should be skipped based on import rules.
 * @param {object} email - Email object with subject, from, body fields
 * @param {object} rules - Import rules config
 */
function shouldSkip(email, rules) {
  const { skipMarketing, domainWhitelist, minBodyLength } = rules;

  // Skip marketing emails
  if (skipMarketing) {
    const subject = (email.subject || '').toLowerCase();
    const marketingKeywords = ['unsubscribe', 'promotion', 'newsletter', 'advertisement', 'offer', 'sale', 'deal'];
    if (marketingKeywords.some((kw) => subject.includes(kw))) {
      return true;
    }
  }

  // Domain whitelist filter
  if (domainWhitelist && domainWhitelist.length > 0) {
    const from = email.from || '';
    // Extract email address from "Name <addr>" or plain "addr" format
    const addrMatch = from.match(/<([^>]+)>/) || from.match(/(\S+@\S+)/);
    const emailDomain = addrMatch
      ? (addrMatch[1].includes('@') ? addrMatch[1].split('@')[1].toLowerCase() : '')
      : '';
    if (!domainWhitelist.includes(emailDomain)) {
      return true;
    }
  }

  // Minimum body length filter
  if (minBodyLength && minBodyLength > 0) {
    const bodyLen = (email.body || '').length;
    if (bodyLen < minBodyLength) {
      return true;
    }
  }

  return false;
}

/**
 * Split text into chunks of approximately chunkSize characters.
 */
function chunkText(text, chunkSize) {
  if (!chunkSize || chunkSize <= 0 || text.length <= chunkSize) {
    return [text];
  }
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

function register(ipcMain) {
  // Get knowledge base stats
  ipcMain.handle('knowledge:getStats', async () => {
    try {
      const kb = readKnowledge();
      return {
        success: true,
        stats: {
          entryCount: kb.entries.length,
          importedCount: kb.importedCount,
          lastImport: kb.lastImport,
        },
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Bulk import emails into knowledge base
  ipcMain.handle('knowledge:bulkImport', async (_event, options) => {
    try {
      const {
        emails = [],
        skipMarketing = true,
        chunkSize = 500,
        domainWhitelist = [],
        minBodyLength = 50,
      } = options || {};

      const rules = { skipMarketing, domainWhitelist, minBodyLength };
      const kb = readKnowledge();

      let added = 0;
      let skipped = 0;

      for (const email of emails) {
        if (shouldSkip(email, rules)) {
          skipped++;
          continue;
        }

        const bodyText = email.body || '';
        const chunks = chunkText(bodyText, chunkSize);

        for (const chunk of chunks) {
          kb.entries.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            source: 'email',
            subject: email.subject || '',
            from: email.from || '',
            date: email.date || new Date().toISOString(),
            content: chunk,
            importedAt: new Date().toISOString(),
          });
          added++;
        }
      }

      kb.importedCount = (kb.importedCount || 0) + added;
      kb.lastImport = new Date().toISOString();
      writeKnowledge(kb);

      return {
        success: true,
        added,
        skipped,
        total: kb.entries.length,
        lastImport: kb.lastImport,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Clear knowledge base
  ipcMain.handle('knowledge:clear', async () => {
    try {
      writeKnowledge({ entries: [], importedCount: 0, lastImport: null });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { register };
