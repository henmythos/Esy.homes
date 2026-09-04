import React, { useState, useRef, useEffect } from 'react';
import { Property, PointOfInterest, RentalType, SalePropertyType } from '../types';
import { INDIAN_CITIES } from '../data/indianCities';
import { ALL_AMENITIES } from '../data/amenities';
import { SALE_PROPERTY_TYPES } from '../utils/categories';
import { LocationPickerMap } from './LocationPickerMap';
import { convertToWebP, uploadWebPToR2, R2_CONFIG } from '../utils/imageConverter';
import { isValidPremiumCoupon, PREMIUM_WHATSAPP_URL, PREMIUM_WHATSAPP_NUMBER } from '../utils/expiration';
import { formatSalePrice } from '../utils/formatPrice';
import {
  X, Plus, Trash2, Check, Upload, Home, MapPin, Calendar, Phone,
  MessageSquare, Users, Building, Building2, Store, Sparkles, Image as ImageIcon,
  Loader2, AlertTriangle, ExternalLink, CheckCircle2, ShieldCheck, Tag,
  LayoutGrid, Castle, IndianRupee
} from 'lucide-react';

interface HostPropertyModalProps {
  onSaveProperty: (property: Property) => void;
  onClose: () => void;
}

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

export const HostPropertyModal: React.FC<HostPropertyModalProps> = ({ onSaveProperty, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Scroll to top when step changes
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [step]);

  // ── Listing Type ──
  const [rentalType, setRentalType] = useState<RentalType>('pg_hostel');
  const [salePropertyType, setSalePropertyType] = useState<SalePropertyType>('independent_house');

  // ── Step 1: Location ──
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [customCityName, setCustomCityName] = useState('');
  const [stateName, setStateName] = useState('Karnataka');
  const [neighborhood, setNeighborhood] = useState('');
  const [streetName, setStreetName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number>(12.9352);
  const [lng, setLng] = useState<number>(77.6245);

  // ── Step 2: Pricing (Rental) ──
  const [priceINR, setPriceINR] = useState<number>(0);
  const [securityDepositINR, setSecurityDepositINR] = useState<number>(0);
  const [maxGuests, setMaxGuests] = useState<number>(2);
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [beds, setBeds] = useState<number>(1);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [customRentDetails, setCustomRentDetails] = useState('');

  // ── Step 2: Pricing (Sale) ──
  const [salePriceINR, setSalePriceINR] = useState<number>(0);
  const [saleAreaSqFt, setSaleAreaSqFt] = useState<number>(0);
  const [saleAreaSqYd, setSaleAreaSqYd] = useState<number>(0);
  const [saleBhkType, setSaleBhkType] = useState<string>('2BHK');
  const [saleFacing, setSaleFacing] = useState<string>('east');
  const [saleAge, setSaleAge] = useState<number>(0);
  const [saleLoanAvailable, setSaleLoanAvailable] = useState<boolean>(true);
  const [saleFurnished, setSaleFurnished] = useState<string>('semi_furnished');

  // ── PG Specifics ──
  const [pgGender, setPgGender] = useState<'mens' | 'womens' | 'unisex'>('mens');
  const [pgSharing, setPgSharing] = useState<'single' | 'double' | 'triple' | 'four_plus'>('double');
  const [pgFoodIncluded, setPgFoodIncluded] = useState<boolean>(true);
  const [pgAcAvailable, setPgAcAvailable] = useState<boolean>(true);

  // ── Commercial Specifics ──
  const [commercialAreaSqFt, setCommercialAreaSqFt] = useState<number>(500);
  const [commercialFloorLevel, setCommercialFloorLevel] = useState('Ground Floor');
  const [commercialFurnishedStatus, setCommercialFurnishedStatus] = useState<'bare_shell' | 'semi_furnished' | 'fully_furnished'>('semi_furnished');
  const [commercialSuitableFor, setCommercialSuitableFor] = useState('Retail Shop, Office, Clinic');
  const [commercialParking, setCommercialParking] = useState<boolean>(true);

  // ── Step 3: Photos ──
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');

  // ── Step 4: Contact & Amenities ──
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenities, setCustomAmenities] = useState<string[]>([]);
  const [newCustomAmenity, setNewCustomAmenity] = useState('');
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [poiName, setPoiName] = useState('');
  const [poiCategory, setPoiCategory] = useState<PointOfInterest['category']>('transport');
  const [poiDistance, setPoiDistance] = useState<number>(500);

  const isForSale = rentalType === 'for_sale';
  const maxPhotos = isForSale ? 10 : 5;

  const handleCitySelect = (selectedCityName: string) => {
    if (selectedCityName === '__OTHER__') {
      setIsCustomCity(true);
      setCity('');
      return;
    }
    setIsCustomCity(false);
    setCity(selectedCityName);
    const key = selectedCityName.toLowerCase();
    if (CITY_COORDS[key]) {
      setLat(CITY_COORDS[key].lat);
      setLng(CITY_COORDS[key].lng);
    }
    const matched = INDIAN_CITIES.find(c => c.name.toLowerCase() === selectedCityName.toLowerCase());
    if (matched) {
      setStateName(matched.state);
      if (matched.popularAreas.length > 0 && !neighborhood) {
        setNeighborhood(matched.popularAreas[0]);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList: File[] = Array.from(files);

    if (imageUrls.length + fileList.length > maxPhotos) {
      setUploadError(`Maximum ${maxPhotos} photos allowed. You already have ${imageUrls.length}.`);
      return;
    }

    setUploadError('');
    setIsUploadingImage(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadStatus(`Converting "${file.name}" to WebP (${i + 1}/${fileList.length})...`);
        const { r2Url } = await uploadWebPToR2(file, (percent) => setUploadProgress(percent));
        newUrls.push(r2Url);
      }
      setImageUrls((prev) => [...prev, ...newUrls].slice(0, maxPhotos));
      setUploadStatus('Photos uploaded successfully!');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleNextStep = () => {
    setUploadError('');
    if (step === 1) {
      if (!title.trim()) { setUploadError('⚠️ Property Title is required.'); return; }
      if (!city.trim() || !neighborhood.trim()) { setUploadError('⚠️ City and Area are required.'); return; }
    }
    if (step === 2) {
      const price = isForSale ? salePriceINR : priceINR;
      if (!price || Number(price) <= 0) {
        setUploadError(isForSale ? '⚠️ Sale Price is required.' : '⚠️ Rent Rate (₹) is required.');
        return;
      }
    }
    if (step === 3) {
      if (imageUrls.length === 0) { setUploadError('⚠️ At least 1 photo is required.'); return; }
    }
    setStep(s => s + 1);
  };

  const toggleAmenity = (id: string) =>
    setSelectedAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  const handleApplyCoupon = () => {
    if (isValidPremiumCoupon(couponCode)) {
      setCouponApplied(true);
    } else {
      setUploadError('Invalid coupon code. Contact us on WhatsApp for assistance.');
    }
  };

  const handleAddPOI = () => {
    if (poiName.trim()) {
      setPois([...pois, {
        id: `poi-${Date.now()}`,
        name: poiName.trim(),
        category: poiCategory,
        lat: lat + (Math.random() - 0.5) * 0.01,
        lng: lng + (Math.random() - 0.5) * 0.01,
        distanceMeters: poiDistance,
      }]);
      setPoiName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (!title.trim()) { setUploadError('Property title is required.'); setStep(1); return; }
    if (!city.trim() || !neighborhood.trim()) { setUploadError('City and Area are required.'); setStep(1); return; }
    if (isForSale ? salePriceINR <= 0 : priceINR <= 0) {
      setUploadError('Price is required.'); setStep(2); return;
    }
    if (imageUrls.length === 0) { setUploadError('At least 1 photo is required.'); setStep(3); return; }
    if (!ownerName.trim() || !whatsapp.trim()) { setUploadError('Name and WhatsApp are required.'); return; }

    const isPremiumPass = couponApplied || isValidPremiumCoupon(couponCode);
    const finalPrice = isForSale ? salePriceINR : Number(priceINR);

    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      description: description.trim() || `${rentalType.replace(/_/g, ' ')} in ${neighborhood}, ${city}.`,
      rentalType,
      category: rentalType,
      location: {
        city: (isCustomCity && customCityName.trim()) ? customCityName.trim() : (city.trim() || 'Bengaluru'),
        state: stateName.trim() || 'India',
        country: 'India',
        address: address.trim() || `${streetName ? streetName + ', ' : ''}${neighborhood}, ${isCustomCity && customCityName.trim() ? customCityName.trim() : city}`,
        neighborhood: neighborhood.trim() || city,
        streetName: streetName.trim() || undefined,
        landmark: landmark.trim() || undefined,
        pincode: pincode.trim() || undefined,
        lat: Number(lat) || 12.9352,
        lng: Number(lng) || 77.6245,
      },
      priceINR: finalPrice,
      pricePerNightUSD: Math.round(finalPrice / 83.5),
      securityDepositINR: (!isForSale && rentalType !== 'daily_rental') ? Number(securityDepositINR) : 0,
      customRentDetails: customRentDetails.trim() || undefined,
      cleaningFeeUSD: 0,
      rating: 5.0,
      reviewCount: 1,
      maxGuests: isForSale ? 0 : (rentalType === 'commercial_shop' ? 10 : Number(maxGuests) || 1),
      bedrooms: isForSale
        ? (salePropertyType === 'open_plot' ? 0 : Number(bedrooms))
        : (rentalType === 'commercial_shop' ? 0 : Number(bedrooms)),
      beds: isForSale ? 0 : (rentalType === 'commercial_shop' ? 0 : Number(beds)),
      bathrooms: (isForSale && salePropertyType === 'open_plot') ? 0 : Number(bathrooms),
      pgDetails: rentalType === 'pg_hostel' ? {
        gender: pgGender,
        sharing: pgSharing,
        foodIncluded: pgFoodIncluded,
        foodType: 'both',
        acAvailable: pgAcAvailable,
        noticePeriodDays: 30,
        gateClosingTime: '11:00 PM',
      } : undefined,
      commercialDetails: rentalType === 'commercial_shop' ? {
        areaSqFt: Number(commercialAreaSqFt) || 500,
        floorLevel: commercialFloorLevel,
        furnishedStatus: commercialFurnishedStatus,
        suitableFor: commercialSuitableFor.split(',').map(s => s.trim()).filter(Boolean),
        parkingAvailable: commercialParking,
        powerBackup: true,
      } : undefined,
      saleDetails: isForSale ? {
        propertyType: salePropertyType,
        salePriceINR: salePriceINR,
        areaSqFt: saleAreaSqFt > 0 ? saleAreaSqFt : undefined,
        areaSqYd: saleAreaSqYd > 0 ? saleAreaSqYd : undefined,
        bhkType: (salePropertyType !== 'open_plot' && saleBhkType) ? (saleBhkType as any) : undefined,
        facing: saleFacing as any,
        ageOfPropertyYears: saleAge,
        loanAvailable: saleLoanAvailable,
        furnishedStatus: salePropertyType !== 'open_plot' ? (saleFurnished as any) : undefined,
      } : undefined,
      images: imageUrls,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : [],
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
        joinedDate: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        isSuperhost: isPremiumPass,
      },
      blockedDates: [],
      houseRules: isForSale
        ? ['Genuine buyers only', 'Site visit by prior appointment via WhatsApp']
        : ['Direct WhatsApp contact for inquiry and key handover', 'Govt ID verification required'],
      checkInTime: rentalType === 'daily_rental' ? '10:00 AM' : '',
      checkOutTime: rentalType === 'daily_rental' ? '12:00 PM' : '',
      instantCallAvailable: true,
      createdAt: new Date().toISOString().split('T')[0],
      isFeatured: true,
      isPremium: isPremiumPass,
      isVerified: isPremiumPass,
    };

    onSaveProperty(newProperty);
    onClose();
  };

  // ── Step indicator config ──
  const STEPS = [
    { num: 1, label: 'Property & Location' },
    { num: 2, label: 'Price & Details' },
    { num: 3, label: 'Photos' },
    { num: 4, label: 'Contact & Publish' },
  ];

  const accentColor = isForSale ? 'teal' : 'rose';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-3xl shadow-2xl flex flex-col h-[96vh] sm:max-h-[92vh] sm:h-auto border border-gray-100 rounded-t-3xl">

        {/* ── Modal Header ── */}
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isForSale ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-500'}`}>
              {isForSale ? <Tag className="w-5 h-5" /> : <Home className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">
                {isForSale ? 'List Property for Sale' : 'List Your Rental Property'}
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Free listing on ezy.homes • Reaches buyers across India</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Step Progress ── */}
        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-0">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border-2 transition-all ${
                    step > s.num
                      ? `bg-${accentColor}-500 border-${accentColor}-500 text-white`
                      : step === s.num
                      ? `border-${accentColor}-500 text-${accentColor}-600 bg-${accentColor}-50`
                      : 'border-gray-300 text-gray-400 bg-gray-50'
                  }`}>
                    {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className={`text-[9px] font-bold hidden sm:block whitespace-nowrap ${
                    step === s.num ? `text-${accentColor}-600` : 'text-gray-400'
                  }`}>{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 transition-colors ${
                    step > s.num ? `bg-${accentColor}-400` : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Modal Body ── */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

          {/* Error Banner */}
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
              <button onClick={() => setUploadError('')} className="ml-auto text-rose-500 hover:text-rose-700 shrink-0">×</button>
            </div>
          )}

          {/* ───────────── STEP 1 ───────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">

              {/* Listing Type Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider">What are you listing? *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'pg_hostel' as RentalType,     label: 'PG Hostel',       sub: 'Mens / Womens / Unisex', Icon: Users,    color: 'blue',    dur: '1 Year' },
                    { id: 'monthly_room' as RentalType,  label: 'Monthly Room',    sub: 'Flat / 1BHK / 2BHK',    Icon: Building2, color: 'emerald', dur: '90 Days' },
                    { id: 'commercial_shop' as RentalType, label: 'Commercial',    sub: 'Shop / Office / Clinic', Icon: Store,    color: 'purple',  dur: '1 Year' },
                    { id: 'daily_rental' as RentalType,  label: 'Daily Stay',      sub: 'Per Night / Short Stay', Icon: Calendar, color: 'rose',    dur: '1 Year' },
                    { id: 'for_sale' as RentalType,      label: 'For Sale',       sub: 'Plot / House / Flat etc.', Icon: Tag,    color: 'teal',    dur: '1 Year' },
                  ].map(({ id, label, sub, Icon, color, dur }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => { setRentalType(id); }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all active:scale-97 ${
                        rentalType === id
                          ? `border-${color}-500 bg-${color}-50`
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${rentalType === id ? `text-${color}-600` : 'text-gray-500'}`} />
                      <div className={`text-xs font-black ${rentalType === id ? `text-${color}-900` : 'text-gray-800'}`}>{label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>
                      <span className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        rentalType === id ? `bg-${color}-100 text-${color}-800` : 'bg-gray-100 text-gray-500'
                      }`}>{dur}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* For Sale: Sub-type selector */}
              {isForSale && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-teal-800 uppercase tracking-wider">Property Sub-Type *</label>
                  <div className="flex flex-wrap gap-2">
                    {SALE_PROPERTY_TYPES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSalePropertyType(t.id as SalePropertyType)}
                        className={`px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all active:scale-95 ${
                          salePropertyType === t.id
                            ? 'border-teal-500 bg-teal-50 text-teal-800'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-800">Property Title *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    isForSale
                      ? `e.g. 3BHK Independent House with Garden near ${neighborhood || 'Main Road'}`
                      : rentalType === 'pg_hostel'
                      ? 'e.g. Zolo Stays Mens PG Hostel near Cyber Park'
                      : rentalType === 'monthly_room'
                      ? 'e.g. Furnished 1BHK Flat with Balcony in HSR Layout'
                      : 'e.g. Heritage Beach Cottage & Private Garden'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm"
                />
              </div>

              {/* City + Custom City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-800">City / Town *</label>
                  <select
                    value={isCustomCity ? '__OTHER__' : city}
                    onChange={(e) => handleCitySelect(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm bg-white font-medium"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name} ({c.state})</option>
                    ))}
                    <option value="__OTHER__">+ Enter Other City or Town...</option>
                  </select>
                </div>

                {isCustomCity ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800">Enter City/Town Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Warangal, Tirupati, Siliguri..."
                      value={customCityName}
                      onChange={(e) => setCustomCityName(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800">Area / Locality *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Koramangala, Gachibowli, MVP Colony..."
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm"
                    />
                  </div>
                )}
              </div>

              {isCustomCity && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-800">Area / Locality *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Market, Station Road, Sector 1..."
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm"
                  />
                </div>
              )}

              {/* Street / Sub-area & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-800">Street / Sub-area / Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. 12th Main Road, Sector 62, Road No 36"
                    value={streetName}
                    onChange={(e) => setStreetName(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-800">Nearest Landmark / Spot</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Metro Pillar 120, Opp. Forum Mall"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm"
                  />
                </div>
              </div>

              {/* Address + Pincode */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-800">Full Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 302, Sunrise Heights, 12th Main"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-800">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="560034"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Map */}
              <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" /> Pin Location on Map
                  </label>
                  <span className="text-[10px] text-gray-500 font-bold bg-white px-2 py-0.5 rounded border border-gray-200">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">Search a landmark, tap "Use My GPS", or drag the red pin.</p>
                <LocationPickerMap
                  lat={lat}
                  lng={lng}
                  cityName={city}
                  onChangeLocation={(newLat, newLng, newAddress) => {
                    setLat(newLat);
                    setLng(newLng);
                    if (newAddress && !address) setAddress(newAddress);
                  }}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-800">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder={isForSale
                    ? 'Describe the property, corner plot or not, road width, amenities nearby, clear title...'
                    : 'Describe your rental: nearby landmarks, food options, Wi-Fi speed, rules...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm resize-none"
                />
              </div>
            </div>
          )}

          {/* ───────────── STEP 2 ───────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-5">

              {/* FOR SALE Pricing */}
              {isForSale && (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-4">
                  <h4 className="text-xs font-black text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-teal-600" /> Sale Price & Property Details
                  </h4>

                  {/* Sale Price */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800">Sale Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                      <input
                        type="number"
                        required
                        min={10000}
                        placeholder="e.g. 4500000 for ₹45 Lakhs"
                        value={salePriceINR || ''}
                        onChange={(e) => setSalePriceINR(Number(e.target.value))}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-teal-500 text-sm font-black text-teal-700 bg-white"
                      />
                    </div>
                    {salePriceINR > 0 && (
                      <p className="text-xs text-teal-600 font-bold">{formatSalePrice(salePriceINR)}</p>
                    )}
                  </div>

                  {/* Area fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-800">Area (Sq Ft)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 1200"
                        value={saleAreaSqFt || ''}
                        onChange={(e) => setSaleAreaSqFt(Number(e.target.value))}
                        className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-teal-500 text-sm bg-white"
                      />
                    </div>
                    {(salePropertyType === 'open_plot') && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-800">Area (Sq Yd)</label>
                        <input
                          type="number"
                          min={0}
                          placeholder="e.g. 200"
                          value={saleAreaSqYd || ''}
                          onChange={(e) => setSaleAreaSqYd(Number(e.target.value))}
                          className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-teal-500 text-sm bg-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* BHK (not for plots) */}
                  {salePropertyType !== 'open_plot' && salePropertyType !== 'commercial' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-800">BHK / Configuration</label>
                      <div className="flex flex-wrap gap-2">
                        {['1BHK', '2BHK', '3BHK', '4BHK', '5BHK+'].map(bhk => (
                          <button
                            key={bhk}
                            type="button"
                            onClick={() => setSaleBhkType(bhk)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                              saleBhkType === bhk
                                ? 'border-teal-500 bg-teal-50 text-teal-800'
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {bhk}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Facing */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800">Facing Direction</label>
                    <select
                      value={saleFacing}
                      onChange={(e) => setSaleFacing(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-teal-500 text-sm bg-white"
                    >
                      {[
                        ['east', 'East Facing'], ['west', 'West Facing'], ['north', 'North Facing'],
                        ['south', 'South Facing'], ['north_east', 'North East'], ['north_west', 'North West'],
                        ['south_east', 'South East'], ['south_west', 'South West'],
                      ].map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                  </div>

                  {/* Age + Loan */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-800">Age of Property (Years)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="0 = New"
                        value={saleAge}
                        onChange={(e) => setSaleAge(Number(e.target.value))}
                        className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-teal-500 text-sm bg-white"
                      />
                      <p className="text-[10px] text-gray-400">0 = New / Under Construction</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-800">Home Loan Available?</label>
                      <div className="flex gap-2 mt-1">
                        {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(opt => (
                          <button
                            key={String(opt.val)}
                            type="button"
                            onClick={() => setSaleLoanAvailable(opt.val)}
                            className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                              saleLoanAvailable === opt.val
                                ? 'border-teal-500 bg-teal-50 text-teal-800'
                                : 'border-gray-200 bg-white text-gray-700'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Furnished Status (not for plots) */}
                  {salePropertyType !== 'open_plot' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-800">Furnished Status</label>
                      <div className="flex gap-2">
                        {[
                          { val: 'unfurnished', label: 'Unfurnished' },
                          { val: 'semi_furnished', label: 'Semi Furnished' },
                          { val: 'fully_furnished', label: 'Fully Furnished' },
                        ].map(opt => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setSaleFurnished(opt.val)}
                            className={`flex-1 py-2 rounded-xl border-2 text-[11px] font-bold transition-all ${
                              saleFurnished === opt.val
                                ? 'border-teal-500 bg-teal-50 text-teal-800'
                                : 'border-gray-200 bg-white text-gray-700'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* RENTAL Pricing */}
              {!isForSale && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-4">
                  <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Rent & Deposit *</span>
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold">
                      {rentalType === 'daily_rental' ? 'Per Night' : 'Per Month'}
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-800">
                        Rent (₹) {rentalType === 'daily_rental' ? '/Night' : '/Month'} *
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
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm font-black text-rose-600 bg-white"
                        />
                      </div>
                    </div>

                    {rentalType !== 'daily_rental' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-800">Security Deposit (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                          <input
                            type="number"
                            min={0}
                            placeholder="e.g. 10000"
                            value={securityDepositINR || ''}
                            onChange={(e) => setSecurityDepositINR(Number(e.target.value))}
                            className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rooms (not for commercial) */}
                  {rentalType !== 'commercial_shop' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: 'Bedrooms', val: bedrooms, set: setBedrooms, opts: [['1', '1 Bedroom'], ['2', '2BHK'], ['3', '3BHK'], ['4', '4+']] },
                        { label: 'Beds', val: beds, set: setBeds, opts: [['1', '1 Bed'], ['2', '2 Beds'], ['3', '3 Beds'], ['4', '4+']] },
                        { label: 'Bathrooms', val: bathrooms, set: setBathrooms, opts: [['1', '1 Bath'], ['2', '2 Bath'], ['3', '3+'], ['4', '4+']] },
                        { label: 'Max Guests', val: maxGuests, set: setMaxGuests, opts: [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4+'], ['6', '6+'], ['10', '10+']] },
                      ].map(({ label, val, set, opts }) => (
                        <div key={label}>
                          <label className="font-bold text-gray-700 block mb-1">{label}</label>
                          <select
                            value={val}
                            onChange={(e) => set(Number(e.target.value))}
                            className="w-full p-2 rounded-xl border border-gray-300 bg-white font-medium text-sm"
                          >
                            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PG specifics */}
                  {rentalType === 'pg_hostel' && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
                      <h5 className="text-xs font-black text-blue-900">PG Hostel Details</h5>

                      {/* Gender */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-800">PG Type</label>
                        <div className="flex gap-2">
                          {[{ v: 'mens', l: 'Mens PG' }, { v: 'womens', l: 'Womens PG' }, { v: 'unisex', l: 'Unisex PG' }].map(({ v, l }) => (
                            <button key={v} type="button" onClick={() => setPgGender(v as any)}
                              className={`flex-1 py-2 rounded-xl border-2 text-[11px] font-bold transition-all ${
                                pgGender === v ? 'border-blue-500 bg-blue-100 text-blue-900' : 'border-gray-200 bg-white text-gray-700'
                              }`}>{l}</button>
                          ))}
                        </div>
                      </div>

                      {/* Sharing */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-800">Sharing Type</label>
                        <div className="flex gap-2 flex-wrap">
                          {[['single', 'Single'], ['double', 'Double'], ['triple', 'Triple'], ['four_plus', '4+']].map(([v, l]) => (
                            <button key={v} type="button" onClick={() => setPgSharing(v as any)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                pgSharing === v ? 'border-blue-500 bg-blue-100 text-blue-900' : 'border-gray-200 bg-white text-gray-600'
                              }`}>{l} Sharing</button>
                          ))}
                        </div>
                      </div>

                      {/* Food + AC */}
                      <div className="flex gap-3">
                        <div className="flex flex-col gap-1 flex-1">
                          <label className="text-xs font-bold text-gray-800">Food</label>
                          <div className="flex gap-1.5">
                            {[{ v: true, l: 'Included' }, { v: false, l: 'Self' }].map(({ v, l }) => (
                              <button key={String(v)} type="button" onClick={() => setPgFoodIncluded(v)}
                                className={`flex-1 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                                  pgFoodIncluded === v ? 'border-blue-500 bg-blue-100 text-blue-900' : 'border-gray-200 bg-white text-gray-600'
                                }`}>{l}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <label className="text-xs font-bold text-gray-800">AC</label>
                          <div className="flex gap-1.5">
                            {[{ v: true, l: 'AC Room' }, { v: false, l: 'Non-AC' }].map(({ v, l }) => (
                              <button key={String(v)} type="button" onClick={() => setPgAcAvailable(v)}
                                className={`flex-1 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                                  pgAcAvailable === v ? 'border-blue-500 bg-blue-100 text-blue-900' : 'border-gray-200 bg-white text-gray-600'
                                }`}>{l}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Commercial specifics */}
                  {rentalType === 'commercial_shop' && (
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-3">
                      <h5 className="text-xs font-black text-purple-900">Commercial Shop Details</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-800">Shop Area (Sq Ft)</label>
                          <input type="number" min={0} placeholder="e.g. 500"
                            value={commercialAreaSqFt || ''}
                            onChange={(e) => setCommercialAreaSqFt(Number(e.target.value))}
                            className="px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-purple-500 text-sm bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-800">Floor Level</label>
                          <select value={commercialFloorLevel} onChange={(e) => setCommercialFloorLevel(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-purple-500 text-sm bg-white">
                            {['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', 'Basement'].map(f => <option key={f}>{f}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-800">Suitable For</label>
                        <input type="text" placeholder="e.g. Retail Shop, Office, Clinic, Showroom"
                          value={commercialSuitableFor} onChange={(e) => setCommercialSuitableFor(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-purple-500 text-sm bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setCommercialParking(p => !p)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            commercialParking ? 'border-purple-500 bg-purple-500' : 'border-gray-300 bg-white'
                          }`}>
                          {commercialParking && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <label className="text-xs font-bold text-gray-800 cursor-pointer" onClick={() => setCommercialParking(p => !p)}>
                          Parking Available for Customers
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Custom notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800">Custom Pricing Notes (Optional)</label>
                    <textarea
                      placeholder="e.g. 1BHK: ₹15,000 | 2BHK: ₹25,000, Water bill extra..."
                      value={customRentDetails}
                      onChange={(e) => setCustomRentDetails(e.target.value)}
                      rows={2}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm bg-white resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───────────── STEP 3 ───────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider">
                  Property Photos * <span className="text-gray-400 normal-case font-normal">(max {maxPhotos})</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  {isForSale
                    ? 'Upload up to 10 photos: exterior, interior, kitchen, bathrooms, surrounding area, location.'
                    : 'Upload clear photos of your rental. Good photos get 3× more enquiries.'}
                </p>
              </div>

              {/* Thumbnails */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&q=60';
                      }} />
                      <button
                        type="button"
                        onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">COVER</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area */}
              {imageUrls.length < maxPhotos && (
                <label className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
                  isUploadingImage ? 'border-rose-300 bg-rose-50/50' : 'border-gray-300 hover:border-rose-400 hover:bg-rose-50/30'
                }`}>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFileSelect} disabled={isUploadingImage} />
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-700">{uploadStatus}</p>
                        {uploadProgress > 0 && (
                          <div className="w-48 bg-gray-200 rounded-full h-1.5 mt-2 mx-auto">
                            <div className="bg-rose-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-2xl bg-rose-50 text-rose-500">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-800">Tap to upload photos</p>
                        <p className="text-xs text-gray-500 mt-0.5">JPG, PNG, HEIC → auto-converted to WebP</p>
                        <p className="text-[11px] text-gray-400 mt-1">{imageUrls.length}/{maxPhotos} photos</p>
                      </div>
                    </>
                  )}
                </label>
              )}

              {uploadStatus && !isUploadingImage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {uploadStatus}
                </div>
              )}
            </div>
          )}

          {/* ───────────── STEP 4 ───────────── */}
          {step === 4 && (
            <div className="flex flex-col gap-5">

              {/* Owner Contact */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" /> Owner / Seller Contact *
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suresh Kumar"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 text-sm bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800">WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98XXXXXX or 10-digit"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 text-sm bg-white"
                    />
                    <p className="text-[10px] text-gray-400">Buyers/tenants will contact you directly on WhatsApp.</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800">Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="Alternate phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider">Features & Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_AMENITIES.map((amenity) => (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedAmenities.includes(amenity.id)
                          ? 'border-rose-500 bg-rose-50 text-rose-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {selectedAmenities.includes(amenity.id) && <span className="mr-1">✓</span>}
                      {amenity.name}
                    </button>
                  ))}
                </div>

                {/* Custom amenities */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom feature (e.g. CCTV, Modular Kitchen)"
                    value={newCustomAmenity}
                    onChange={(e) => setNewCustomAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); if (newCustomAmenity.trim()) { setCustomAmenities(prev => [...prev, newCustomAmenity.trim()]); setNewCustomAmenity(''); } }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm"
                  />
                  <button type="button"
                    onClick={() => { if (newCustomAmenity.trim()) { setCustomAmenities(prev => [...prev, newCustomAmenity.trim()]); setNewCustomAmenity(''); } }}
                    className="px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {customAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customAmenities.map((a, i) => (
                      <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
                        <Sparkles className="w-3 h-3" /> {a}
                        <button type="button" onClick={() => setCustomAmenities(prev => prev.filter((_, j) => j !== i))} className="ml-1 text-rose-500 hover:text-rose-700">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Nearby Landmarks */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider">Nearby Landmarks (Optional)</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. Metro Station, College, IT Park"
                    value={poiName} onChange={(e) => setPoiName(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 outline-none focus:border-rose-500 text-sm"
                  />
                  <select value={poiDistance} onChange={(e) => setPoiDistance(Number(e.target.value))}
                    className="px-2 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white">
                    {[200, 500, 1000, 2000].map(d => <option key={d} value={d}>{d < 1000 ? `${d}m` : `${d/1000}km`}</option>)}
                  </select>
                  <button type="button" onClick={handleAddPOI}
                    className="px-3 py-2 rounded-xl bg-gray-700 text-white text-xs font-bold hover:bg-gray-800">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {pois.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pois.map((p, i) => (
                      <span key={p.id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 border border-gray-200 text-[11px] font-medium text-gray-700">
                        <MapPin className="w-3 h-3 text-rose-500" /> {p.name} ({p.distanceMeters}m)
                        <button type="button" onClick={() => setPois(prev => prev.filter((_, j) => j !== i))} className="ml-1 text-gray-400 hover:text-gray-600">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Premium Coupon */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <label className="text-xs font-black text-amber-900 flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  {couponApplied ? 'Premium Listing Activated!' : 'Premium Coupon (Optional)'}
                </label>
                {!couponApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-amber-500 text-sm bg-white"
                    />
                    <button type="button" onClick={handleApplyCoupon}
                      className="px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600">
                      Apply
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-amber-800 font-semibold">
                    Your listing will appear as ezy.homes Verified with priority placement.
                  </p>
                )}
                <p className="text-[10px] text-gray-500 mt-2">
                  No coupon? <a href={PREMIUM_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold underline">Contact us on WhatsApp ({PREMIUM_WHATSAPP_NUMBER})</a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer: Navigation Buttons ── */}
        <div className="bg-white border-t border-gray-100 px-5 py-4 flex items-center justify-between gap-3 shrink-0">
          {step > 1 ? (
            <button type="button" onClick={() => { setUploadError(''); setStep(s => s - 1); }}
              className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-800 text-sm font-bold hover:bg-gray-200 transition-colors">
              ← Back
            </button>
          ) : (
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button type="button" onClick={handleNextStep}
              className={`px-6 py-2.5 rounded-xl text-white text-sm font-black shadow-sm transition-all active:scale-95 ${
                isForSale ? 'bg-teal-600 hover:bg-teal-700' : 'bg-rose-500 hover:bg-rose-600'
              }`}>
              Next: {STEPS[step]?.label || 'Continue'} →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit}
              className={`px-6 py-2.5 rounded-xl text-white text-sm font-black shadow-sm transition-all active:scale-95 flex items-center gap-2 ${
                isForSale ? 'bg-teal-600 hover:bg-teal-700' : 'bg-rose-500 hover:bg-rose-600'
              }`}>
              <Check className="w-4 h-4" />
              Publish Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
