export type Currency = 'INR' | 'USD' | 'KES' | 'PHP' | 'ZAR' | 'MXN' | 'EUR';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  rateToUSD: number; // exchange rate relative to USD
}

export type RentalType = 'daily_rental' | 'pg_hostel' | 'monthly_room' | 'commercial_shop' | 'for_sale';

export type SalePropertyType =
  | 'open_plot'
  | 'independent_house'
  | 'flat'
  | 'apartment'
  | 'villa'
  | 'commercial';

export interface SaleDetails {
  propertyType: SalePropertyType; // Type of property being sold
  salePriceINR: number;           // Sale price in INR
  areaSqFt?: number;              // Area in square feet
  areaSqYd?: number;              // Area in square yards (for plots)
  facing?: 'east' | 'west' | 'north' | 'south' | 'north_east' | 'north_west' | 'south_east' | 'south_west'; // Property facing direction
  ageOfPropertyYears?: number;    // 0 = New / Under Construction
  loanAvailable?: boolean;        // Bank loan / home loan available
  ownershipType?: 'freehold' | 'leasehold'; // Ownership type
  furnishedStatus?: 'unfurnished' | 'semi_furnished' | 'fully_furnished'; // For flats/apartments
  totalFloors?: number;
  floorNo?: number;               // For flats
  bhkType?: '1BHK' | '2BHK' | '3BHK' | '4BHK' | '5BHK+'; // For flats/apartments
}

export interface PgDetails {
  gender: 'mens' | 'womens' | 'unisex';
  sharing: 'single' | 'double' | 'triple' | 'four_plus';
  foodIncluded: boolean;
  foodType?: 'veg' | 'non_veg' | 'both';
  acAvailable: boolean;
  noticePeriodDays?: number;
  gateClosingTime?: string;
}

export interface CommercialDetails {
  areaSqFt?: number;
  floorLevel?: string; // e.g. "Ground Floor", "1st Floor", "Basement"
  furnishedStatus?: 'bare_shell' | 'semi_furnished' | 'fully_furnished';
  suitableFor?: string[]; // e.g. ["Retail Store", "Office", "Clinic", "Showroom", "Cafe"]
  parkingAvailable?: boolean;
  powerBackup?: boolean;
}

export interface PointOfInterest {
  id: string;
  name: string;
  category: 'transport' | 'food' | 'grocery' | 'attraction' | 'medical' | 'college' | 'it_park';
  lat: number;
  lng: number;
  distanceMeters: number;
  description?: string;
}

export interface OwnerInfo {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  whatsapp: string; // E.164 formatted without '+' e.g. "919876543210"
  responseRate: string;
  languages: string[];
  joinedDate: string;
  isSuperhost?: boolean;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: 'essential' | 'comfort' | 'safety' | 'outdoor' | 'pg_specific';
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  rentalType: RentalType; // daily_rental, pg_hostel, monthly_room, commercial_shop, for_sale
  category: RentalType | 'apartment' | 'villa' | 'studio' | 'heritage' | 'homestay';
  location: {
    city: string; // e.g. "Bengaluru", "Mumbai", "Hyderabad"
    state?: string; // e.g. "Karnataka", "Maharashtra", "Telangana"
    country: string; // "India"
    address: string;
    neighborhood: string; // Area e.g. "Koramangala", "HSR Layout", "Gachibowli"
    lat: number;
    lng: number;
    pincode?: string;
  };
  priceINR: number; // ₹ Monthly rent OR sale price for for_sale listings
  pricePerNightUSD: number; // Fallback calculated rate for USD conversion
  securityDepositINR?: number; // Deposit required for monthly, PG, or commercial rentals
  customRentDetails?: string; // Flexible pricing details added by the host
  cleaningFeeUSD: number;
  rating: number;
  reviewCount: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  pgDetails?: PgDetails; // Specific to PG Hostels
  commercialDetails?: CommercialDetails; // Specific to Commercial Shops (rental)
  saleDetails?: SaleDetails; // Specific to For Sale listings
  images: string[];
  amenities: string[]; // amenity ids
  customAmenities?: string[]; // custom string amenities added by the host
  nearbyPOIs: PointOfInterest[];
  owner: OwnerInfo;
  blockedDates: string[]; // YYYY-MM-DD strings
  houseRules: string[];
  checkInTime: string;
  checkOutTime: string;
  instantCallAvailable: boolean;
  createdAt: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
}

export interface SearchFilters {
  destination: string;
  rentalType: 'all' | RentalType;
  saleSubType?: SalePropertyType | 'all'; // Filter for sale property sub-types
  category: string;
  city: string;
  area: string;
  genderFilter?: 'all' | 'mens' | 'womens' | 'unisex';
  checkIn: string;
  checkOut: string;
  guests: number;
  minPriceINR: number;
  maxPriceINR: number;
  minPriceUSD: number;
  maxPriceUSD: number;
  amenities: string[];
  instantCallOnly: boolean;
}

export interface IndianCity {
  name: string;
  state: string;
  popularAreas: string[];
  image: string;
  tagline: string;
}

export interface SelfHostConfig {
  tursoDatabaseUrl: string;
  tursoAuthToken: string;
  cloudflareR2Bucket: string;
  cloudflareR2AccountId: string;
  cloudflareR2PublicDomain: string;
  cloudflareRocketLoaderEnabled: boolean;
  customDomain: string;
  isConfigured: boolean;
}

export interface DateRange {
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;   // YYYY-MM-DD
}
