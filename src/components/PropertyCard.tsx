import React, { useState } from 'react';
import { Currency, Property } from '../types';
import { formatRentalRate } from '../utils/currencies';
import { Star, Heart, Share2, ChevronLeft, ChevronRight, PhoneCall, ShieldCheck, MapPin, Users, Calendar, Building, Zap } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  activeCurrency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onClick: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  activeCurrency,
  isWishlisted,
  onToggleWishlist,
  onClick,
}) => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?property=${property.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${property.title} | ezy.homes`,
        text: `Check out ${property.title} in ${property.location.neighborhood}, ${property.location.city} on ezy.homes`,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getRentalTypeBadge = () => {
    switch (property.rentalType) {
      case 'pg_hostel': {
        const genderLabel = property.pgDetails?.gender === 'mens' ? 'Mens PG' : property.pgDetails?.gender === 'womens' ? 'Womens PG' : 'Unisex PG';
        return {
          label: `${genderLabel} (${property.pgDetails?.sharing || 'sharing'})`,
          bg: 'bg-blue-600 text-white',
        };
      }
      case 'monthly_room':
        return {
          label: 'Monthly Room',
          bg: 'bg-emerald-600 text-white',
        };
      case 'daily_rental':
      default:
        return {
          label: 'Daily Stay',
          bg: 'bg-rose-600 text-white',
        };
    }
  };

  const badge = getRentalTypeBadge();

  return (
    <div
      onClick={() => onClick(property)}
      className="group cursor-pointer flex flex-col gap-2.5 rounded-2xl p-2.5 transition-all hover:bg-gray-50/90 border border-gray-100 hover:border-gray-200 hover:shadow-md bg-white overflow-hidden no-scrollbar"
    >
      {/* Image Container with Slider */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-gray-100 shadow-2xs">
        <img
          src={property.images[currentImageIdx] || property.images[0]}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 opacity-70" />

        {/* Action Buttons Top Right: Share + Wishlist */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs transition-transform active:scale-90 text-white shadow-sm flex items-center gap-1"
            title="Share Property Link"
          >
            <Share2 className="w-4 h-4 text-white stroke-[2.2]" />
            {isCopied && <span className="text-[10px] font-bold text-emerald-400 pr-1">Copied!</span>}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(property.id);
            }}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs transition-transform active:scale-90 text-white shadow-sm"
            title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-white stroke-[2.2]'
              }`}
            />
          </button>
        </div>


        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          <span className="px-2.5 py-0.5 rounded-full font-black text-[9px] tracking-wide uppercase bg-emerald-600 text-white shadow-xs backdrop-blur-md flex items-center gap-1 border border-emerald-400/30">
            <ShieldCheck className="w-2.5 h-2.5" /> ezy.homes free Listing
          </span>
          <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] tracking-wide shadow-xs backdrop-blur-md ${badge.bg}`}>
            {badge.label}
          </span>
          {property.instantCallAvailable && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] backdrop-blur-md shadow-2xs flex items-center gap-1">
              <PhoneCall className="w-2.5 h-2.5" /> Call / WA Direct
            </span>
          )}
        </div>

        {/* Slider Navigation Arrows */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image Dots Indicator */}
        {property.images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {property.images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentImageIdx ? 'w-4 bg-white shadow-xs' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="flex flex-col gap-1 px-1">
        {/* Location & Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-rose-600 transition-colors">
            {property.location.neighborhood}, {property.location.city}
          </h3>
          <div className="flex items-center gap-1 shrink-0 text-xs font-bold text-gray-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{property.rating.toFixed(2)}</span>
          </div>
        </div>

        {/* Property Title */}
        <p className="text-xs text-gray-600 line-clamp-1 font-medium">
          {property.title}
        </p>

        {/* PG or Monthly Specifics */}
        {property.pgDetails && (
          <div className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 line-clamp-1 flex items-center gap-1">
            <span>{property.pgDetails.foodIncluded ? 'Food Included' : 'Self Cooking'}</span>
            <span>•</span>
            <span>{property.pgDetails.acAvailable ? 'AC Room' : 'Non-AC'}</span>
          </div>
        )}

        {/* Nearby POI */}
        {property.nearbyPOIs.length > 0 && (
          <p className="text-[11px] text-gray-500 flex items-center gap-1 line-clamp-1 mt-0.5">
            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
            <span>{property.nearbyPOIs[0].distanceMeters}m from {property.nearbyPOIs[0].name}</span>
          </p>
        )}

        {/* Price Row */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-baseline justify-between">
          <div>
            <div className="font-black text-rose-600 text-base sm:text-lg">
              {formatRentalRate(property.priceINR || (property.pricePerNightUSD * 83.5), property.rentalType, activeCurrency)}
            </div>
            {property.securityDepositINR && property.securityDepositINR > 0 && (
              <div className="text-[10px] text-gray-400">
                Security Deposit: ₹{property.securityDepositINR.toLocaleString('en-IN')}
              </div>
            )}
          </div>
          <span className="text-[11px] font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
};

