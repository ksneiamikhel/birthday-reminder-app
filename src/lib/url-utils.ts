/**
 * Normalize URL by adding http:// if protocol is missing
 */
export function normalizeUrl(url: string): string {
  if (!url || url.trim() === '') {
    return '';
  }

  const trimmed = url.trim();

  // If it already has a protocol, return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Otherwise, add http://
  return `http://${trimmed}`;
}

/**
 * Normalize all URLs in social links
 */
export function normalizeSocialLinks(socialLinks: Record<string, any>) {
  const normalized: Record<string, any> = {};

  for (const [key, value] of Object.entries(socialLinks)) {
    if (key === 'other' && Array.isArray(value)) {
      normalized[key] = value.map(url => normalizeUrl(url));
    } else if (typeof value === 'string') {
      normalized[key] = normalizeUrl(value);
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
}
