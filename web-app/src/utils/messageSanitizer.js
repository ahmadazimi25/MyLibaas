// Regular expressions for detecting personal information
const PERSONAL_INFO_PATTERNS = {
  phone: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  url: /(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w.-]*)*\/?/g,
  socialMedia: /[@#][a-zA-Z0-9_]+/g,
  address: /\d{1,5}\s+([a-zA-Z]+\s*)+,\s*[A-Z]{2}\s*\d{5}/g
};

/**
 * Sanitizes a message by removing or masking personal information
 * @param {string} message - The message to sanitize
 * @returns {Object} Object containing sanitized content and whether personal info was found
 */
export const sanitizeMessage = (message) => {
  let hasPersonalInfo = false;
  let sanitizedContent = message;

  // Check for and mask/remove personal information
  Object.entries(PERSONAL_INFO_PATTERNS).forEach(([type, pattern]) => {
    if (pattern.test(sanitizedContent)) {
      hasPersonalInfo = true;
      sanitizedContent = sanitizedContent.replace(pattern, '[REMOVED]');
    }
  });

  return {
    sanitizedContent,
    hasPersonalInfo
  };
};

/**
 * Validates if text contains any personal information
 * @param {string} text - The text to validate
 * @returns {boolean} True if personal information is found
 */
export const containsPersonalInfo = (text) => {
  return Object.values(PERSONAL_INFO_PATTERNS).some(pattern => pattern.test(text));
};

/**
 * Masks personal information in text with asterisks
 * @param {string} text - The text containing personal information
 * @returns {string} Text with personal information masked
 */
export const maskPersonalInfo = (text) => {
  let maskedText = text;
  
  Object.entries(PERSONAL_INFO_PATTERNS).forEach(([type, pattern]) => {
    maskedText = maskedText.replace(pattern, (match) => {
      return '*'.repeat(match.length);
    });
  });

  return maskedText;
};

/**
 * Creates a warning message for specific types of personal information
 * @param {string} text - The text to check
 * @returns {string|null} Warning message if personal info found, null otherwise
 */
export const getPersonalInfoWarning = (text) => {
  const foundTypes = [];
  
  Object.entries(PERSONAL_INFO_PATTERNS).forEach(([type, pattern]) => {
    if (pattern.test(text)) {
      foundTypes.push(type);
    }
  });

  if (foundTypes.length === 0) return null;

  return `Message contains personal information (${foundTypes.join(', ')}). Please remove to continue.`;
};

/**
 * Checks if a username is appropriate and safe
 * @param {string} username - The username to check
 * @returns {boolean} True if username is safe
 */
export const isUsernameSafe = (username) => {
  // No personal info patterns
  if (containsPersonalInfo(username)) return false;

  // No offensive words (implement offensive word list)
  // No impersonation patterns (implement check)
  
  return true;
};
