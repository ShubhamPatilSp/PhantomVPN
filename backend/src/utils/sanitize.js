/**
 * XSS Sanitization utilities.
 * Uses the 'xss' package (already installed) to clean user inputs.
 */
const xss = require('xss');

// Custom XSS options — allow basic formatting but strip scripts
const xssOptions = {
  whiteList: {
    a: ['href', 'title', 'target', 'rel'],
    b: [], i: [], em: [], strong: [], u: [],
    p: [], br: [], hr: [],
    ul: [], ol: [], li: [],
    h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
    blockquote: [], code: [], pre: [],
    img: ['src', 'alt', 'width', 'height'],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
};

/**
 * Sanitize a single string value.
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return xss(str.trim(), xssOptions);
};

/**
 * Sanitize all string values in an object (shallow).
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Express middleware — sanitizes req.body, req.query, req.params.
 */
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

module.exports = { sanitizeString, sanitizeObject, sanitizeMiddleware };
