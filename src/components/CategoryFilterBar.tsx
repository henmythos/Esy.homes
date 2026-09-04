import React from 'react';
import { SearchFilters, RentalType, SalePropertyType } from '../types';
import { INDIAN_CITIES } from '../data/indianCities';
import { SALE_PROPERTY_TYPES } from '../utils/categories';
import { Calendar, Users, Home, Building2, Store, MapPin, Zap, Tag } from 'lucide-react';

interface CategoryFilterBarProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  totalCount: number;
}

const RENTAL_TYPES: { id: 'all' | RentalType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all',             label: 'All',             icon: Home },
  { id: 'daily_rental',   label: 'Daily Stay',      icon: Calendar },
  { id: 'pg_hostel',      label: 'PG Hostel',       icon: Users },
  { id: 'monthly_room',   label: 'Monthly Room',    icon: Building2 },
  { id: 'commercial_shop',label: 'Commercial',      icon: Store },
  { id: 'for_sale',       label: 'For Sale 🏷️',    icon: Tag },
];

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  filters,
  onFilterChange,
  totalCount,
}) => {
  const isForSale = filters.rentalType === 'for_sale';
  const isPG = filters.rentalType === 'pg_hostel' || filters.rentalType === 'all';

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-16 sm:top-20 z-20 shadow-sm transition-all duration-200">
      {/* Hidden/Semantic H1 for Search Engine Indexing */}
      <h1 className="sr-only">
        Free Property Listing Website — Post & Find Rentals, PG Hostels, Monthly Rooms, Daily Stays & Properties for Sale
      </h1>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 pb-2">

        {/* ─── Row 1: Category Tabs ─── */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {RENTAL_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = (filters.rentalType || 'all') === type.id;
            return (
              <button
                key={type.id}
                onClick={() => onFilterChange({
                  ...filters,
                  rentalType: type.id,
                  saleSubType: 'all', // reset sale sub-filter on tab change
                })}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isActive
                    ? type.id === 'for_sale'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200/80 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : type.id === 'for_sale' ? 'text-teal-500' : 'text-rose-500'}`} />
                <span>{type.label}</span>
              </button>
            );
          })}

          {/* Live count badge */}
          <div className="ml-auto flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-rose-50/60 px-2.5 py-1 rounded-full border border-rose-100 shrink-0">
            <Zap className="w-3 h-3 text-rose-500" />
            <span>{totalCount}</span>
          </div>
        </div>

        {/* ─── Row 2: Sub-filters (context-aware) ─── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">

          {/* For Sale — sub-type filter chips */}
          {isForSale && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onFilterChange({ ...filters, saleSubType: 'all' })}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                  !filters.saleSubType || filters.saleSubType === 'all'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                All Types
              </button>
              {SALE_PROPERTY_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onFilterChange({ ...filters, saleSubType: t.id as SalePropertyType })}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                    filters.saleSubType === t.id
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* PG Gender filter */}
          {isPG && !isForSale && (
            <div className="flex items-center gap-1 shrink-0 bg-gray-100 p-0.5 rounded-full border border-gray-200">
              {[
                { id: 'all',    label: 'All' },
                { id: 'mens',   label: 'Mens' },
                { id: 'womens', label: 'Womens' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => onFilterChange({ ...filters, genderFilter: g.id as any })}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                    (filters.genderFilter || 'all') === g.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}

          {/* City pills */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] font-bold text-gray-400 flex items-center gap-0.5 pl-1">
              <MapPin className="w-3 h-3 text-rose-500" />
            </span>
            <button
              onClick={() => onFilterChange({ ...filters, city: '' })}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${
                !filters.city
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              All Cities
            </button>
            {INDIAN_CITIES.slice(0, 6).map((city) => {
              const isActive = filters.city.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.name}
                  onClick={() => onFilterChange({ ...filters, city: city.name })}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-rose-600 text-white font-bold shadow-sm'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
