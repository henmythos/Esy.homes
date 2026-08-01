import React, { useState } from 'react';
import { INDIAN_CITIES } from '../data/indianCities';
import { SearchFilters, RentalType } from '../types';
import { MapPin, Globe, Compass, ChevronRight, X, Building, Users, Calendar, Search, Sparkles, ExternalLink } from 'lucide-react';

interface SitemapDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCityArea: (city: string, area?: string, rentalType?: RentalType) => void;
}

export const SitemapDirectoryModal: React.FC<SitemapDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectCityArea,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const currentCityObj = INDIAN_CITIES.find(c => c.name.toLowerCase() === selectedCity.toLowerCase()) || INDIAN_CITIES[0];

  const filteredCities = INDIAN_CITIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.popularAreas.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-gray-900 via-rose-950 to-gray-900 text-white p-5 sm:p-6 flex items-center justify-between relative">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" /> SEO Directory & India Rental Sitemap
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Explore Rentals Across India</h2>
            <p className="text-xs text-gray-300 mt-1 max-w-xl">
              Directory structure optimized for easy browsing of Daily Homestays, PG Hostels (Mens/Womens), and Furnished Monthly Rooms.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search inside Directory */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian city, state, or area (e.g. Koramangala, Gachibowli, Bandra)..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            />
          </div>
        </div>

        {/* Body content: Split pane on desktop */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          
          {/* Left Column: All Indian Cities list */}
          <div className="md:col-span-5 p-4 space-y-2 max-h-[450px] md:max-h-none overflow-y-auto bg-gray-50/50">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 px-2">Select Major City</h3>
            <div className="space-y-1">
              {filteredCities.map((city) => {
                const isSelected = city.name.toLowerCase() === selectedCity.toLowerCase();
                return (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(city.name)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-md font-bold'
                        : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-100'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-rose-500'}`} />
                        <span>{city.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {city.state}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-rose-100' : 'text-gray-500'}`}>
                        {city.tagline}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected City Areas & Category Deep-Links */}
          <div className="md:col-span-7 p-5 sm:p-6 space-y-6">
            
            {/* City Banner Header */}
            <div className="relative rounded-2xl overflow-hidden shadow-md group border border-gray-200">
              <img
                src={currentCityObj.image}
                alt={currentCityObj.name}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">{currentCityObj.state}, India</span>
                <h3 className="text-xl font-black">{currentCityObj.name} Rental Directory</h3>
                <p className="text-xs text-gray-200 mt-0.5">{currentCityObj.tagline}</p>
              </div>
            </div>

            {/* Quick Rental Category Deep-Links for Selected City */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Browse by Category in {currentCityObj.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onSelectCityArea(currentCityObj.name, undefined, 'daily_rental');
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-left transition-all"
                >
                  <Calendar className="w-4 h-4 text-rose-600 mb-1" />
                  <div className="text-xs font-bold text-gray-900">Daily Homestays</div>
                  <div className="text-[10px] text-gray-500">Nightly tourist rentals</div>
                </button>

                <button
                  onClick={() => {
                    onSelectCityArea(currentCityObj.name, undefined, 'pg_hostel');
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-left transition-all"
                >
                  <Users className="w-4 h-4 text-blue-600 mb-1" />
                  <div className="text-xs font-bold text-gray-900">PG Hostels</div>
                  <div className="text-[10px] text-gray-500">Mens, Womens & Co-living</div>
                </button>

                <button
                  onClick={() => {
                    onSelectCityArea(currentCityObj.name, undefined, 'monthly_room');
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-left transition-all"
                >
                  <Building className="w-4 h-4 text-emerald-600 mb-1" />
                  <div className="text-xs font-bold text-gray-900">Monthly Rooms</div>
                  <div className="text-[10px] text-gray-500">Furnished 1BHK, 2BHK flats</div>
                </button>
              </div>
            </div>

            {/* Popular Neighborhoods / Hubs in City */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Popular Areas & Hubs in {currentCityObj.name}</span>
                <span className="text-[10px] font-normal text-gray-400">Click to filter area</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentCityObj.popularAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      onSelectCityArea(currentCityObj.name, area);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-rose-500 hover:text-rose-600 text-xs font-medium transition-all shadow-2xs flex items-center gap-1 text-gray-700"
                  >
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>{area}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Structured SEO Breadcrumb & Schema Information */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 space-y-1">
              <div className="font-semibold text-gray-700 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-rose-500" /> SEO Structured Index URL:
              </div>
              <div className="font-mono text-[10px] text-gray-600 bg-white p-1.5 rounded border border-gray-200">
                https://esy.homes/india/{currentCityObj.name.toLowerCase().replace(/\s+/g, '-')}/rentals
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => {
              onSelectCityArea('');
              onClose();
            }}
            className="text-xs font-bold text-gray-600 hover:text-gray-900"
          >
            Show All India Listings
          </button>
          <button
            onClick={() => {
              onSelectCityArea(currentCityObj.name);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-md flex items-center gap-1.5"
          >
            <span>Show All {currentCityObj.name} Rentals</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
