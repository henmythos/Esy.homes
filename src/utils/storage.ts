import { Property, SelfHostConfig } from '../types';
import { INITIAL_PROPERTIES } from '../data/mockProperties';

const PROPERTIES_KEY = 'esy_homes_properties_v2_inr';
const WISHLIST_KEY = 'esy_homes_wishlist_v1';
const SELF_HOST_CONFIG_KEY = 'esy_homes_selfhost_config_v1';

export const DEFAULT_SELF_HOST_CONFIG: SelfHostConfig = {
  tursoDatabaseUrl: 'libsql://esy-homes-main-db.turso.io',
  tursoAuthToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_token_esy_homes',
  cloudflareR2Bucket: 'esy-homes-media-cdn',
  cloudflareR2AccountId: 'f9e3e1ab01f14614b332d8e700e7d2a2',
  cloudflareR2PublicDomain: 'https://cdn.esy.homes',
  cloudflareRocketLoaderEnabled: true,
  customDomain: 'esy.homes',
  isConfigured: true,
};

export function getStoredProperties(): Property[] {
  try {
    const raw = localStorage.getItem(PROPERTIES_KEY);
    if (!raw) {
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(INITIAL_PROPERTIES));
      return INITIAL_PROPERTIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROPERTIES;
  } catch (e) {
    console.error('Failed to parse stored properties:', e);
    return INITIAL_PROPERTIES;
  }
}

export function savePropertyToStore(property: Property): Property[] {
  const current = getStoredProperties();
  const existingIdx = current.findIndex((p) => p.id === property.id);
  let updated: Property[];
  
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = property;
  } else {
    updated = [property, ...current];
  }
  
  try {
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save property:', e);
  }
  return updated;
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
