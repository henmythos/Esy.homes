import React, { useState, useEffect } from 'react';
import { Currency, Property } from '../types';
import { formatPrice } from '../utils/currencies';
import { ALL_AMENITIES } from '../data/amenities';
import { getTimeAgo, getUpgradePropertyWhatsAppUrl } from '../utils/expiration';
import { OpenStreetMap } from './OpenStreetMap';
import { 
  X, Star, Heart, MapPin, Calendar, Users, Phone, MessageSquare, 
  ShieldCheck, Check, Info, Share2, Sparkles, AlertCircle, Clock,
  Wifi, Wind, Zap, Droplets, Briefcase, Utensils, Waves, Car, Shield, Sun, Tv, Shirt, Maximize2, Flame,
  ChevronLeft, ChevronRight, Home, Eye
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
  const propertyImages = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'];

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isFullscreenView, setIsFullscreenView] = useState(false);
  const [checkInDate, setCheckInDate] = useState<string>('2026-08-10');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-08-14');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  // Swipe handling state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivePhotoIdx((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivePhotoIdx((prev) => (prev === propertyImages.length - 1 ? 0 : prev + 1));
  };

  // Touch event handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null); // Reset
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      handleNextPhoto();
    } else if (isRightSwipe) {
      handlePrevPhoto();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'Escape') setIsFullscreenView(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [propertyImages.length]);

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

  // Price calculation in INR
  const priceINR = property.priceINR || (property.pricePerNightUSD * 83.5);
  const nights = calculateNights();
  const isDaily = property.rentalType === 'daily_rental';
  const subtotalINR = isDaily ? priceINR * nights : priceINR;
  const cleaningFeeINR = (property.cleaningFeeUSD || 0) * 83.5;
  const totalINR = subtotalINR + cleaningFeeINR;

  // Generate pre-filled WhatsApp message
  const getWhatsAppUrl = () => {
    const rateLabel = isDaily ? `${nights} night(s)` : `monthly rental`;
    const defaultMsg = `Hello ${property.owner.name}, I found your property "${property.title}" in ${property.location.neighborhood}, ${property.location.city} on ezy.homes. I would like to inquire about booking for ${rateLabel} starting ${checkInDate} for ${guestsCount} person(s). Rate: ${formatPrice(priceINR, activeCurrency)}. Is this available?`;
    const finalMsg = customMessage ? `${customMessage} (Inquiry for ${checkInDate}, ${guestsCount} guests)` : defaultMsg;
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
                  <Zap className="w-3 h-3 fill-current text-amber-200" /> ★ ezy.homes Verified Listing
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> ezy.homes Free Listing
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

          {/* Image Gallery Stage with Left/Right Slide Controls, Watermark & Thumbnails */}
          <div className="flex flex-col gap-3 select-none">
            
            {/* Primary Main Image Showcase */}
            <div 
              className="relative h-72 sm:h-96 md:h-[420px] w-full rounded-2xl bg-slate-950 overflow-hidden group border border-slate-200/80 shadow-xs"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img
                src={propertyImages[activePhotoIdx] || propertyImages[0]}
                alt={property.title}
                onClick={() => setIsFullscreenView(true)}
                className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-101"
              />

              {/* Auto Watermark in Left Corner (Always on all property images) */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs sm:text-sm font-black tracking-wide border border-white/25 shadow-xl">
                <Home className="w-4 h-4 text-rose-400 fill-rose-400/20 shrink-0" />
                <span className="text-rose-400 font-extrabold">ezy</span>
                <span className="text-white">.homes</span>
              </div>

              {/* Left & Right Slide Controls */}
              {propertyImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/65 hover:bg-black/90 text-white shadow-xl transition-all backdrop-blur-xs z-20 hover:scale-110 active:scale-95 border border-white/25"
                    title="Previous Photo (Left Arrow)"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/65 hover:bg-black/90 text-white shadow-xl transition-all backdrop-blur-xs z-20 hover:scale-110 active:scale-95 border border-white/25"
                    title="Next Photo (Right Arrow)"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}

              {/* Photo Counter Pill */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/20 shadow-xs">
                {activePhotoIdx + 1} / {propertyImages.length}
              </div>

              {/* Full View Button */}
              <button
                type="button"
                onClick={() => setIsFullscreenView(true)}
                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 px-3.5 py-1.5 sm:py-2 rounded-xl bg-black/80 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-md shadow-lg border border-white/25 transition-all hover:scale-105 active:scale-95"
              >
                <Maximize2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Full View</span>
              </button>
            </div>

            {/* Clickable Thumbnail Carousel Bar */}
            {propertyImages.length > 0 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
                {propertyImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative h-16 w-24 sm:h-20 sm:w-32 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx
                        ? 'border-rose-500 ring-2 ring-rose-500/30 scale-[1.02] opacity-100 shadow-md'
                        : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    
                    {/* Auto Watermark badge on thumbnails */}
                    <div className="absolute bottom-1 left-1 z-10 pointer-events-none flex items-center gap-0.5 px-1 py-0.2 rounded bg-black/80 text-[8px] font-black text-white border border-white/20">
                      <span className="text-rose-400">ezy</span>
                      <span>.homes</span>
                    </div>

                    <div className="absolute top-1 right-1 z-10 px-1 py-0.2 rounded bg-black/70 text-[8px] font-mono text-white">
                      #{idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}

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
              <div className="flex items-center gap-4 py-3 border-y border-gray-100 text-xs sm:text-sm font-semibold text-gray-700 flex-wrap">
                <span>{property.maxGuests} Guests</span>
                <span>•</span>
                <span>{property.bedrooms} Bedrooms</span>
                <span>•</span>
                <span>{property.beds} Beds</span>
                <span>•</span>
                <span>{property.bathrooms} Baths</span>
              </div>

              {/* Key Highlights & PG/Deposit Specifications Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3">
                <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider text-rose-600">
                  Key Specifications & Rental Terms
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-semibold text-gray-800">
                  {property.rentalType === 'pg_hostel' && property.pgDetails && (
                    <>
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex flex-col gap-0.5 shadow-2xs">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">PG Gender</span>
                        <span className="font-extrabold text-slate-900 capitalize">{property.pgDetails.gender} PG</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex flex-col gap-0.5 shadow-2xs">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Sharing Type</span>
                        <span className="font-extrabold text-slate-900 capitalize">{property.pgDetails.sharing} Sharing</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex flex-col gap-0.5 shadow-2xs">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Food Included</span>
                        <span className="font-extrabold text-emerald-700">{property.pgDetails.foodIncluded ? 'Yes (3 Meals)' : 'No Meals'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex flex-col gap-0.5 shadow-2xs">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">AC Room</span>
                        <span className="font-extrabold text-slate-900">{property.pgDetails.acAvailable ? 'AC Available' : 'Non-AC'}</span>
                      </div>
                    </>
                  )}

                  {property.securityDepositINR !== undefined && property.securityDepositINR > 0 && (
                    <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex flex-col gap-0.5 shadow-2xs">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Security Deposit</span>
                      <span className="font-extrabold text-rose-600">₹{property.securityDepositINR.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-white border border-gray-200 flex flex-col gap-0.5 shadow-2xs">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Listing Category</span>
                    <span className="font-extrabold text-slate-900 uppercase text-[11px]">{property.rentalType.replace('_', ' ')}</span>
                  </div>
                </div>
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
                  {property.customAmenities?.map((customAmenity, idx) => (
                    <div
                      key={`custom-${idx}`}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-800 shadow-2xs"
                    >
                      <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{customAmenity}</span>
                    </div>
                  ))}
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
                  priceFormatted={formatPrice(priceINR, activeCurrency)}
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
                <div className="flex flex-col gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-gray-900">
                        {formatPrice(priceINR, activeCurrency)}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        {isDaily ? ' / night' : ' / month'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{property.rating.toFixed(2)}</span>
                    </div>
                  </div>
                  {property.customRentDetails && (
                    <div className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100">
                      <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wide block mb-1">Pricing Details</span>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap">{property.customRentDetails}</p>
                    </div>
                  )}
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
                    <Users className="w-3.5 h-3.5 text-rose-500" /> Guests / Tenants
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
                      {formatPrice(priceINR, activeCurrency)} {isDaily ? `x ${nights} night(s)` : ' / month'}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(subtotalINR, activeCurrency)}
                    </span>
                  </div>
                  {cleaningFeeINR > 0 && (
                    <div className="flex justify-between">
                      <span>Cleaning fee</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(cleaningFeeINR, activeCurrency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-rose-600">
                      {formatPrice(totalINR, activeCurrency)}
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

                {/* DIRECT PREMIUM UPGRADE CTA FOR HOSTS */}
                {!property.isPremium && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-amber-950 text-white border border-amber-500/30 flex flex-col gap-2 mt-2 shadow-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 fill-current" />
                      <span className="text-xs font-black text-amber-200">Are you the owner of this listing?</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Upgrade to <strong className="text-white">★ Premium Verified</strong> for featured top placement & 5x more tenant calls.
                    </p>
                    <a
                      href={getUpgradePropertyWhatsAppUrl(property.title, property.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current text-amber-200" /> Upgrade on WhatsApp
                    </a>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Fullscreen Image Lightbox Modal with Auto Watermark & Slide Navigation */}
      {isFullscreenView && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none">
          
          {/* Lightbox Header */}
          <div className="flex items-center justify-between z-30 pb-2 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-white font-extrabold text-xs border border-white/20">
                <Home className="w-4 h-4 text-rose-400 fill-rose-400/20" />
                <span className="text-rose-400">ezy</span>
                <span className="text-white">.homes Full View</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300 hidden sm:inline">
                {property.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
                Photo {activePhotoIdx + 1} of {propertyImages.length}
              </span>
              <button
                onClick={() => setIsFullscreenView(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
                title="Close Full View (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Full View Stage */}
          <div 
            className="relative flex-1 my-4 flex items-center justify-center overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={propertyImages[activePhotoIdx]}
              alt={`${property.title} Full View ${activePhotoIdx + 1}`}
              className="max-h-[78vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            />

            {/* Auto Watermark in Left Corner on Full View Image */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/80 backdrop-blur-md text-white text-sm sm:text-base font-black tracking-wide border border-white/30 shadow-2xl">
              <Home className="w-4 h-4 text-rose-400 fill-rose-400/20" />
              <span className="text-rose-400 font-black">ezy</span>
              <span className="text-white font-black">.homes</span>
            </div>

            {/* Navigation Arrows */}
            {propertyImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-black/95 text-white shadow-2xl transition-all z-30 border border-white/30 hover:scale-110 active:scale-90"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-black/95 text-white shadow-2xl transition-all z-30 border border-white/30 hover:scale-110 active:scale-90"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-30 max-w-full">
            {propertyImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative h-14 w-20 sm:h-16 sm:w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  activePhotoIdx === idx
                    ? 'border-rose-500 scale-105 ring-2 ring-rose-500/50 opacity-100'
                    : 'border-white/20 opacity-50 hover:opacity-85'
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-0.5 left-0.5 z-10 pointer-events-none text-[7px] font-black text-rose-400 bg-black/80 px-1 rounded-xs">
                  ezy
                </div>
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};
