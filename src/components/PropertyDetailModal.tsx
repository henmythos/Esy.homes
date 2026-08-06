import React, { useState } from 'react';
import { Currency, Property } from '../types';
import { formatPrice } from '../utils/currencies';
import { ALL_AMENITIES } from '../data/amenities';
import { getTimeAgo } from '../utils/expiration';
import { OpenStreetMap } from './OpenStreetMap';
import { 
  X, Star, Heart, MapPin, Calendar, Users, Phone, MessageSquare, 
  ShieldCheck, Check, Info, Share2, Sparkles, AlertCircle, Clock,
  Wifi, Wind, Zap, Droplets, Briefcase, Utensils, Waves, Car, Shield, Sun, Tv, Shirt, Maximize2, Flame
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property;
  activeCurrency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onClose: () => void;
}

// Icon helper for amenities
const amenityIconMap: Record<string, React.FC<{ className?: string }>> = {
  wifi: Wifi,
  ac: Wind,
  solar: Zap,
  water_tank: Droplets,
  workspace: Briefcase,
  kitchen: Utensils,
  pool: Waves,
  parking: Car,
  security: Shield,
  beach_access: Sun,
  tv: Tv,
  washing_machine: Shirt,
  balcony: Maximize2,
  bbq: Flame,
};

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  activeCurrency,
  isWishlisted,
  onToggleWishlist,
  onClose,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [checkInDate, setCheckInDate] = useState<string>('2026-08-10');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-08-14');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  const propertyShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?property=${property.id}`
    : `https://www.ezy.homes/?property=${property.id}`;

  const handleShareListing = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${property.title} | ezy.homes`,
          text: `Check out ${property.title} in ${property.location.neighborhood}, ${property.location.city} on ezy.homes`,
          url: propertyShareUrl,
        });
      } catch (e) {
        handleCopyShareLink();
      }
    } else {
      handleCopyShareLink();
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(propertyShareUrl);
    setIsCopiedLink(true);
    setTimeout(() => setIsCopiedLink(false), 2500);
  };

  // Date calculation
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const subtotalUSD = property.pricePerNightUSD * nights;
  const cleaningFeeUSD = property.cleaningFeeUSD;
  const totalUSD = subtotalUSD + cleaningFeeUSD;

  // Generate pre-filled WhatsApp message
  const getWhatsAppUrl = () => {
    const defaultMsg = `Hello ${property.owner.name}, I found your property "${property.title}" on ezy.homes. I would like to book for ${nights} night(s) from ${checkInDate} to ${checkOutDate} for ${guestsCount} guest(s). Total calculated: ${formatPrice(totalUSD, activeCurrency)}. Is this available?`;
    const finalMsg = customMessage ? `${customMessage} (Dates: ${checkInDate} to ${checkOutDate}, ${guestsCount} guests)` : defaultMsg;
    return `https://wa.me/${property.owner.whatsapp}?text=${encodeURIComponent(finalMsg)}`;
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(property.owner.phone);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
              ezy.homes free Listing
            </span>
            <span className="text-xs text-gray-400 hidden sm:inline">• Direct Owner Booking</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareListing}
              className="px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors flex items-center gap-1.5 text-xs font-bold border border-gray-200"
              title="Share Property Link"
            >
              <Share2 className="w-4 h-4 text-rose-500" />
              <span>{isCopiedLink ? 'Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={() => onToggleWishlist(property.id)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
              title={isWishlisted ? 'Saved' : 'Save'}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
          
          {/* Header Title & Location */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {property.isPremium ? (
                <span className="px-2.5 py-0.5 rounded-full font-black text-[10px] tracking-wider uppercase bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs flex items-center gap-1 border border-amber-300">
                  <Zap className="w-3 h-3 fill-current text-amber-200" /> ★ Premium Verified Listing
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> ezy.homes Verified Listing
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 leading-snug">
              {property.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600 font-medium">
              <span className="flex items-center gap-1 text-gray-900 font-bold">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {property.rating.toFixed(2)} ({property.reviewCount} reviews)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Listed {getTimeAgo(property.createdAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-rose-500" />
                {property.location.address}, {property.location.city}, {property.location.country}
              </span>
            </div>
          </div>

          {/* Image Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden max-h-[380px]">
            <div className="md:col-span-2 relative h-64 md:h-full bg-gray-100">
              <img
                src={property.images[activePhotoIdx] || property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover cursor-pointer"
              />
            </div>
            <div className="hidden md:grid grid-cols-2 col-span-2 gap-2 h-full">
              {property.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative h-full bg-gray-100 overflow-hidden cursor-pointer border-2 transition-all ${
                    activePhotoIdx === idx ? 'border-rose-500 scale-[0.98]' : 'border-transparent hover:opacity-90'
                  }`}
                >
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Main Layout: Left Details + Right Booking Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Details, Host, Amenities, Map */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Hosted By Profile Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={property.owner.avatar}
                    alt={property.owner.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-base">
                        Hosted by {property.owner.name}
                      </h3>
                      {property.owner.isSuperhost && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                          Superhost
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Joined {property.owner.joinedDate} • Response rate: {property.owner.responseRate}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      Speaks: {property.owner.languages.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Specs */}
              <div className="flex items-center gap-4 py-3 border-y border-gray-100 text-xs sm:text-sm font-semibold text-gray-700">
                <span>{property.maxGuests} Guests</span>
                <span>•</span>
                <span>{property.bedrooms} Bedrooms</span>
                <span>•</span>
                <span>{property.beds} Beds</span>
                <span>•</span>
                <span>{property.bathrooms} Baths</span>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-gray-900 text-base">About this place</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="flex flex-col gap-3">
                <h3 className="font-bold text-gray-900 text-base">What this place offers</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenityId) => {
                    const amenityInfo = ALL_AMENITIES.find((a) => a.id === amenityId);
                    if (!amenityInfo) return null;
                    const IconComponent = amenityIconMap[amenityId] || Check;
                    return (
                      <div
                        key={amenityId}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800"
                      >
                        <IconComponent className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{amenityInfo.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* OpenStreetMap with Nearby Points of Interest */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500" /> Location & Nearby Points of Interest
                    </h3>
                    <p className="text-xs text-gray-500">
                      Open-source OpenStreetMap rendering local spots, transit, and dining.
                    </p>
                  </div>
                </div>

                <OpenStreetMap
                  lat={property.location.lat}
                  lng={property.location.lng}
                  title={property.title}
                  priceFormatted={formatPrice(property.pricePerNightUSD, activeCurrency)}
                  nearbyPOIs={property.nearbyPOIs}
                />
              </div>



              {/* House Rules */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-600" /> House Rules & Check-in
                </h3>
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" /> Check-in: {property.checkInTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" /> Check-out: {property.checkOutTime}
                  </span>
                </div>
                <ul className="list-disc list-inside text-xs text-gray-600 mt-1 space-y-1">
                  {property.houseRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Right Column: Direct WhatsApp / Call Booking Card & Availability Calendar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-white rounded-3xl p-5 border border-gray-200 shadow-lg flex flex-col gap-5">
                
                {/* Price Display */}
                <div className="flex items-baseline justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-2xl font-black text-gray-900">
                      {formatPrice(property.pricePerNightUSD, activeCurrency)}
                    </span>
                    <span className="text-xs text-gray-500 font-normal"> / night</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{property.rating.toFixed(2)}</span>
                  </div>
                </div>

                {/* Date Selection Box */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" /> Select Availability Dates
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded-2xl p-2 bg-gray-50/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-gray-400">Check-in</span>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="bg-transparent text-xs font-bold text-gray-900 outline-hidden cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col border-l border-gray-200 pl-2">
                      <span className="text-[10px] font-bold uppercase text-gray-400">Check-out</span>
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="bg-transparent text-xs font-bold text-gray-900 outline-hidden cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Blocked Dates Warning */}
                  {property.blockedDates.some((d) => d >= checkInDate && d <= checkOutDate) && (
                    <p className="text-[11px] text-red-600 font-bold bg-red-50 p-2 rounded-xl border border-red-100 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Selected dates contain blocked days
                    </p>
                  )}
                </div>

                {/* Guests Selector */}
                <div className="flex items-center justify-between border border-gray-200 rounded-2xl p-3 bg-gray-50/50">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-rose-500" /> Guests
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                      className="w-7 h-7 rounded-full border border-gray-300 font-bold text-xs bg-white text-gray-700 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-gray-900 w-4 text-center">{guestsCount}</span>
                    <button
                      type="button"
                      onClick={() => setGuestsCount(Math.min(property.maxGuests, guestsCount + 1))}
                      className="w-7 h-7 rounded-full border border-gray-300 font-bold text-xs bg-white text-gray-700 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Custom Note/Question for Host */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-gray-600">
                    Add custom note to host (optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Early check-in requested..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 outline-hidden focus:border-rose-500"
                  />
                </div>

                {/* Price Breakdown */}
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>
                      {formatPrice(property.pricePerNightUSD, activeCurrency)} x {nights} night(s)
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(subtotalUSD, activeCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(cleaningFeeUSD, activeCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-rose-600">
                      {formatPrice(totalUSD, activeCurrency)}
                    </span>
                  </div>
                </div>

                {/* DIRECT WHATSAPP & PHONE CALL BUTTONS */}
                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>Book via WhatsApp</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${property.owner.phone}`}
                      className="py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-rose-500" />
                      <span>Call Owner</span>
                    </a>

                    <button
                      onClick={handleCopyPhone}
                      className="py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      {isCopied ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Copied
                        </span>
                      ) : (
                        <span>Copy Phone</span>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 text-center leading-tight">
                  No payment gateway required • Direct communication with property owner
                </p>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
