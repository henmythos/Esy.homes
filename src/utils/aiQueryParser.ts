import { SearchFilters } from '../types';

/**
 * AI & Natural Language Query Parser for Room and Rental Search
 * Interprets queries like: "Mens PG in HSR layout with food under 15000"
 */
export function parseNaturalLanguageQuery(query: string, currentFilters: SearchFilters): SearchFilters {
  if (!query || !query.trim()) return currentFilters;

  const q = query.toLowerCase().trim();
  const newFilters = { ...currentFilters, destination: query };

  // Detect Rental Type
  if (q.includes('pg') || q.includes('hostel') || q.includes('paying guest')) {
    newFilters.rentalType = 'pg_hostel';
  } else if (q.includes('daily') || q.includes('homestay') || q.includes('resort') || q.includes('villa')) {
    newFilters.rentalType = 'daily_rental';
  } else if (q.includes('flat') || q.includes('apartment') || q.includes('monthly') || q.includes('1bhk') || q.includes('2bhk')) {
    newFilters.rentalType = 'monthly_room';
  }

  // Detect Gender Filter
  if (q.includes('mens') || q.includes("men's") || q.includes('boys') || q.includes('male')) {
    newFilters.genderFilter = 'mens';
  } else if (q.includes('womens') || q.includes("women's") || q.includes('girls') || q.includes('female') || q.includes('ladies')) {
    newFilters.genderFilter = 'womens';
  } else if (q.includes('unisex') || q.includes('co-ed') || q.includes('coed')) {
    newFilters.genderFilter = 'unisex';
  }

  return newFilters;
}
