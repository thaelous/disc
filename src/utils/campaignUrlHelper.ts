import QRCode from 'qrcode';

/**
 * Key for localStorage persistence of custom public base domain
 */
const STORAGE_KEY_PUBLIC_BASE = 'comgico_public_app_base_url';

/**
 * Returns the configured or resolved clean base URL for campaign links
 * Priority:
 * 1. Explicitly configured URL in localStorage (e.g., set by user/admin)
 * 2. Environment variable VITE_PUBLIC_APP_URL
 * 3. window.location.origin (cleaned, without trailing slashes or sandbox artifacts)
 */
export function getCampaignBaseUrl(): string {
  // 1. Check user-configured override
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_PUBLIC_BASE);
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  }

  // 2. Check environment variable (Vite)
  try {
    const envUrl = (import.meta as any)?.env?.VITE_PUBLIC_APP_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
      return envUrl.trim().replace(/\/+$/, '');
    }
  } catch {
    // ignore
  }

  // 3. Fallback to window.location.origin
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return '';
}

/**
 * Saves a custom public base URL (e.g. 'https://mi-dominio.netlify.app')
 */
export function setCampaignBaseUrl(customUrl: string | null): void {
  if (typeof window === 'undefined') return;
  if (!customUrl || !customUrl.trim()) {
    localStorage.removeItem(STORAGE_KEY_PUBLIC_BASE);
  } else {
    localStorage.setItem(STORAGE_KEY_PUBLIC_BASE, customUrl.trim().replace(/\/+$/, ''));
  }
}

/**
 * Generates the clean, relative or absolute URL for direct campaign access
 * Pattern: ${baseUrl}/?campana=${accessCode}
 */
export function getCampaignDirectUrl(campaignCode: string): string {
  const code = (campaignCode || '').trim().toUpperCase();
  const base = getCampaignBaseUrl();
  if (base) {
    return `${base}/?campana=${encodeURIComponent(code)}`;
  }
  return `/?campana=${encodeURIComponent(code)}`;
}

/**
 * Generates a clean authentic SVG string representing the QR code for a given URL
 */
export async function generateQRCodeSVG(text: string): Promise<string> {
  try {
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
    return svgString;
  } catch (err) {
    console.error('Error generating QR code SVG:', err);
    throw err;
  }
}
