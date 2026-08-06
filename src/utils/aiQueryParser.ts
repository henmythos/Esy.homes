import { SearchFilters } from '../types';

/**
 * AI & Natural Language Query Parser for Room and Rental Search
 * Interprets queries like: "Mens PG in HSR layout with food under 15000"
 */
export function parseNaturalLanguageQuery(query: string, currentFilters: SearchFilters): SearchFilters {
  if (!query || !query.trim()) return currentFilters;

  const q = query.toLowerCase().trim();
  const newFilters: SearchFilters = { ...currentFilters, destination: query };

  // Detect Rental Type
  if (/\b(pg|hostel|paying guest|pgs|co-living|coliving)\b/i.test(q)) {
    newFilters.rentalType = 'pg_hostel';
  } else if (/\b(daily|homestay|resort|villa|night|hotel|holiday|vacation)\b/i.test(q)) {
    newFilters.rentalType = 'daily_rental';
  } else if (/\b(flat|apartment|monthly|1bhk|2bhk|3bhk|studio|room|house|rent|rental)\b/i.test(q)) {
    newFilters.rentalType = 'monthly_room';
  }

  // Detect Gender Filter
  if (/\b(mens|men's|boys|boy|male|gents)\b/i.test(q)) {
    newFilters.genderFilter = 'mens';
  } else if (/\b(womens|women's|girls|girl|female|ladies)\b/i.test(q)) {
    newFilters.genderFilter = 'womens';
  } else if (/\b(unisex|co-ed|coed|both)\b/i.test(q)) {
    newFilters.genderFilter = 'unisex';
  }

  return newFilters;
}

/**
 * Extracts core location/search tokens from natural language queries
 * Strips category keywords and intent words to accurately match location strings.
 */
export function extractLocationTokens(query: string): string[] {
  if (!query || !query.trim()) return [];

  const stopWords = new Set([
    'in', 'near', 'at', 'for', 'with', 'and', 'the', 'pg', 'pgs', 'hostel', 'hostels',
    'mens', "men's", 'boys', 'boy', 'male', 'gents', 'womens', "women's", 'girls', 'girl',
    'female', 'ladies', 'unisex', 'coed', 'coliving', 'daily', 'monthly', 'rent', 'rental',
    'flat', 'flats', 'apartment', 'apartments', 'room', 'rooms', '1bhk', '2bhk', '3bhk',
    'house', 'stay', 'stays', 'homestay', 'villa', 'under', 'below', 'near', 'nearby'
  ]);

  const rawWords = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
  return rawWords.filter(word => word.length > 1 && !stopWords.has(word));
}

