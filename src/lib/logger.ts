/**
 * Centralized Client-Side Logging Utility
 * Captures, processes, and transmits detailed runtime and asynchronous errors
 * from the document generation wizard directly to the server audit ledger.
 */

export interface ErrorContext {
  context: string;
  message: string;
  stack?: string;
  document_type_id?: string;
  recipient_name?: string;
  timestamp: string;
}

/**
 * Robustly logs an error locally to the developer console,
 * and broadcasts it to the server logging API to store inside db.json or Supabase.
 *
 * @param context High-level descriptor of where the error occurred (e.g. "ai_generation", "pdf_export", "form_init")
 * @param error The thrown error or message
 * @param additionalData Optional parameters to log document-specific details
 */
export async function logCentralizedError(
  context: string,
  error: any,
  additionalData?: { documentType?: string; recipientName?: string }
): Promise<void> {
  const errMsg = error?.message || String(error || 'Unknown Error');
  const errStack = error?.stack || '';
  const timestamp = new Date().toISOString();

  // 1. High-visibility local terminal console log for developers
  console.group(`%c[DocuAI Centralized Logger] [Context: ${context}]`, 'color: #ef4444; font-weight: bold; font-size: 11px;');
  console.error('Error details:', errMsg);
  if (errStack) {
    console.error('Stack trace:', errStack);
  }
  if (additionalData) {
    console.log('Context metadata:', additionalData);
  }
  console.groupEnd();

  // 2. Offload asynchronously to server activity logs endpoint to capture and trace issues
  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        context,
        message: errMsg,
        stack: errStack,
        document_type_id: additionalData?.documentType || '',
        recipient_name: additionalData?.recipientName || ''
      })
    });
  } catch (transmitErr) {
    console.warn('[Centralized Logger] Warning: Could not transmit error telemetry to server.', transmitErr);
  }
}
