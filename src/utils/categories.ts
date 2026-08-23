import { RentalType } from '../types';

export type CategoryId = 'daily_rental' | 'pg_hostel' | 'monthly_room' | 'commercial_shop';

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  pluralLabel: string;
  shortDescription: string;
  iconName: string;
  badgeClass: string;
  supportsCheckIn: boolean; // TRUE ONLY for daily_rental!
  supportsPgDetails: boolean; // TRUE ONLY for pg_hostel!
  supportsCommercialDetails: boolean; // TRUE ONLY for commercial_shop!
  supportsMonthlyRent: boolean; // TRUE for pg_hostel, monthly_room, commercial_shop!
  supportsSecurityDeposit: boolean; // TRUE for pg_hostel, monthly_room, commercial_shop!
}

export const AUTHORITATIVE_CATEGORIES: Record<CategoryId, CategoryDefinition> = {
  daily_rental: {
    id: 'daily_rental',
    label: 'Daily Stay',
    pluralLabel: 'Daily Stays',
    shortDescription: 'Short stays & daily room rentals',
    iconName: 'Calendar',
    badgeClass: 'bg-rose-600 text-white',
    supportsCheckIn: true,
    supportsPgDetails: false,
    supportsCommercialDetails: false,
    supportsMonthlyRent: false,
    supportsSecurityDeposit: false,
  },
  pg_hostel: {
    id: 'pg_hostel',
    label: 'PG Hostel',
    pluralLabel: 'PG Hostels',
    shortDescription: 'Mens, Womens & Unisex PG rentals',
    iconName: 'Users',
    badgeClass: 'bg-blue-600 text-white',
    supportsCheckIn: false,
    supportsPgDetails: true,
    supportsCommercialDetails: false,
    supportsMonthlyRent: true,
    supportsSecurityDeposit: true,
  },
  monthly_room: {
    id: 'monthly_room',
    label: 'Monthly Room',
    pluralLabel: 'Monthly Rooms',
    shortDescription: 'Furnished rooms & 1BHK/2BHK flats',
    iconName: 'Building',
    badgeClass: 'bg-emerald-600 text-white',
    supportsCheckIn: false,
    supportsPgDetails: false,
    supportsCommercialDetails: false,
    supportsMonthlyRent: true,
    supportsSecurityDeposit: true,
  },
  commercial_shop: {
    id: 'commercial_shop',
    label: 'Commercial Shop',
    pluralLabel: 'Commercial Shops',
    shortDescription: 'Shops, retail spaces & commercial offices',
    iconName: 'Store',
    badgeClass: 'bg-purple-600 text-white',
    supportsCheckIn: false,
    supportsPgDetails: false,
    supportsCommercialDetails: true,
    supportsMonthlyRent: true,
    supportsSecurityDeposit: true,
  },
};

/**
 * Normalizes any category string or legacy alias to an authoritative CategoryId.
 */
export function normalizeCategory(cat: string | undefined | null): CategoryId {
  if (!cat) return 'daily_rental';
  const c = String(cat).toLowerCase().trim().replace(/[^a-z0-9_]+/g, '_');
  if (c.includes('pg') || c.includes('hostel')) return 'pg_hostel';
  if (c.includes('monthly') || c.includes('flat') || c.includes('room')) return 'monthly_room';
  if (c.includes('commercial') || c.includes('shop') || c.includes('retail') || c.includes('office')) return 'commercial_shop';
  if (c.includes('daily') || c.includes('stay') || c.includes('hotel')) return 'daily_rental';
  return 'daily_rental';
}

/**
 * Returns CategoryDefinition for any rental type or category string.
 */
export function getCategoryDefinition(cat: string | undefined | null): CategoryDefinition {
  const norm = normalizeCategory(cat);
  return AUTHORITATIVE_CATEGORIES[norm];
}
