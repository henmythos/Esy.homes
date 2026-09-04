import React, { useState } from 'react';
import { Currency, Property } from '../types';
import { formatRentalRate } from '../utils/currencies';
import { formatSalePrice } from '../utils/formatPrice';
import { getSalePropertyTypeLabel } from '../utils/categories';
import { getTimeAgo } from '../utils/expiration';
import {
  Star, Heart, Share2, ChevronLeft, ChevronRight,
  PhoneCall, ShieldCheck, MapPin, Users, Calendar,
  Building, Zap, Clock, Tag, MessageCircle,
} from 'lucide-react';

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

  // Safe fallback guards
  const propertyImages = (Array.isArray(property?.images) && property.images.length > 0)
    ? property.images
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'];

  const ratingVal = typeof property?.rating === 'number' ? property.rating : 5.0;
  const pois = Array.isArray(property?.nearbyPOIs) ? property.nearbyPOIs : [];
  const neighborhood = property?.location?.neighborhood || property?.location?.city || 'Location';
  const city = property?.location?.city || '';
  const isForSale = property.rentalType === 'for_sale';

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?property=${property.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${property.title} | ezy.homes`,
        text: `Check out ${property.title} in ${neighborhood}, ${city} on ezy.homes`,
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

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const waNumber = property.owner?.whatsapp || property.owner?.phone?.replace(/[^0-9]/g, '') || '';
    if (!waNumber) return;
    const msg = isForSale
      ? `Hi, I'm interested in buying your ${property.saleDetails ? getSalePropertyTypeLabel(property.saleDetails.propertyType) : 'property'} "${property.title}" listed on ezy.homes. Please share more details.`
      : `Hi, I'm interested in your rental "${property.title}" in ${neighborhood}, ${city} listed on ezy.homes. Is it available?`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getRentalTypeBadge = () => {
    switch (property.rentalType) {
      case 'pg_hostel': {
        const genderLabel =
          property.pgDetails?.gender === 'mens' ? 'Mens PG' :
          property.pgDetails?.gender === 'womens' ? 'Womens PG' : 'Unisex PG';
        return { label: `${genderLabel} (${property.pgDetails?.sharing || 'sharing'})`, bg: 'bg-blue-600 text-white' };
      }
      case 'commercial_shop':
        return { label: 'Commercial Shop', bg: 'bg-purple-600 text-white' };
      case 'monthly_room':
        return { label: 'Monthly Room', bg: 'bg-emerald-600 text-white' };
      case 'for_sale': {
        const typeLabel = property.saleDetails
          ? getSalePropertyTypeLabel(property.saleDetails.propertyType)
          : 'For Sale';
        return { label: `🏷️ ${typeLabel}`, bg: 'bg-teal-600 text-white' };
      }
      case 'daily_rental':
      default:
        return { label: 'Daily Stay', bg: 'bg-rose-600 text-white' };
    }
  };

  const badge = getRentalTypeBadge();

  return (
    <div
      onClick={() => onClick(property)}
      className="group cursor-pointer flex flex-col gap-2.5 rounded-2xl p-2.5 transition-all hover:bg-gray-50/90 border border-gray-100 hover:border-gray-200 hover:shadow-md bg-white overflow-hidden"
    >
      {/* ── Image Slider ── */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm">
        <img
          src={propertyImages[currentImageIdx] || propertyImages[0]}
          alt={property.title}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-70" />

        {/* Top-right: Share + Wishlist */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-transform active:scale-90 text-white shadow-sm flex items-center gap-1"
            title="Share Property Link"
          >
            <Share2 className="w-3.5 h-3.5 text-white" />
            {isCopied && <span className="text-[10px] font-bold text-emerald-400 pr-1">Copied!</span>}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(property.id); }}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-transform active:scale-90 text-white shadow-sm"
            title={isWishlisted ? 'Remove from Saved' : 'Save Property'}
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
          </button>
        </div>

        {/* Top-left: Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {property.isPremium ? (
            <span className="px-2.5 py-0.5 rounded-full font-black text-[9px] tracking-wide uppercase bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm flex items-center gap-1 border border-amber-300">
              <Zap className="w-2.5 h-2.5 fill-current text-amber-200" /> ★ Verified
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full font-black text-[9px] tracking-wide uppercase bg-slate-900/85 text-white shadow-sm flex items-center gap-1 border border-slate-700/50">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Free Listing
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] tracking-wide shadow-sm backdrop-blur-sm ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        {/* Image Navigation Arrows */}
        {propertyImages.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image Dots */}
        {propertyImages.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {propertyImages.map((_, idx) => (
              <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentImageIdx ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/60'}`} />
            ))}
          </div>
        )}
      </div>

      {/* ── Property Details ── */}
      <div className="flex flex-col gap-1 px-1">

        {/* Location & Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-[15px] leading-snug line-clamp-1 group-hover:text-rose-600 transition-colors">
            {neighborhood}, {city}
          </h3>
          <div className="flex items-center gap-1 shrink-0 text-xs font-bold text-gray-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{ratingVal.toFixed(1)}</span>
          </div>
        </div>

        {/* Title & Age */}
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs text-gray-600 line-clamp-1 font-medium flex-1">{property.title}</p>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 shrink-0 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5 text-slate-400" />
            {getTimeAgo(property.createdAt)}
          </span>
        </div>

        {/* Rental-type specific info row */}
        {property.rentalType === 'pg_hostel' && property.pgDetails && (
          <div className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
            <span>{property.pgDetails.foodIncluded ? 'Food Included' : 'Self Cooking'}</span>
            <span>•</span>
            <span>{property.pgDetails.acAvailable ? 'AC Room' : 'Non-AC'}</span>
          </div>
        )}

        {property.rentalType === 'commercial_shop' && (
          <div className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100 flex items-center gap-1">
            <span>{property.commercialDetails?.areaSqFt ? `${property.commercialDetails.areaSqFt} sq ft` : 'Shop Space'}</span>
            <span>•</span>
            <span>{property.commercialDetails?.floorLevel || 'Ground Floor'}</span>
          </div>
        )}

        {/* For Sale info chip */}
        {isForSale && property.saleDetails && (
          <div className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-100 flex items-center gap-1 flex-wrap">
            {property.saleDetails.areaSqFt && <span>{property.saleDetails.areaSqFt.toLocaleString()} sq ft</span>}
            {property.saleDetails.areaSqYd && !property.saleDetails.areaSqFt && <span>{property.saleDetails.areaSqYd} sq yd</span>}
            {(property.saleDetails.areaSqFt || property.saleDetails.areaSqYd) && <span>•</span>}
            {property.saleDetails.loanAvailable && <span className="text-emerald-700 font-bold">🏦 Loan Available</span>}
            {property.saleDetails.bhkType && <span>{property.saleDetails.bhkType}</span>}
          </div>
        )}

        {/* Nearest POI */}
        {pois.length > 0 && (
          <p className="text-[11px] text-gray-500 flex items-center gap-1 line-clamp-1 mt-0.5">
            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
            <span>{pois[0].distanceMeters}m from {pois[0].name}</span>
          </p>
        )}

        {/* ── Price + CTA row ── */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {isForSale ? (
              <div className="font-black text-teal-600 text-base sm:text-lg leading-tight">
                {formatSalePrice(property.saleDetails?.salePriceINR || property.priceINR)}
              </div>
            ) : (
              <div className="font-black text-rose-600 text-base sm:text-lg leading-tight">
                {formatRentalRate(property.priceINR || (property.pricePerNightUSD * 83.5), property.rentalType, activeCurrency)}
              </div>
            )}
            {!isForSale && property.securityDepositINR && property.securityDepositINR > 0 && (
              <div className="text-[10px] text-gray-400">
                Deposit: ₹{property.securityDepositINR.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          {/* WhatsApp CTA — visible on mobile card */}
          {property.owner?.whatsapp && (
            <button
              onClick={handleWhatsApp}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-[11px] font-bold shadow-sm transition-all active:scale-95 shrink-0 ${
                isForSale ? 'bg-teal-500 hover:bg-teal-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
              title="Contact on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {isForSale ? 'Enquire' : 'WhatsApp'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
