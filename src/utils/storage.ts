import { Property, SelfHostConfig } from '../types';
import { INITIAL_PROPERTIES } from '../data/mockProperties';
import { filterActiveProperties } from './expiration';

const PROPERTIES_KEY = 'esy_homes_properties_v2_inr';
const WISHLIST_KEY = 'esy_homes_wishlist_v1';
const SELF_HOST_CONFIG_KEY = 'esy_homes_selfhost_config_v1';

export const DEFAULT_SELF_HOST_CONFIG: SelfHostConfig = {
  tursoDatabaseUrl: 'libsql://ezy-homes-vercel-icfg-cnxx2242ugtirkjfrpb3fzwu.aws-ap-south-1.turso.io',
  tursoAuthToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODU5OTA3OTUsImlkIjoiMDE5ZmQ1NTgtY2UwMS03ZTM1LWJjZmYtYmQwMWNmNmYxYmY5Iiwia2lkIjoiRHFFM252OEVEWXp6Z1hrMXQ5ODBINXR5MmJNUVpOOWcxMFF2RnhLM3BJcyIsInJpZCI6IjBlMzE0YzY3LThkYWItNDM2Ni1iOTBkLWYzYTc3M2I5NzRmNiJ9.qRocAor7xXLZaX_mpwNegNMq-3ukrzFzVl7hqrhPhQx10xchY2nZ3AJzYEawh5H9fQi-p4CJrTKEtfTe5ovxAg',
  cloudflareR2Bucket: 'ezyhomes-images',
  cloudflareR2AccountId: '3b25d6fc00d328f896be8a3382324774',
  cloudflareR2PublicDomain: 'https://pub-d98afd66f3284a9c98a71404da771d04.r2.dev',
  cloudflareRocketLoaderEnabled: true,
  customDomain: 'ezy.homes',
  isConfigured: true,
};

export function getStoredProperties(): Property[] {
  try {
    const raw = localStorage.getItem(PROPERTIES_KEY);
    if (!raw) {
      const activeInitial = filterActiveProperties(INITIAL_PROPERTIES);
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(activeInitial));
      return activeInitial;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROPERTIES;
    const activeOnly = filterActiveProperties(list);
    
    // Save back if any expired listings were purged
    if (activeOnly.length !== list.length) {
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(activeOnly));
    }
    
    return activeOnly;
  } catch (e) {
    console.error('Failed to parse stored properties:', e);
    return filterActiveProperties(INITIAL_PROPERTIES);
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
  
  const activeUpdated = filterActiveProperties(updated);

  try {
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(activeUpdated));
  } catch (e) {
    console.error('Failed to save property:', e);
  }
  return activeUpdated;
}

export function deletePropertyFromStore(id: string): Property[] {
  const current = getStoredProperties();
  const updated = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete property:', e);
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
