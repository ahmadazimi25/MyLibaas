// Regular expressions for detecting personal information
const FILTER_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(?:\+?\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g,
  socialMedia: /(?:^|\s)[@#][\w.]+/g, // Matches social media handles
  websites: /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w.-]+/g,
  commonPlatforms: /(?:whatsapp|telegram|signal|facebook|instagram|snap|twitter|tiktok|venmo|paypal|cashapp)/gi,
  // Common attempts to evade detection
  obfuscatedEmail: /[a-zA-Z0-9._%+-]+\s*[@＠]\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,}/g,
  obfuscatedPhone: /(?:\+?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/g,
  spelledOutDomains: /\b(?:gmail|yahoo|hotmail|outlook)\s*(?:dot|period|\.|punkt)\s*(?:com|org|net|edu)\b/gi,
};

// Words and phrases that might indicate attempts to share contact info
const SUSPICIOUS_PHRASES = [
  'contact me',
  'reach me',
  'my number',
  'my email',
  'my contact',
  'direct message',
  'dm me',
  'pm me',
  'text me',
  'call me',
  'let\'s talk',
  'get in touch',
  'reach out',
  'message me',
  'connect with me',
  'find me',
  'my profile',
  'my handle',
  'my account',
  'dot com',
  'at gmail',
  'at yahoo',
  'at hotmail',
];

// Check if text contains personal information
export const containsPersonalInfo = (text) => {
  // Check all regex patterns
  for (const [type, pattern] of Object.entries(FILTER_PATTERNS)) {
    if (pattern.test(text)) {
      return {
        hasPersonalInfo: true,
        type,
        pattern: pattern.toString(),
      };
    }
  }

  // Check for suspicious phrases
  const lowerText = text.toLowerCase();
  for (const phrase of SUSPICIOUS_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) {
      return {
        hasPersonalInfo: true,
        type: 'suspicious_phrase',
        phrase,
      };
    }
  }

  return {
    hasPersonalInfo: false,
  };
};

// Redact personal information from text
export const redactPersonalInfo = (text) => {
  let redactedText = text;

  // Replace all matches from filter patterns
  for (const [type, pattern] of Object.entries(FILTER_PATTERNS)) {
    redactedText = redactedText.replace(pattern, '[redacted]');
  }

  return redactedText;
};

// Clean user input before saving
export const sanitizeUserInput = (text) => {
  const result = containsPersonalInfo(text);
  if (result.hasPersonalInfo) {
    throw new Error('Personal information is not allowed in this field.');
  }
  return text;
};

// Validate and clean message content
export const validateMessageContent = (content) => {
  const result = containsPersonalInfo(content);
  if (result.hasPersonalInfo) {
    return {
      isValid: false,
      error: 'Messages cannot contain personal contact information.',
      details: result,
    };
  }
  return {
    isValid: true,
    content,
  };
};

// Generate warning message based on detection
export const generateWarningMessage = (result) => {
  if (!result.hasPersonalInfo) return null;

  switch (result.type) {
    case 'email':
      return 'Email addresses are not allowed for your security. Please use the in-app messaging system.';
    case 'phone':
      return 'Phone numbers are not allowed for your security. Please use the in-app messaging system.';
    case 'socialMedia':
      return 'Social media handles are not allowed. Please keep all communication within the app.';
    case 'websites':
      return 'External website links are not allowed for security reasons.';
    case 'suspicious_phrase':
      return 'Your message contains language suggesting an attempt to share contact information. Please keep all communication within the app.';
    default:
      return 'Your message contains content that is not allowed. Please keep all communication within the app.';
  }
};

// Check message for spam or suspicious patterns
export const isSpamOrSuspicious = (content, previousMessages = []) => {
  const checks = {
    // Check for repeated messages
    isRepeated: previousMessages.some(msg => msg.content === content),
    
    // Check for excessive capitalization
    hasExcessiveCaps: (content.match(/[A-Z]/g) || []).length > content.length * 0.5,
    
    // Check for suspicious character repetition
    hasCharRepetition: /(.)\1{4,}/.test(content),
    
    // Check for excessive punctuation
    hasExcessivePunctuation: /[!?.,]{3,}/.test(content),
    
    // Check for suspicious unicode characters often used to evade filters
    hasSuspiciousChars: /[^\x00-\x7F]+/.test(content),
  };

  return {
    isSpam: Object.values(checks).some(Boolean),
    checks,
  };
};
