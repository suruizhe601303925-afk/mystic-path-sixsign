function register(ipcMain) {
  // Generate AI reply for an email thread
  ipcMain.handle('ai:generateReply', async (_event, context) => {
    try {
      // Placeholder: integrate with actual AI service (Gemini, OpenAI, etc.)
      const { subject, threadSummary, tone = 'professional' } = context || {};
      if (!subject && !threadSummary) {
        return { success: false, error: 'Context is required (subject or threadSummary)' };
      }
      // Return a placeholder response – real implementation would call the AI API
      return {
        success: true,
        reply: `[AI-generated reply for "${subject || 'this thread'}" in ${tone} tone]`,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Summarize an email thread
  ipcMain.handle('ai:summarizeThread', async (_event, thread) => {
    try {
      const { messages = [] } = thread || {};
      if (messages.length === 0) {
        return { success: false, error: 'No messages provided for summarization' };
      }
      // Placeholder: real implementation would call the AI API
      return {
        success: true,
        summary: `[AI summary of ${messages.length} message(s)]`,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { register };
