import { Property, RentalType } from '../types';

export const SECRET_PREMIUM_COUPON = '5436';

export function isValidPremiumCoupon(code?: string): boolean {
  if (!code) return false;
  return code.trim() === SECRET_PREMIUM_COUPON;
}

/**
 * Rules for listing duration:
 * - Monthly rental listing: 90 days active, then automatically deleted.
 * - Daily rental and room stay: 365 days (1 year) active, then automatically deleted.
 * - PG hostel: 365 days (1 year) active, then automatically deleted.
 * - Premium listing (with coupon 5436): Unlimited lifetime active.
 */
export function getListingDurationDays(rentalType?: RentalType, isPremium?: boolean): number {
  if (isPremium) {
    return 9999; // Unlimited duration for premium listings
  }
  if (rentalType === 'monthly_room') {
    return 90; // 90 days for monthly room rentals
  }
  return 365; // 1 year (365 days) for daily rentals & PG hostels
}

/**
 * Calculates remaining active days for a property listing.
 */
export function getDaysRemaining(createdAt?: string, rentalType?: RentalType, isPremium?: boolean): number {
  if (isPremium) return 9999;
  if (!createdAt) return getListingDurationDays(rentalType, isPremium);

  const durationDays = getListingDurationDays(rentalType, isPremium);
  const createdTime = new Date(createdAt).getTime();
  
  if (isNaN(createdTime)) return durationDays;

  const elapsedMs = Date.now() - createdTime;
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const remaining = durationDays - elapsedDays;

  return Math.max(0, remaining);
}

/**
 * Returns true if a property listing has passed its expiration duration.
 */
export function isPropertyExpired(property: Property): boolean {
  if (property.isPremium) return false; // Premium listings do not expire
  return getDaysRemaining(property.createdAt, property.rentalType, property.isPremium) <= 0;
}

/**
 * Filters out all expired properties from array.
 */
export function filterActiveProperties(properties: Property[]): Property[] {
  return properties.filter((p) => !isPropertyExpired(p));
}

/**
 * Normalizes a phone number into last 10 digits for accurate matching across formats.
 * e.g. "+91 6281256601", "06281256601", "916281256601" -> "6281256601"
 */
export function normalizePhoneNumber(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

/**
 * Finds all active properties owned by a given phone number.
 */
export function getUserActiveListings(properties: Property[], phone: string): Property[] {
  const normPhone = normalizePhoneNumber(phone);
  if (!normPhone) return [];

  return properties.filter((p) => {
    if (isPropertyExpired(p)) return false;
    const ownerPhone = normalizePhoneNumber(p.owner.phone);
    const ownerWhatsapp = normalizePhoneNumber(p.owner.whatsapp);
    return ownerPhone === normPhone || ownerWhatsapp === normPhone;
  });
}

/**
 * Free tier limitation: Each phone number can have ONLY 1 active free property listing.
 * Bypassed if user provides valid premium coupon (e.g. 5436).
 */
export function hasReachedFreeListingLimit(
  properties: Property[],
  phone: string,
  editingPropertyId?: string,
  isPremiumCoupon?: boolean
): boolean {
  return false; // Unlimited free listings on ezy.homes
}

export const PREMIUM_WHATSAPP_NUMBER = '916281256601';
export const PREMIUM_WHATSAPP_MESSAGE = 'hey i want to list premium property on ezy.homes';
export const PREMIUM_WHATSAPP_URL = `https://wa.me/${PREMIUM_WHATSAPP_NUMBER}?text=${encodeURIComponent(PREMIUM_WHATSAPP_MESSAGE)}`;

/**
 * Formats property creation time into user-friendly relative time (e.g., "1 day ago", "2 months ago").
 */
export function getTimeAgo(createdAt?: string): string {
  if (!createdAt) return 'Recently';
  const createdTime = new Date(createdAt).getTime();
  if (isNaN(createdTime)) return 'Recently';

  const diffMs = Date.now() - createdTime;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours <= 1) return 'Just now';
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;

  const diffYears = Math.floor(diffDays / 365);
  if (diffYears === 1) return '1 year ago';
  return `${diffYears} years ago`;
}
