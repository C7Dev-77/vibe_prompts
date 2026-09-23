/**
 * Security utilities for VibePrompts:
 * - Cryptographic hashing (SHA-256)
 * - Safe HTML/script tag sanitization against XSS
 * - Prototype pollution defense
 */

/**
 * Calculates a SHA-256 hexadecimal hash using Web Crypto API.
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitizes plain text input by stripping dangerous tags and control characters.
 * Prevents Stored XSS in community comments and user inputs.
 */
export function sanitizeInput(input: string, maxLength = 2000): string {
  if (!input || typeof input !== 'string') return '';

  return input
    // Strip script and iframe tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Strip generic HTML tags to prevent markup injection
    .replace(/<\/?[^>]+(>|$)/g, '')
    // Remove null bytes and hazardous control chars
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    // Trim whitespace
    .trim()
    // Enforce maximum length
    .slice(0, maxLength);
}

/**
 * Safe object sanitizer that strips prototype-polluting keys (__proto__, constructor, prototype).
 */
export function safeObjectSanitizer<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = safeObjectSanitizer(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}
