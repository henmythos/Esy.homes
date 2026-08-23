import { Property } from '../types';

/**
 * Extracts a numeric timestamp from property ID (prop-1786944...) or createdAt string.
 */

export function getPropertyTimestamp(p: Property): number {
  if (p.id) {
    const match = p.id.match(/\d{10,13}/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (!isNaN(num) && num > 1000000000000) {
        return num;
      }
      if (!isNaN(num) && num > 1000000000) {
        return num * 1000;
      }
    }
  }
  if (p.createdAt) {
    const t = new Date(p.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  return 0;
}

/**
 * Single source of truth for Property Ordering & Recommendation across ezy.homes.
 * 
 * Default Priority:
 * 1. Active / Valid properties (filtered separately)
 * 2. Complete listings with photos over listings without photos
 * 3. Newer listings first (recent timestamp / createdAt)
 * 4. Premium / Verified / Featured badge signals
 * 5. Rating & Review Count tie-breaker
 */
export function sortProperties(properties: Property[]): Property[] {
  return [...properties].sort((a, b) => {
    // 1. Premium / Verified boost
    const aPremium = a.isPremium || a.isVerified || a.isFeatured ? 1 : 0;
    const bPremium = b.isPremium || b.isVerified || b.isFeatured ? 1 : 0;
    if (aPremium !== bPremium) {
      return bPremium - aPremium;
    }

    // 2. Photos Completeness: Listings with photos > listings without
    const aHasPhotos = Array.isArray(a.images) && a.images.length > 0;
    const bHasPhotos = Array.isArray(b.images) && b.images.length > 0;
    if (aHasPhotos !== bHasPhotos) {
      return aHasPhotos ? -1 : 1;
    }

    // 3. Newer listings first (Recency Priority)
    const aTime = getPropertyTimestamp(a);
    const bTime = getPropertyTimestamp(b);
    if (aTime !== bTime) {
      return bTime - aTime;
    }

    // 4. Rating & Reviews
    const aRating = a.rating || 0;
    const bRating = b.rating || 0;
    if (aRating !== bRating) {
      return bRating - aRating;
    }

    const aReviews = a.reviewCount || 0;
    const bReviews = b.reviewCount || 0;
    if (aReviews !== bReviews) {
      return bReviews - aReviews;
    }

    return 0;
  });
}
