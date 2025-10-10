/**
 * Device Fingerprint Generation for SmartPromptIQ
 * Generates a stable, versioned browser fingerprint for authentication
 */

async function sha256(message: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    // Fallback for older browsers
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}

export async function getFingerprint(): Promise<string> {
  const KEY = 'spiq_fp_v1';
  const cached = localStorage.getItem(KEY);
  if (cached) return cached;

  const parts = [
    navigator.userAgent || '',
    (navigator.languages || []).join(','),
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    String((navigator as any).hardwareConcurrency || ''),
    String(screen?.width || '') + 'x' + String(screen?.height || ''),
    (navigator as any).platform || '',
    (navigator as any).vendor || '',
  ].join('|');

  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(parts));
  const hashArray = Array.from(new Uint8Array(digest));
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const fp = `v1:${hex}`;
  localStorage.setItem(KEY, fp);
  return fp;
}

/**
 * Clear cached fingerprint (useful for testing or privacy reset)
 */
export function clearFingerprint(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(FINGERPRINT_CACHE_KEY);
  }
}

/**
 * Validate fingerprint format
 */
export function isValidFingerprint(fingerprint: string): boolean {
  if (!fingerprint || typeof fingerprint !== 'string') {
    return false;
  }

  // Check if it starts with a known version
  return fingerprint.startsWith('v1:') && fingerprint.length > 10;
}

/**
 * Extract version from fingerprint
 */
export function getFingerprintVersion(fingerprint: string): string | null {
  if (!fingerprint || typeof fingerprint !== 'string') {
    return null;
  }

  const parts = fingerprint.split(':');
  return parts.length > 1 ? parts[0] : null;
}