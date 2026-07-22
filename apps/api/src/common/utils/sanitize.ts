const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?<\/iframe>/gi,
  /<object[\s\S]*?<\/object>/gi,
  /<embed[\s\S]*?<\/embed>/gi,
  /<svg[\s\S]*?<\/svg>/gi,
  /<math[\s\S]*?<\/math>/gi,
  /<base[\s\S]*?>/gi,
  /<link[\s\S]*?>/gi,
  /<meta[\s\S]*?>/gi,
  /on\w+\s*=\s*"[^"]*"/gi,
  /on\w+\s*=\s*'[^']*'/gi,
  /on\w+\s*=\s*[^\s>]+/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /<img[^>]+src\s*=\s*[^>]*on\w+/gi,
  /<body[^>]*on\w+/gi,
  /<div[^>]*on\w+/gi,
  /<span[^>]*on\w+/gi,
  /<a[^>]*href\s*=\s*javascript:/gi,
];

export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return input;
  let result = input;
  for (const pattern of DANGEROUS_PATTERNS) {
    result = result.replace(pattern, '');
  }
  return result;
}

export function sanitizeObject<T>(obj: T, fields: (keyof T)[]): T {
  if (!obj || typeof obj !== 'object') return obj;
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      (result[field] as string) = sanitizeHtml(result[field] as string);
    }
  }
  return result;
}
