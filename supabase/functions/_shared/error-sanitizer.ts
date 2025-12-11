/**
 * Sanitizes error messages to prevent leaking internal API implementation details.
 * This prevents information disclosure vulnerabilities.
 */

// Known sensitive patterns that should be sanitized
const SENSITIVE_PATTERNS = [
  // API provider names and their error formats
  { pattern: /Invalid Pionex response:?\s*\{[^}]+\}/gi, replacement: 'External API error - sync failed' },
  { pattern: /Pionex API error:?\s*[^.]+/gi, replacement: 'External API error' },
  { pattern: /Binance API error:?\s*[^.]+/gi, replacement: 'External API error' },
  { pattern: /INVALID_TIMESTAMP/gi, replacement: 'sync timing error' },
  { pattern: /INVALID_SIGNATURE/gi, replacement: 'authentication error' },
  { pattern: /INVALID_API_KEY/gi, replacement: 'authentication error' },
  
  // Generic API response patterns
  { pattern: /"result":\s*false,\s*"code":\s*"[^"]+"/gi, replacement: 'API error' },
  { pattern: /"error":\s*"[^"]+"/gi, replacement: 'error occurred' },
  { pattern: /"message":\s*"[^"]+"/gi, replacement: '' },
  
  // Remove any JSON objects that might contain sensitive data
  { pattern: /\{[^{}]*"code"[^{}]*\}/gi, replacement: '[error details redacted]' },
  
  // Stack traces and internal paths
  { pattern: /at\s+\S+\s+\([^)]+\)/g, replacement: '' },
  { pattern: /\/[a-zA-Z0-9_\-\/]+\.(ts|js):\d+:\d+/g, replacement: '' },
];

// Error type mappings for user-friendly messages
const ERROR_TYPE_MAP: Record<string, string> = {
  'INVALID_TIMESTAMP': 'Sync timing error - please retry',
  'INVALID_SIGNATURE': 'Authentication failed - check API credentials',
  'INVALID_API_KEY': 'Invalid API key - please update credentials',
  'RATE_LIMIT': 'Too many requests - please wait and retry',
  'TIMEOUT': 'Request timed out - please retry',
  'CONNECTION_REFUSED': 'Unable to connect to service',
  'NETWORK_ERROR': 'Network error - please check connection',
};

/**
 * Sanitizes an error message to remove sensitive implementation details
 * while preserving useful context for debugging.
 * 
 * @param message - The raw error message
 * @param context - Optional context about where the error occurred
 * @returns Sanitized error message safe for storage and display
 */
export function sanitizeErrorMessage(message: string, context?: string): string {
  if (!message) return 'Unknown error occurred';
  
  let sanitized = message;
  
  // Check for known error types first
  for (const [pattern, userMessage] of Object.entries(ERROR_TYPE_MAP)) {
    if (sanitized.toUpperCase().includes(pattern)) {
      return context ? `${context}: ${userMessage}` : userMessage;
    }
  }
  
  // Apply pattern replacements
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  
  // Clean up any remaining JSON-like structures
  sanitized = sanitized.replace(/\{[^}]{50,}\}/g, '[details redacted]');
  
  // Trim and clean up multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // If message is now empty or just whitespace, provide generic message
  if (!sanitized || sanitized.length < 3) {
    return context ? `${context}: Error occurred` : 'Error occurred';
  }
  
  // Truncate very long messages
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 197) + '...';
  }
  
  return context ? `${context}: ${sanitized}` : sanitized;
}

/**
 * Creates a safe error object for logging that doesn't expose sensitive details.
 * Use this for storing errors in the database.
 */
export function createSafeErrorLog(
  error: Error | string,
  context: string
): { message: string; type: string } {
  const rawMessage = error instanceof Error ? error.message : String(error);
  
  return {
    message: sanitizeErrorMessage(rawMessage, context),
    type: error instanceof Error ? error.name : 'Error'
  };
}
