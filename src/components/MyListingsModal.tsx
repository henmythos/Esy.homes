import React, { useState } from 'react';
import { Property } from '../types';
import {
  getUserActiveListings,
  getDaysRemaining,
  getListingDurationDays,
  PREMIUM_WHATSAPP_URL,
  PREMIUM_WHATSAPP_NUMBER,
  normalizePhoneNumber,
  isValidPremiumCoupon,
  getUpgradePropertyWhatsAppUrl
} from '../utils/expiration';
import { X, Phone, Trash2, Building2, ExternalLink, Calendar, CheckCircle2, AlertCircle, Plus, Sparkles, MapPin } from 'lucide-react';

interface MyListingsModalProps {
  properties: Property[];
  onDeleteProperty: (id: string) => void;
  onSaveProperty?: (property: Property) => void;
  onOpenHostModal: () => void;
  onClose: () => void;
}

export const MyListingsModal: React.FC<MyListingsModalProps> = ({
  properties,
  onDeleteProperty,
  onSaveProperty,
  onOpenHostModal,
  onClose,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchedNumber, setSearchedNumber] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

  // Premium Code Activation State per property
  const [activeCodeId, setActiveCodeId] = useState<string | null>(null);
  const [inputCouponCode, setInputCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ id: string; text: string; success: boolean } | null>(null);

  const activeListings = searchedNumber
    ? getUserActiveListings(properties, searchedNumber)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setSearchedNumber(phoneNumber.trim());
    setConfirmDeleteId(null);
    setDeleteSuccessMsg('');
    setCouponMsg(null);
  };

  const handleDelete = (id: string) => {
    onDeleteProperty(id);
    setConfirmDeleteId(null);
    setDeleteSuccessMsg('Listing successfully deleted from site, database and storage.');
    setTimeout(() => setDeleteSuccessMsg(''), 4000);
  };

  const handleActivateCoupon = (prop: Property) => {
    if (!isValidPremiumCoupon(inputCouponCode)) {
      setCouponMsg({ id: prop.id, text: 'Invalid coupon code. Try again or upgrade via WhatsApp.', success: false });
      return;
    }

    const updatedProp: Property = {
      ...prop,
      isPremium: true,
      isVerified: true,
    };

    if (onSaveProperty) {
      onSaveProperty(updatedProp);
    }
    setCouponMsg({ id: prop.id, text: '✓ Premium Verified Activated! Unlimited lifetime duration & verified badge enabled.', success: true });
    setInputCouponCode('');
    setActiveCodeId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">Manage My Property Listings</h2>
              <p className="text-[11px] text-slate-300">View active listings, check expiration days & delete property</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Phone Input */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          
          <form onSubmit={handleSearch} className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-500" />
              Enter Your WhatsApp / Mobile Number
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-slate-50/50"
                  required
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
              >
                Find My Listings
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Enter the mobile or WhatsApp number used when creating your property listing.
            </p>
          </form>

          {deleteSuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{deleteSuccessMsg}</span>
            </div>
          )}

          {/* Results section */}
          {searchedNumber && (
            <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Listings for ({searchedNumber})
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                  {activeListings.length} Active {activeListings.length === 1 ? 'Listing' : 'Listings'}
                </span>
              </div>

              {activeListings.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 text-slate-400" />
                  <p className="text-xs font-bold text-slate-700">No active property listings found for this number.</p>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Free listings are active for 90 days (monthly rooms) or 1 year (daily/PG hostels) before auto-expiration.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenHostModal();
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-rose-400" /> List Property Now
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeListings.map((prop) => {
                    const daysLeft = getDaysRemaining(prop.createdAt, prop.rentalType);
                    const totalDays = getListingDurationDays(prop.rentalType);
                    const rentalLabel =
                      prop.rentalType === 'monthly_room'
                        ? 'Monthly Room'
                        : prop.rentalType === 'pg_hostel'
                        ? 'PG Hostel'
                        : 'Daily Rental';

                    return (
                      <div
                        key={prop.id}
                        className="p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prop.images[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5'}
                            alt={prop.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-slate-900 line-clamp-1">{prop.title}</span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                                {rentalLabel}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <MapPin className="w-3 h-3 text-rose-500" />
                              <span>{prop.location.neighborhood}, {prop.location.city}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-extrabold text-rose-600">
                                ₹{prop.priceINR.toLocaleString('en-IN')} {prop.rentalType === 'daily_rental' ? '/ night' : '/ month'}
                              </span>
                              <span className="text-slate-300">•</span>
                              {prop.isPremium ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                                  <Sparkles className="w-3 h-3 text-amber-600 fill-current" />
                                  ★ Premium Pass (Unlimited Lifetime Active)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                  <Calendar className="w-3 h-3 text-emerald-600" />
                                  Expires in {daysLeft} days ({totalDays}d limit)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Triggers: Upgrade to Premium + Delete */}
                        <div className="sm:ml-auto w-full sm:w-auto flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {!prop.isPremium && (
                            <div className="flex flex-col gap-1 w-full sm:w-auto">
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={getUpgradePropertyWhatsAppUrl(prop.title, prop.id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                                  title="Request Premium Verified Upgrade on WhatsApp"
                                >
                                  <Sparkles className="w-3.5 h-3.5 fill-current text-amber-200" /> Upgrade on WhatsApp
                                </a>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveCodeId(activeCodeId === prop.id ? null : prop.id);
                                    setInputCouponCode('');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs"
                                >
                                  Enter Code
                                </button>
                              </div>

                              {/* Coupon Code Inline Input */}
                              {activeCodeId === prop.id && (
                                <div className="mt-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-1.5 animate-fadeIn">
                                  <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={inputCouponCode}
                                    onChange={(e) => setInputCouponCode(e.target.value)}
                                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs font-bold outline-hidden w-36"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleActivateCoupon(prop)}
                                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black text-xs"
                                  >
                                    Activate
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {confirmDeleteId === prop.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDelete(prop.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs"
                              >
                                Confirm Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(prop.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Host Support & WhatsApp banner */}
              {activeListings.length >= 1 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <p className="font-extrabold text-white">Need Host Assistance or Instant Verification?</p>
                      <p className="text-[11px] text-slate-300">Contact our support team on WhatsApp for instant assistance.</p>
                    </div>
                  </div>
                  <a
                    href={PREMIUM_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    Contact WhatsApp ({PREMIUM_WHATSAPP_NUMBER}) <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>ezy.homes Listing Manager</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
