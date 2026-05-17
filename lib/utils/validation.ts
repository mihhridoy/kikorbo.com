const BLOCKED_PATTERNS = [
  /(\+880|880|01[3-9]\d{8})/g,
  /@[a-zA-Z0-9_.]+/g,
  /(wa\.me|whatsapp|telegram|t\.me)/gi,
  /(facebook\.com|fb\.com|messenger)/gi,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
];

export function sanitizeMessage(text: string): string {
  let clean = text;
  BLOCKED_PATTERNS.forEach((pattern) => {
    clean = clean.replace(pattern, '[blocked]');
  });
  return clean;
}

export function containsBlockedContent(text: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function isValidFileType(file: File): boolean {
  return ALLOWED_FILE_TYPES.includes(file.type);
}

export function isValidFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}
