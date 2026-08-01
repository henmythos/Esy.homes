import React, { useState } from 'react';
import { SearchFilters } from '../types';
import { Search, PlusCircle, MapPin, SlidersHorizontal, X, Calendar, Users } from 'lucide-react';

interface HeaderProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onOpenHostModal: () => void;
  onOpenSelfHostModal?: () => void;
  onOpenSitemapModal: () => void;
  totalResultsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  onOpenHostModal,
  onOpenSitemapModal,
  totalResultsCount,
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchExpanded(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo / Branding */}
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => onFilterChange({ ...filters, destination: '', category: 'all', city: '' })}>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-none">
                esy<span className="text-rose-500">.homes</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-rose-500/80 uppercase mt-0.5 hidden sm:inline-block">
                Direct Indian Rental Platform
              </span>
            </div>
          </div>

          {/* Search Bar Capsule */}
          <div className="hidden md:flex items-center gap-2">
            <div 
              onClick={() => setIsSearchExpanded(true)}
              className="flex items-center border border-gray-200/90 rounded-full py-1.5 px-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer bg-white group gap-2 text-xs"
            >
              <Search className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="font-bold text-gray-800 max-w-[160px] truncate">
                {filters.destination || filters.city || 'Search city or locality'}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 font-medium max-w-[120px] truncate">
                {filters.rentalType !== 'all' ? filters.rentalType.replace('_', ' ') : 'All Rentals'}
              </span>
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center group-hover:bg-rose-600 transition-colors shadow-2xs ml-1 shrink-0">
                <Search className="w-3 h-3" />
              </div>
            </div>

            {/* Sitemap & Directory button */}
            <button
              onClick={onOpenSitemapModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors border border-gray-200"
              title="SEO Directory & Cities Sitemap"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Cities Sitemap</span>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Host Your Property Button */}
            <button
              onClick={onOpenHostModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-full transition-all shadow-md shadow-rose-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Property</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Trigger Bar */}
        <div className="md:hidden pb-3 pt-1">
          <div 
            onClick={() => setIsSearchExpanded(true)}
            className="w-full flex items-center justify-between border border-gray-200 rounded-full py-2.5 px-4 shadow-xs bg-white text-xs cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-rose-500" />
              <div>
                <p className="font-semibold text-gray-900 leading-tight">
                  {filters.destination || 'Where to?'}
                </p>
                <p className="text-[11px] text-gray-500 font-normal leading-tight">
                  {filters.category !== 'all' ? filters.category : 'Anywhere'} • {filters.guests > 1 ? `${filters.guests} guests` : 'Any week'}
                </p>
              </div>
            </div>
            <div className="p-1.5 rounded-full border border-gray-200 text-gray-600">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

      </div>

      {/* Expanded Search Modal / Drawer */}
      {isSearchExpanded && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-6 sm:pt-16 px-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-rose-500" /> Search Rentals
              </h3>
              <button 
                onClick={() => setIsSearchExpanded(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="p-5 flex flex-col gap-4">
              
              {/* Destination Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> City / Locality / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, HSR Layout, Mumbai, Goa, Cyber Towers..."
                  value={filters.destination}
                  onChange={(e) => onFilterChange({ ...filters, destination: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-hidden text-sm"
                />
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" /> Check-in
                  </label>
                  <input
                    type="date"
                    value={filters.checkIn}
                    onChange={(e) => onFilterChange({ ...filters, checkIn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-rose-500 outline-hidden text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" /> Check-out
                  </label>
                  <input
                    type="date"
                    value={filters.checkOut}
                    onChange={(e) => onFilterChange({ ...filters, checkOut: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-rose-500 outline-hidden text-xs"
                  />
                </div>
              </div>

              {/* Guests Count */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-bold text-gray-700">Guests</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filters, guests: Math.max(1, filters.guests - 1) })}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-gray-900 w-4 text-center">{filters.guests}</span>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filters, guests: filters.guests + 1 })}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange({
                      destination: '',
                      category: 'all',
                      checkIn: '',
                      checkOut: '',
                      guests: 1,
                      minPriceUSD: 0,
                      maxPriceUSD: 1000,
                      amenities: [],
                      instantCallOnly: false,
                    });
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline"
                >
                  Clear all
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition-all flex items-center gap-2"
                >
                  <Search className="w-4 h-4" /> Search {totalResultsCount} Homes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </header>
  );
};
