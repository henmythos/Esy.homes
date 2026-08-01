import React, { useState } from 'react';
import { Property, PointOfInterest, RentalType } from '../types';
import { INDIAN_CITIES } from '../data/indianCities';
import { ALL_AMENITIES } from '../data/amenities';
import { X, Plus, Trash2, Check, Upload, Home, MapPin, Calendar, Phone, MessageSquare, IndianRupee, Users, Building, Sparkles } from 'lucide-react';

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

  // Pricing (INR)
  const [priceINR, setPriceINR] = useState<number>(8500);
  const [securityDepositINR, setSecurityDepositINR] = useState<number>(5000);
  const [maxGuests, setMaxGuests] = useState<number>(1);
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [beds, setBeds] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(1);

  // PG Hostel Details
  const [pgGender, setPgGender] = useState<'mens' | 'womens' | 'unisex'>('mens');
  const [pgSharing, setPgSharing] = useState<'single' | 'double' | 'triple' | 'four_plus'>('double');
  const [pgFoodIncluded, setPgFoodIncluded] = useState<boolean>(true);
  const [pgAcAvailable, setPgAcAvailable] = useState<boolean>(true);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['wifi', 'solar', 'ac', 'kitchen', 'security']);
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Owner contact
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

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

  const handleCitySelect = (selectedCityName: string) => {
    setCity(selectedCityName);
    const matched = INDIAN_CITIES.find(c => c.name.toLowerCase() === selectedCityName.toLowerCase());
    if (matched) {
      setStateName(matched.state);
      if (matched.popularAreas.length > 0) {
        setNeighborhood(matched.popularAreas[0]);
      }
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== index));
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

    const priceUSD = Math.round((priceINR || 5000) / 83.5);

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
      priceINR: Number(priceINR) || 5000,
      pricePerNightUSD: priceUSD,
      securityDepositINR: rentalType !== 'daily_rental' ? Number(securityDepositINR) : 0,
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
      amenities: selectedAmenities,
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
              <h2 className="text-lg font-black text-gray-900">List Your Rental Property on esy.homes</h2>
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
                      setPriceINR(8500);
                      setCategory('pg_hostel');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      rentalType === 'pg_hostel'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Users className="w-4 h-4 text-blue-600 mb-1" />
                    <div className="text-xs">PG Hostel</div>
                    <div className="text-[10px] text-gray-500 font-normal">Mens / Womens / Unisex</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRentalType('monthly_room');
                      setPriceINR(20000);
                      setCategory('monthly_room');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      rentalType === 'monthly_room'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-600 mb-1" />
                    <div className="text-xs">Monthly Room</div>
                    <div className="text-[10px] text-gray-500 font-normal">Furnished 1BHK / Flat</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRentalType('daily_rental');
                      setPriceINR(3500);
                      setCategory('daily_rental');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      rentalType === 'daily_rental'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-rose-600 mb-1" />
                    <div className="text-xs">Daily Homestay</div>
                    <div className="text-[10px] text-gray-500 font-normal">Per Night Stay</div>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">
                    Rent in Rupees (₹) {rentalType === 'daily_rental' ? '/ Night' : '/ Month'} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                    <input
                      type="number"
                      required
                      min={500}
                      value={priceINR}
                      onChange={(e) => setPriceINR(Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm font-black text-rose-600"
                    />
                  </div>
                </div>

                {rentalType !== 'daily_rental' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">Security Deposit (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={securityDepositINR}
                        onChange={(e) => setSecurityDepositINR(Number(e.target.value))}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-rose-500 text-sm font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PG Specific options */}
              {rentalType === 'pg_hostel' && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                  <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">PG Hostel Features</h4>
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
                      <label className="font-bold text-gray-700 block mb-1">Meals Provided?</label>
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
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">Select Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`p-2 rounded-xl border text-xs font-medium transition-all text-left flex items-center justify-between ${
                          isSelected
                            ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        <span>{amenity.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-rose-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo URLs */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">Photo URLs</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-800"
                  >
                    Add Photo
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={url} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
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

