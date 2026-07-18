/**
 * Input sanitization utilities — XSS prevention
 */

/**
 * HTML-encode special characters
 */
export function encodeHTML(str) {
  if (typeof str !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Strip all HTML tags
 */
export function stripTags(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Trim and enforce max length
 */
export function sanitizeText(str, maxLen = 255) {
  if (typeof str !== 'string') return '';
  return stripTags(str.trim()).slice(0, maxLen);
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate numeric range
 */
export function isValidPrice(value, min = 0, max = 1000000) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}
