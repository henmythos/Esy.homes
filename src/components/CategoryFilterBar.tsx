import React from 'react';
import { SearchFilters, RentalType } from '../types';
import { INDIAN_CITIES } from '../data/indianCities';
import { Calendar, Users, Home, Building2, MapPin, Zap } from 'lucide-react';

interface CategoryFilterBarProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  totalCount: number;
}

const RENTAL_TYPES: { id: 'all' | RentalType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'All Rentals (₹)', icon: Home },
  { id: 'daily_rental', label: 'Daily Stays', icon: Calendar },
  { id: 'pg_hostel', label: 'PG Hostels', icon: Users },
  { id: 'monthly_room', label: 'Monthly Rooms', icon: Building2 },
];

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  filters,
  onFilterChange,
  totalCount,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-16 sm:top-20 z-20 shadow-2xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        
        {/* Main Segmented Type Selector + City Selector in one stable row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 shrink-0">
            {RENTAL_TYPES.map((type) => {
              const Icon = type.icon;
              const isActive = (filters.rentalType || 'all') === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => onFilterChange({ ...filters, rentalType: type.id })}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                    isActive
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200/80 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-rose-500'}`} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* City Pills & PG Filter inline row */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* PG Filter inline toggle if PG or All is active */}
            {(filters.rentalType === 'pg_hostel' || filters.rentalType === 'all') && (
              <div className="flex items-center gap-1 shrink-0 bg-gray-100 p-0.5 rounded-full border border-gray-200">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'mens', label: 'Mens' },
                  { id: 'womens', label: 'Womens' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => onFilterChange({ ...filters, genderFilter: g.id as any })}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                      (filters.genderFilter || 'all') === g.id
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Cities */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-0.5">
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
                        ? 'bg-rose-600 text-white font-bold shadow-2xs'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {city.name}
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-rose-50/50 px-2.5 py-1 rounded-full border border-rose-100 shrink-0">
              <Zap className="w-3 h-3 text-rose-500" />
              <span>{totalCount} Properties</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
