import { Capacitor } from '@capacitor/core';

/**
 * Returns the API base URL based on execution context:
 * - Capacitor Android Native App -> https://www.ezy.homes
 * - Web / PWA / Local Dev -> relative /api or VITE_API_BASE_URL
 */
export function getApiBaseUrl(): string {
  if (Capacitor.isNativePlatform() || (typeof window !== 'undefined' && window.location.protocol === 'capacitor:')) {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && envUrl.trim()) {
      return envUrl.replace(/\/$/, '');
    }
    return 'https://www.ezy.homes';
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.replace(/\/$/, '');
  }

  return '';
}

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${cleanPath}`;
}
