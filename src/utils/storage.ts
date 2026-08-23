import { Property, SelfHostConfig } from '../types';
import { INITIAL_PROPERTIES } from '../data/mockProperties';
import { filterActiveProperties } from './expiration';
import { getApiUrl } from './apiConfig';

const PROPERTIES_KEY = 'esy_homes_properties_v2_inr';
const WISHLIST_KEY = 'esy_homes_wishlist_v1';
const SELF_HOST_CONFIG_KEY = 'esy_homes_selfhost_config_v1';

export const DEFAULT_SELF_HOST_CONFIG: SelfHostConfig = {
  tursoDatabaseUrl: 'libsql://ezy-homes-vercel-icfg-cnxx2242ugtirkjfrpb3fzwu.aws-ap-south-1.turso.io',
  tursoAuthToken: '', // Server-side environment variable TURSO_AUTH_TOKEN is used for database auth
  cloudflareR2Bucket: 'ezyhomes-images',
  cloudflareR2AccountId: '3b25d6fc00d328f896be8a3382324774',
  cloudflareR2PublicDomain: 'https://pub-d98afd66f3284a9c98a71404da771d04.r2.dev',
  cloudflareRocketLoaderEnabled: true,
  customDomain: 'ezy.homes',
  isConfigured: true,
};

export async function getStoredProperties(): Promise<Property[]> {
  try {
    const res = await fetch(getApiUrl('/api/properties'));
    if (res.ok) {
      const properties = await res.json();
      if (Array.isArray(properties)) {
        return filterActiveProperties(properties);
      }
    }
  } catch (e) {
    console.error('Failed to fetch properties from live database:', e);
  }
  return filterActiveProperties(INITIAL_PROPERTIES);
}

export async function savePropertyToStore(property: Property): Promise<Property[]> {
  const res = await fetch(getApiUrl('/api/properties'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(property)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData.error || errData.details || `Server returned HTTP ${res.status}`;
    console.error('Failed to save property to live server database:', msg);
    throw new Error(`Live Database Error: ${msg}`);
  }

  return await getStoredProperties();
}

export async function deletePropertyFromStore(id: string): Promise<Property[]> {
  try {
    const res = await fetch(getApiUrl(`/api/properties/${id}`), { method: 'DELETE' });
    if (!res.ok) {
      console.error('Failed to delete property from server database:', res.statusText);
    }
  } catch (e) {
    console.error('API delete error:', e);
  }

  return await getStoredProperties();
}

export function getWishlistIds(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleWishlistId(id: string): string[] {
  const current = getWishlistIds();
  const exists = current.includes(id);
  const updated = exists ? current.filter((item) => item !== id) : [...current, id];
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update wishlist:', e);
  }
  return updated;
}

export function getSelfHostConfig(): SelfHostConfig {
  try {
    const raw = localStorage.getItem(SELF_HOST_CONFIG_KEY);
    if (!raw) {
      return DEFAULT_SELF_HOST_CONFIG;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SELF_HOST_CONFIG;
  }
}

export function saveSelfHostConfig(config: SelfHostConfig): void {
  try {
    localStorage.setItem(SELF_HOST_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save self host config:', e);
  }
}
