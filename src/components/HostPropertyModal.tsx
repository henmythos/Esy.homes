import React, { useState } from 'react';
import { Property, PointOfInterest, RentalType } from '../types';
import { INDIAN_CITIES } from '../data/indianCities';
import { ALL_AMENITIES } from '../data/amenities';
import { LocationPickerMap } from './LocationPickerMap';
import { convertToWebP, uploadWebPToR2, R2_CONFIG } from '../utils/imageConverter';
import { hasReachedFreeListingLimit, isValidPremiumCoupon, PREMIUM_WHATSAPP_URL, PREMIUM_WHATSAPP_NUMBER, getListingDurationDays } from '../utils/expiration';
import { getStoredProperties } from '../utils/storage';
import { X, Plus, Trash2, Check, Upload, Home, MapPin, Calendar, Phone, MessageSquare, IndianRupee, Users, Building, Sparkles, Image as ImageIcon, Loader2, HardDrive, AlertTriangle, ExternalLink, CheckCircle2, ShieldCheck } from 'lucide-react';

interface HostPropertyModalProps {
  onSaveProperty: (property: Property) => void;
  onClose: () => void;
}

export const HostPropertyModal: React.FC<HostPropertyModalProps> = ({
  onSaveProperty,
  onClose,
}) => {
  const [step, setStep] = useState<number>(1);

  // Rental Type State
  const [rentalType, setRentalType] = useState<RentalType>('pg_hostel');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Property['category']>('pg_hostel');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [stateName, setStateName] = useState('Karnataka');
  const [neighborhood, setNeighborhood] = useState('Koramangala');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number>(12.9352);
  const [lng, setLng] = useState<number>(77.6245);

  // Pricing (INR) - Owner set
  const [priceINR, setPriceINR] = useState<number>(0);
  const [securityDepositINR, setSecurityDepositINR] = useState<number>(0);
  const [maxGuests, setMaxGuests] = useState<number>(2);
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [beds, setBeds] = useState<number>(1);
  const [bathrooms, setBathrooms] = useState<number>(1);

  // PG Hostel Details
  const [pgGender, setPgGender] = useState<'mens' | 'womens' | 'unisex'>('mens');
  const [pgSharing, setPgSharing] = useState<'single' | 'double' | 'triple' | 'four_plus'>('double');
  const [pgFoodIncluded, setPgFoodIncluded] = useState<boolean>(true);
  const [pgAcAvailable, setPgAcAvailable] = useState<boolean>(true);

  // Custom details requested by user
  const [customRentDetails, setCustomRentDetails] = useState<string>('');
  const [customAmenities, setCustomAmenities] = useState<string[]>([]);
  const [newCustomAmenity, setNewCustomAmenity] = useState<string>('');

  // Owner sets amenities and images (starts empty so owner explicitly chooses)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Owner contact & Premium Coupon
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [limitError, setLimitError] = useState('');

  // Custom POI
  const [poiName, setPoiName] = useState('');
  const [poiCategory, setPoiCategory] = useState<PointOfInterest['category']>('it_park');
  const [poiDistance, setPoiDistance] = useState<number>(300);
  const [pois, setPois] = useState<PointOfInterest[]>([
    { id: 'custom-poi-1', name: 'Tech Park / Metro Station', category: 'transport', lat: 12.9370, lng: 77.6270, distanceMeters: 300 }
  ]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    bengaluru: { lat: 12.9352, lng: 77.6245 },
    mumbai: { lat: 19.0760, lng: 72.8777 },
    hyderabad: { lat: 17.3850, lng: 78.4867 },
    'delhi ncr': { lat: 28.6139, lng: 77.2090 },
    pune: { lat: 18.5204, lng: 73.8567 },
    goa: { lat: 15.2993, lng: 74.1240 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
  };

  const handleCitySelect = (selectedCityName: string) => {
    setCity(selectedCityName);
    const key = selectedCityName.toLowerCase();
    if (CITY_COORDS[key]) {
      setLat(CITY_COORDS[key].lat);
      setLng(CITY_COORDS[key].lng);
    }
    const matched = INDIAN_CITIES.find(c => c.name.toLowerCase() === selectedCityName.toLowerCase());
    if (matched) {
      setStateName(matched.state);
      if (matched.popularAreas.length > 0) {
        setNeighborhood(matched.popularAreas[0]);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    
    // Check max limit (5 images max)
    if (imageUrls.length + fileList.length > R2_CONFIG.maxImagesPerProperty) {
      setUploadError(`Maximum ${R2_CONFIG.maxImagesPerProperty} photos allowed per listing. You already have ${imageUrls.length}.`);
      return;
    }

    setUploadError('');
    setIsUploadingImage(true);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadStatus(`Converting "${file.name}" to WebP format & uploading to R2 (${i + 1}/${fileList.length})...`);
        
        const { r2Url } = await uploadWebPToR2(file, (percent) => {
          setUploadProgress(percent);
        });

        newUrls.push(r2Url);
      }

      setImageUrls((prev) => [...prev, ...newUrls].slice(0, R2_CONFIG.maxImagesPerProperty));
      setUploadStatus('WebP images successfully converted & uploaded to ezyhomes-images R2 bucket!');
      setTimeout(() => setUploadStatus(''), 4000);
    } catch (err: any) {
      console.error('File conversion/upload error:', err);
      setUploadError(err.message || 'Failed to process image');
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleAddImage = () => {
    if (imageUrls.length >= R2_CONFIG.maxImagesPerProperty) {
      setUploadError(`Maximum ${R2_CONFIG.maxImagesPerProperty} photos allowed per property.`);
      return;
    }
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()].slice(0, R2_CONFIG.maxImagesPerProperty));
      setNewImageUrl('');
      setUploadError('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== index));
    setUploadError('');
  };

  const handleAddPOI = () => {
    if (poiName.trim()) {
      setPois([
        ...pois,
        {
          id: `poi-${Date.now()}`,
          name: poiName.trim(),
          category: poiCategory,
          lat: lat + (Math.random() - 0.5) * 0.01,
          lng: lng + (Math.random() - 0.5) * 0.01,
          distanceMeters: poiDistance,
        },
      ]);
      setPoiName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !city || !ownerName || !whatsapp) return;

    // Check free listing limit (1 listing per mobile number) unless valid coupon code (5436) provided
    const userPhone = whatsapp.trim() || phone.trim();
    const storedProps = getStoredProperties();
    const isPremiumPass = isValidPremiumCoupon(couponCode);

    if (hasReachedFreeListingLimit(storedProps, userPhone, undefined, isPremiumPass)) {
      setLimitError(`Reached 1 free property listing limit for mobile number (${userPhone}). To list additional properties on ezy.homes, enter a valid premium coupon code or contact us via WhatsApp.`);
      return;
    }

    const finalPriceINR = Number(priceINR) > 0 
      ? Number(priceINR) 
      : rentalType === 'daily_rental' ? 2500 : rentalType === 'pg_hostel' ? 8500 : 18000;

    const priceUSD = Math.round(finalPriceINR / 83.5);

    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim() || `Verified ${rentalType.replace('_', ' ')} rental in ${neighborhood}, ${city}.`,
      rentalType,
      category: rentalType === 'pg_hostel' ? 'pg_hostel' : rentalType === 'monthly_room' ? 'monthly_room' : 'daily_rental',
      location: {
        city: city.trim(),
        state: stateName.trim(),
        country: 'India',
        address: address.trim() || `${neighborhood}, ${city}`,
        neighborhood: neighborhood.trim() || city,
        lat: Number(lat) || 12.9352,
        lng: Number(lng) || 77.6245,
      },
      priceINR: finalPriceINR,
      pricePerNightUSD: priceUSD,
      securityDepositINR: rentalType !== 'daily_rental' ? Number(securityDepositINR) : 0,
      customRentDetails: customRentDetails.trim() || undefined,
      cleaningFeeUSD: 0,
      rating: 5.0,
      reviewCount: 1,
      maxGuests: Number(maxGuests) || 1,
      bedrooms: Number(bedrooms) || 1,
      beds: Number(beds) || 1,
      bathrooms: Number(bathrooms) || 1,
      pgDetails: rentalType === 'pg_hostel' ? {
        gender: pgGender,
        sharing: pgSharing,
        foodIncluded: pgFoodIncluded,
        foodType: 'both',
        acAvailable: pgAcAvailable,
        noticePeriodDays: 30,
        gateClosingTime: '11:00 PM'
      } : undefined,
      images: imageUrls.length > 0 ? imageUrls : [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: selectedAmenities.length > 0 ? selectedAmenities : ['wifi', 'security'],
      customAmenities: customAmenities.length > 0 ? customAmenities : undefined,
      nearbyPOIs: pois,
      owner: {
        id: `owner-${Date.now()}`,
        name: ownerName.trim(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        phone: phone.trim() || whatsapp.trim(),
        whatsapp: whatsapp.replace(/[^0-9]/g, ''),
        responseRate: '100% within 10 minutes',
        languages: ['English', 'Hindi'],
        joinedDate: 'July 2026',
        isSuperhost: true,
      },
      blockedDates: [],
      houseRules: [
        'Direct WhatsApp contact for inquiry and key handover',
        'Govt ID verification required at check-in'
      ],
      checkInTime: '10:00 AM',
      checkOutTime: '12:00 PM',
      instantCallAvailable: true,
      createdAt: new Date().toISOString().split('T')[0],
      isFeatured: true,
      isPremium: isPremiumPass,
      isVerified: true,
    };

    onSaveProperty(newProperty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-500 font-bold">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">List Your Rental Property on ezy.homes</h2>
              <p className="text-xs text-gray-500">Daily Rentals • PG Hostels (Mens/Womens) • Monthly Rooms</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps indicator */}
        <div className="bg-gray-50 px-6 py-2.5 border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
          <span className={step >= 1 ? 'text-rose-600 font-extrabold' : ''}>1. Property & Location</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-rose-600 font-extrabold' : ''}>2. Rent (₹) & Amenities</span>
          <span>→</span>
          <span className={step >= 3 ? 'text-rose-600 font-extrabold' : ''}>3. Owner WhatsApp</span>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
          
          {limitError && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex flex-col gap-2.5 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    Reached 1 Free Listing Limit
                  </h4>
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    {limitError}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-amber-200/80">
                <a
                  href={PREMIUM_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  Contact WhatsApp ({PREMIUM_WHATSAPP_NUMBER}) <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setLimitError('')}
                  className="px-3 py-2 rounded-xl bg-amber-200/60 hover:bg-amber-200 text-amber-900 font-bold text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              
              {/* Rental Type Chooser */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-800">Select Rental Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRentalType('pg_hostel');
                      setCategory('pg_hostel');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      rentalType === 'pg_hostel'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Users className="w-4 h-4 text-blue-600 mb-1" />
                    <div className="text-xs font-black">PG Hostel</div>
                    <div className="text-[10px] text-gray-500 font-normal">Mens / Womens / Unisex</div>
                    <span className="mt-1 inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[9px] font-bold">
                      1 Year Active
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRentalType('monthly_room');
                      setCategory('monthly_room');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      rentalType === 'monthly_room'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-600 mb-1" />
                    <div className="text-xs font-black">Monthly Room</div>
                    <div className="text-[10px] text-gray-500 font-normal">Furnished 1BHK / Flat</div>
                    <span className="mt-1 inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                      90 Days Active
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRentalType('daily_rental');
                      setCategory('daily_rental');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      rentalType === 'daily_rental'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-rose-600 mb-1" />
                    <div className="text-xs font-black">Daily Homestay</div>
                    <div className="text-[10px] text-gray-500 font-normal">Per Night Stay</div>
                    <span className="mt-1 inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-bold">
                      1 Year Active
                    </span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Property Title *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    rentalType === 'pg_hostel'
                      ? 'e.g. Zolo Stays Mens PG Hostel near Cyber Park'
                      : rentalType === 'monthly_room'
                      ? 'e.g. Furnished 1BHK Flat with Balcony in HSR Layout'
                      : 'e.g. Heritage Beach Cottage & Garden'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm"
                />
              </div>

              {/* City & Area Chooser */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">Select City *</label>
                  <select
                    value={city}
                    onChange={(e) => handleCitySelect(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm bg-white"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name} ({c.state})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">Area / Neighborhood *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Koramangala, Gachibowli, Bandra..."
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Full Address</label>
                <input
                  type="text"
                  placeholder="e.g. 12th Main Road, Sector 4"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm"
                />
              </div>

              {/* Accurate Map Location Pinning */}
              <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" /> Pin Exact Property Location on Map *
                  </label>
                  <span className="text-[10px] text-gray-500 font-bold bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Search landmark, click "Use My Live GPS", or drag the red target pin directly to your building entrance.
                </p>

                <LocationPickerMap
                  lat={lat}
                  lng={lng}
                  cityName={city}
                  onChangeLocation={(newLat, newLng, newAddress) => {
                    setLat(newLat);
                    setLng(newLng);
                    if (newAddress && !address) {
                      setAddress(newAddress);
                    }
                  }}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your rental property, nearby landmarks, food options, Wi-Fi speed, security..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              
              {/* Rent & Deposit Inputs in INR */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-3">
                <h4 className="text-xs font-black text-rose-950 uppercase tracking-wider flex items-center justify-between">
                  <span>Set Listing Price & Deposit *</span>
                  <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-bold">
                    {rentalType === 'daily_rental' ? 'Daily Rate' : 'Monthly Rate'}
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-800">
                      Rent Rate (₹) {rentalType === 'daily_rental' ? '/ Night' : '/ Month'} *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                      <input
                        type="number"
                        required
                        min={100}
                        placeholder={rentalType === 'daily_rental' ? 'e.g. 2500' : 'e.g. 12000'}
                        value={priceINR || ''}
                        onChange={(e) => setPriceINR(Number(e.target.value))}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm font-black text-rose-600 bg-white"
                      />
                    </div>
                  </div>

                  {rentalType !== 'daily_rental' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-800">Security Deposit (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                        <input
                          type="number"
                          min={0}
                          placeholder="e.g. 10000 (0 for No Deposit)"
                          value={securityDepositINR || ''}
                          onChange={(e) => setSecurityDepositINR(Number(e.target.value))}
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm font-bold bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                    <span>Flexible Pricing & Rent Details (Optional)</span>
                    <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Custom Details</span>
                  </label>
                  <textarea
                    placeholder="e.g. 1BHK: ₹15,000 | 2BHK: ₹25,000, Water bill extra..."
                    value={customRentDetails}
                    onChange={(e) => setCustomRentDetails(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm bg-white resize-none placeholder-gray-400"
                  />
                  <p className="text-[10px] text-gray-500">Provide full flexibility if you offer multiple room types or dynamic rent.</p>
                </div>
              </div>

              {/* Property Capacity & Layout Specs */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Property Details & Capacity</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Bedrooms</label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium"
                    >
                      <option value={1}>1 Bedroom / Room</option>
                      <option value={2}>2 Bedrooms (2BHK)</option>
                      <option value={3}>3 Bedrooms (3BHK)</option>
                      <option value={4}>4+ Bedrooms</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Beds</label>
                    <select
                      value={beds}
                      onChange={(e) => setBeds(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium"
                    >
                      <option value={1}>1 Bed</option>
                      <option value={2}>2 Beds</option>
                      <option value={3}>3 Beds</option>
                      <option value={4}>4+ Beds</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Bathrooms</label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium"
                    >
                      <option value={1}>1 Bathroom</option>
                      <option value={2}>2 Bathrooms</option>
                      <option value={3}>3+ Bathrooms</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Max Guests</label>
                    <select
                      value={maxGuests}
                      onChange={(e) => setMaxGuests(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium"
                    >
                      <option value={1}>1 Guest / Tenant</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4 Guests</option>
                      <option value={6}>6+ Guests</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PG Specific options */}
              {rentalType === 'pg_hostel' && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                  <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">PG Hostel Specific Options</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">PG Type</label>
                      <select
                        value={pgGender}
                        onChange={(e) => setPgGender(e.target.value as any)}
                        className="w-full p-2 rounded-xl border border-gray-300 bg-white"
                      >
                        <option value="mens">Mens PG</option>
                        <option value="womens">Womens PG</option>
                        <option value="unisex">Unisex PG</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Room Sharing</label>
                      <select
                        value={pgSharing}
                        onChange={(e) => setPgSharing(e.target.value as any)}
                        className="w-full p-2 rounded-xl border border-gray-300 bg-white"
                      >
                        <option value="single">Single Room</option>
                        <option value="double">2 Sharing</option>
                        <option value="triple">3 Sharing</option>
                        <option value="four_plus">4+ Sharing</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Meals Included?</label>
                      <select
                        value={pgFoodIncluded ? 'yes' : 'no'}
                        onChange={(e) => setPgFoodIncluded(e.target.value === 'yes')}
                        className="w-full p-2 rounded-xl border border-gray-300 bg-white"
                      >
                        <option value="yes">Yes (3 Meals)</option>
                        <option value="no">No Meals</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Air Conditioner</label>
                      <select
                        value={pgAcAvailable ? 'yes' : 'no'}
                        onChange={(e) => setPgAcAvailable(e.target.value === 'yes')}
                        className="w-full p-2 rounded-xl border border-gray-300 bg-white"
                      >
                        <option value="yes">AC Room</option>
                        <option value="no">Non-AC Room</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities Selection */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800">
                    Select Available Amenities ({selectedAmenities.length} selected)
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedAmenities(ALL_AMENITIES.map((a) => a.id))}
                      className="text-rose-600 font-bold hover:underline"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAmenities([])}
                      className="text-gray-500 font-bold hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left flex items-center justify-between ${
                          isSelected
                            ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold shadow-2xs'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span>{amenity.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-rose-500 shrink-0" />}
                      </button>
                    );
                  })}
                  {customAmenities.map((customAmenity, index) => (
                    <button
                      key={`custom-${index}`}
                      type="button"
                      onClick={() => setCustomAmenities(prev => prev.filter((_, i) => i !== index))}
                      className="p-2.5 rounded-xl border text-xs font-medium transition-all text-left flex items-center justify-between bg-rose-50 text-rose-700 border-rose-300 font-bold shadow-2xs"
                    >
                      <span>{customAmenity}</span>
                      <Check className="w-4 h-4 text-rose-500 shrink-0" />
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add custom amenity (e.g. Fiber Internet)"
                    value={newCustomAmenity}
                    onChange={(e) => setNewCustomAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newCustomAmenity.trim() && !customAmenities.includes(newCustomAmenity.trim())) {
                          setCustomAmenities([...customAmenities, newCustomAmenity.trim()]);
                          setNewCustomAmenity('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 outline-hidden focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCustomAmenity.trim() && !customAmenities.includes(newCustomAmenity.trim())) {
                        setCustomAmenities([...customAmenities, newCustomAmenity.trim()]);
                        setNewCustomAmenity('');
                      }
                    }}
                    className="px-3 py-2 text-xs font-bold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Property Photos & Auto WebP R2 Converter */}
              <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-500 text-white">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Property Photos (Max 5)</h4>
                      <p className="text-[11px] text-slate-500">Auto-converts to WebP client-side & uploads to Cloudflare R2</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-black text-xs ${
                    imageUrls.length >= 5 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {imageUrls.length} / 5 Photos
                  </span>
                </div>

                {/* Cloudflare R2 Storage Badge */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600">
                  <HardDrive className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">R2 Storage: <strong className="text-slate-800 font-mono">ezyhomes-images</strong></span>
                  <span className="ml-auto shrink-0 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                    Auto WebP
                  </span>
                </div>

                {/* File Upload Zone */}
                {imageUrls.length < 5 ? (
                  <label className="relative border-2 border-dashed border-rose-300 hover:border-rose-500 bg-white hover:bg-rose-50/50 transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
                        <span className="text-xs font-bold text-slate-800">{uploadStatus}</span>
                        <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-2.5 rounded-full bg-rose-100 text-rose-600 group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          Click or drag photos to upload
                        </span>
                        <span className="text-[10px] text-slate-500">
                          JPG, PNG, HEIC auto-converted to .webp in browser before R2 upload
                        </span>
                      </>
                    )}
                  </label>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold text-center">
                    Maximum 5 photos reached for this property listing.
                  </div>
                )}

                {/* Upload Status / Error messages */}
                {uploadStatus && !isUploadingImage && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{uploadStatus}</span>
                  </div>
                )}

                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center justify-between gap-2">
                    <span>{uploadError}</span>
                    <button onClick={() => setUploadError('')} className="p-0.5 text-rose-500 hover:text-rose-800">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Manual Photo URL Add option */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    disabled={imageUrls.length >= 5}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-hidden bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={imageUrls.length >= 5 || !newImageUrl.trim()}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs transition-colors shrink-0"
                  >
                    Add URL
                  </button>
                </div>

                {/* Thumbnails grid */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs">
                        <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white font-black text-[9px] uppercase backdrop-blur-xs">
                          WEBP
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white opacity-90 group-hover:opacity-100 transition-opacity shadow-xs"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-xs text-emerald-800">
                <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Zero commission or middleman fees.</strong> Tenants will connect with you directly via WhatsApp & phone.
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Host / Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Reddy or Sunitha Rao"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">WhatsApp Number (with India country code 91) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 919845012345"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm font-bold"
                />
                <span className="text-[11px] text-gray-400">e.g. 919845012345 (no + or spaces).</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Direct Calling Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98450 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm"
                />
              </div>

              {/* Secret Premium Coupon Code Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/90 flex flex-col gap-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    Premium Listing Coupon Code
                  </label>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md">
                    Optional
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter premium coupon code"
                    value={couponCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setCouponCode(code);
                      if (isValidPremiumCoupon(code)) {
                        setLimitError('');
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm outline-hidden transition-all ${
                      isValidPremiumCoupon(couponCode)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-800 focus:border-rose-500'
                    }`}
                  />
                  {isValidPremiumCoupon(couponCode) && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute right-3 top-2.5" />
                  )}
                </div>

                {isValidPremiumCoupon(couponCode) ? (
                  <div className="p-2.5 rounded-xl bg-emerald-100/90 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2 animate-fadeIn">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>✓ Premium Pass Activated! Unlimited listings & lifetime duration activated with Verified badge.</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-800 leading-snug">
                    Enter premium coupon code to bypass free listing limits, keep listing active indefinitely without expiration, and display a verified badge.
                  </p>
                )}
              </div>

              {/* Add Custom Nearby Point of Interest */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-800">Add Nearby Tech Park / College / Station Spot</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Spot name (e.g. Cyber Towers Metro)"
                    value={poiName}
                    onChange={(e) => setPoiName(e.target.value)}
                    className="col-span-2 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddPOI}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600"
                  >
                    + Add Spot
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Wizard Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20"
              >
                Next Step →
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Publish Listing
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};

