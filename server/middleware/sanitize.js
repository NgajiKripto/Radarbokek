/**
 * Input sanitization middleware — XSS prevention
 */

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char]);
}

function sanitizeValue(value) {
  if (typeof value === 'string') {
    return escapeHTML(value.trim());
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    return sanitizeObject(value);
  }
  return value;
}

function sanitizeObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    // Only sanitize values, not keys (key escaping breaks expected field names)
    result[key] = sanitizeValue(value);
  }
  return result;
}

/**
 * Sanitize req.body
 */
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}
