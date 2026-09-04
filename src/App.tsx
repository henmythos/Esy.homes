import React, { Component, useState, useMemo, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Currency, Property, SearchFilters, SelfHostConfig } from './types';
import { getStoredProperties, savePropertyToStore, deletePropertyFromStore, getWishlistIds, toggleWishlistId, getSelfHostConfig, saveSelfHostConfig } from './utils/storage';
import { sortProperties } from './utils/sorting';
import { Header } from './components/Header';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyGridSkeleton } from './components/PropertySkeleton';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { HostPropertyModal } from './components/HostPropertyModal';
import { MyListingsModal } from './components/MyListingsModal';
import { SelfHostPanel } from './components/SelfHostPanel';
import { SitemapDirectoryModal } from './components/SitemapDirectoryModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { usePullToRefresh } from './hooks/usePullToRefresh';
import { SEOStructuredData } from './components/SEOStructuredData';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { parseNaturalLanguageQuery, extractLocationTokens } from './utils/aiQueryParser';
import { Heart, Search, MapPin, MessageSquare, Building2, ShieldCheck, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ezy.homes UI Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    const state = (this as unknown as { state: ErrorBoundaryState; props: ErrorBoundaryProps; setState: any }).state;
    const props = (this as unknown as { state: ErrorBoundaryState; props: ErrorBoundaryProps; setState: any }).props;
    const setState = (this as unknown as { state: ErrorBoundaryState; props: ErrorBoundaryProps; setState: any }).setState.bind(this);

    if (state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4 border border-rose-200 shadow-sm">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">ezy.homes</h2>
          <p className="text-xs text-gray-600 max-w-sm mb-4">
            Something unexpected occurred while rendering. Click below to reload your properties.
          </p>
          <button
            onClick={() => {
              setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md"
          >
            Reload Properties
          </button>
        </div>
      );
    }
    return props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainAppContent />
    </ErrorBoundary>
  );
}

function MainAppContent() {
  // Main Data States
  const [properties, setProperties] = useState<Property[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selfHostConfig, setSelfHostConfig] = useState<SelfHostConfig>(getSelfHostConfig());
  const [activeCurrency, setActiveCurrency] = useState<Currency>('INR');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // UI View States
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);
  const [isMyListingsModalOpen, setIsMyListingsModalOpen] = useState<boolean>(false);
  const [isSelfHostModalOpen, setIsSelfHostModalOpen] = useState<boolean>(false);
  const [isSitemapModalOpen, setIsSitemapModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('explore');

  const handleRefreshData = async () => {
    const latest = await getStoredProperties();
    if (latest && latest.length > 0) {
      setProperties(latest);
    }
  };

  const { containerRef, isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: handleRefreshData,
  });

  const handleSelectMobileTab = (tab: MobileTab) => {
    if (tab === 'my_listings') {
      setIsMyListingsModalOpen(true);
    } else {
      setActiveMobileTab(tab);
    }
  };

  // Check URL path on initial load for /privacy-policy route
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      if (pathname === '/privacy-policy' || params.get('privacy') === 'true') {
        setIsPrivacyModalOpen(true);
      }
    }
  }, []);

  // Search & Filter State
  const [filters, setFilters] = useState<SearchFilters>({
    destination: '',
    city: '',
    rentalType: 'all',
    genderFilter: 'all',
    category: 'all',
    checkIn: '',
    checkOut: '',
    guests: 1,
    minPriceUSD: 0,
    maxPriceUSD: 1000,
    amenities: [],
    instantCallOnly: false,
  });

  // Load Initial Data on Mount with a small preload animation to prevent layout shifts
  useEffect(() => {
    setIsLoading(true);
    async function loadData() {
      const stored = await getStoredProperties();
      const storedWishlist = getWishlistIds();
      setProperties(stored);
      setWishlist(storedWishlist);
      
      // Simulate swift initial preload finish
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
    loadData();
  }, []);

  // Capacitor Native Android Back Button & Native Bar Config
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#0f172a' }).catch(() => {});
    Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => {});

    const backListener = CapacitorApp.addListener('backButton', () => {
      // 1. Close Privacy Policy Modal
      if (isPrivacyModalOpen) {
        setIsPrivacyModalOpen(false);
        if (window.location.pathname === '/privacy-policy') {
          window.history.pushState({}, '', '/');
        }
        return;
      }
      // 2. Close Property Detail Modal
      if (selectedProperty) {
        setSelectedProperty(null);
        return;
      }
      // 3. Close Host Property Modal
      if (isHostModalOpen) {
        setIsHostModalOpen(false);
        return;
      }
      // 4. Close My Listings Modal
      if (isMyListingsModalOpen) {
        setIsMyListingsModalOpen(false);
        return;
      }
      // 5. Close Self Host Settings Panel
      if (isSelfHostModalOpen) {
        setIsSelfHostModalOpen(false);
        return;
      }
      // 6. Close Sitemap Directory Modal
      if (isSitemapModalOpen) {
        setIsSitemapModalOpen(false);
        return;
      }
      // 7. Return to Explore Tab if in Wishlist Tab
      if (activeMobileTab === 'wishlist') {
        setActiveMobileTab('explore');
        return;
      }
      // 8. Reset active destination search filter if set
      if (filters.destination || filters.city) {
        setFilters(prev => ({ ...prev, destination: '', city: '' }));
        return;
      }
      // 9. Otherwise, exit application safely
      CapacitorApp.exitApp();
    });

    // Capacitor App Foreground Listener: Re-fetch latest live properties when returning to app
    const stateListener = CapacitorApp.addListener('appStateChange', (state) => {
      if (state.isActive) {
        getStoredProperties().then((latest) => {
          if (latest && latest.length > 0) {
            setProperties(latest);
          }
        });
      }
    });

    return () => {
      backListener.then(h => h.remove()).catch(() => {});
      stateListener.then(h => h.remove()).catch(() => {});
    };
  }, [selectedProperty, isHostModalOpen, isMyListingsModalOpen, isSelfHostModalOpen, isSitemapModalOpen, isPrivacyModalOpen, activeMobileTab, filters]);

  // Direct Link Deep Linking (?property=p-1) for Google Maps & shared URLs
  useEffect(() => {
    if (properties.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get('property') || params.get('p') || params.get('id');
      if (pid) {
        const match = properties.find((p) => p.id === pid || p.slug === pid);
        if (match) {
          setSelectedProperty(match);
        }
      }
    }
  }, [properties]);

  // Listen to browser Back / Forward buttons for modal state
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/privacy-policy') {
        setIsPrivacyModalOpen(true);
      } else {
        setIsPrivacyModalOpen(false);
      }
      const params = new URLSearchParams(window.location.search);
      const pid = params.get('property') || params.get('p') || params.get('id');
      if (pid && properties.length > 0) {
        const match = properties.find((p) => p.id === pid || p.slug === pid);
        setSelectedProperty(match || null);
      } else {
        setSelectedProperty(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [properties]);

  const handleOpenPrivacyPolicy = () => {
    setIsPrivacyModalOpen(true);
    if (typeof window !== 'undefined' && window.location.pathname !== '/privacy-policy') {
      window.history.pushState({}, '', '/privacy-policy');
    }
  };

  const handleClosePrivacyPolicy = () => {
    setIsPrivacyModalOpen(false);
    if (typeof window !== 'undefined' && window.location.pathname === '/privacy-policy') {
      window.history.pushState({}, '', '/');
    }
  };

  // Handle Property Selection with Deep Link URL state sync
  const handleSelectProperty = (property: Property | null) => {
    setSelectedProperty(property);
    
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (property) {
        url.searchParams.set('property', property.id);
      } else {
        url.searchParams.delete('property');
        url.searchParams.delete('p');
        url.searchParams.delete('id');
      }
      const newUrl = url.pathname + (url.search ? url.search : '');
      window.history.pushState(property ? { propertyId: property.id } : {}, '', newUrl);
    }
  };

  // Handle Filter Changes with natural query interpretation and brief non-blocking state
  const handleFilterChange = (newFilters: SearchFilters) => {
    if (newFilters.destination && newFilters.destination !== filters.destination) {
      const parsed = parseNaturalLanguageQuery(newFilters.destination, newFilters);
      setFilters(parsed);
    } else {
      setFilters(newFilters);
    }
  };

  // Handle Wishlist Toggle
  const handleToggleWishlist = (id: string) => {
    const updated = toggleWishlistId(id);
    setWishlist(updated);
  };

  // Handle Adding New Host Property
  const handleSaveNewProperty = async (newProperty: Property) => {
    try {
      const updatedList = await savePropertyToStore(newProperty);
      setProperties(updatedList);
      setIsHostModalOpen(false);
      handleSelectProperty(newProperty);
    } catch (e: any) {
      console.error("Failed to save property to Turso database:", e);
      alert(`⚠️ Could not save listing to live server: ${e?.message || 'Database connection error'}`);
    }
  };

  // Handle Deleting Host Property
  const handleDeleteProperty = async (id: string) => {
    const updatedList = await deletePropertyFromStore(id);
    setProperties(updatedList);
    if (selectedProperty?.id === id) {
      handleSelectProperty(null);
    }
  };

  // Handle Saving Self-Host Settings
  const handleSaveSelfHostConfig = (newConfig: SelfHostConfig) => {
    saveSelfHostConfig(newConfig);
    setSelfHostConfig(newConfig);
  };

  // Filter properties in memory (low latency instant search)
  const filteredProperties = useMemo(() => {
    const matched = properties.filter((prop) => {
      // Rental Type Filter (Daily, PG Hostel, Monthly Room, Commercial Shop, For Sale)
      if (filters.rentalType && filters.rentalType !== 'all') {
        if (prop.rentalType !== filters.rentalType) return false;
      }

      // Sale Sub-type Filter (Open Plot, Independent House, Flat, Apartment, Villa, Commercial)
      if (filters.rentalType === 'for_sale' && filters.saleSubType && filters.saleSubType !== 'all') {
        if (prop.saleDetails?.propertyType !== filters.saleSubType) return false;
      }

      // City Filter
      if (filters.city && filters.city.trim()) {
        const cityQuery = filters.city.toLowerCase().trim();
        if (!prop.location.city.toLowerCase().includes(cityQuery)) return false;
      }

      // Gender Filter for PGs (mens, womens, unisex)
      if (filters.genderFilter && filters.genderFilter !== 'all') {
        if (prop.pgDetails && prop.pgDetails.gender !== filters.genderFilter) return false;
      }

      // Destination Search (matches city, state, neighborhood, title, address, description, landmarks)
      if (filters.destination && filters.destination.trim()) {
        const rawQuery = filters.destination.toLowerCase().trim();
        const searchableText = [
          prop.title,
          prop.location.city,
          prop.location.state,
          prop.location.neighborhood,
          prop.location.address,
          prop.description,
          prop.category,
          ...(prop.nearbyPOIs?.map((p) => p.name) || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        // Direct exact substring match check
        if (!searchableText.includes(rawQuery)) {
          // Fallback to tokenized search: every location/keyword token must match in property text
          const tokens = extractLocationTokens(rawQuery);
          if (tokens.length > 0) {
            const allTokensMatch = tokens.every((token) => searchableText.includes(token));
            if (!allTokensMatch) return false;
          }
        }
      }

      // Category Filter
      if (filters.category && filters.category !== 'all') {
        if (prop.category !== filters.category) return false;
      }

      // Guests Filter
      if (filters.guests > 1) {
        if (prop.maxGuests < filters.guests) return false;
      }

      // Direct WhatsApp / Call Only
      if (filters.instantCallOnly) {
        if (!prop.instantCallAvailable) return false;
      }

      // Wishlist Tab Filter
      if (activeMobileTab === 'wishlist') {
        if (!wishlist.includes(prop.id)) return false;
      }

      return true;
    });

    return sortProperties(matched);
  }, [properties, filters, activeMobileTab, wishlist]);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col pb-16 md:pb-0 selection:bg-rose-500 selection:text-white">
      
      {/* Google Search & Rich Snippets SEO JSON-LD Injector */}
      <SEOStructuredData properties={filteredProperties} selectedProperty={selectedProperty} />

      {/* Top Sticky Navigation Container (Header + Category Filter Bar) */}
      <div className="sticky top-0 z-30 bg-white shadow-xs pt-[env(safe-area-inset-top,0px)] border-b border-gray-100">
        <Header
          filters={filters}
          onFilterChange={handleFilterChange}
          onOpenHostModal={() => setIsHostModalOpen(true)}
          onOpenMyListingsModal={() => setIsMyListingsModalOpen(true)}
          onOpenSelfHostModal={() => setIsSelfHostModalOpen(true)}
          onOpenSitemapModal={() => setIsSitemapModalOpen(true)}
          totalResultsCount={filteredProperties.length}
        />

        <CategoryFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          totalCount={filteredProperties.length}
        />
      </div>

      {/* Main Grid Content */}
      <main ref={containerRef} className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto">
        
        {/* Pull to refresh spinner indicator */}
        {isRefreshing && (
          <div className="flex items-center justify-center gap-2 py-2 mb-3 bg-rose-50 text-rose-600 rounded-full text-xs font-bold border border-rose-100 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
            <span>Updating latest properties...</span>
          </div>
        )}
        
        {/* Active Wishlist Banner Header */}
        {activeMobileTab === 'wishlist' && (
          <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
                Your Saved Wishlist ({filteredProperties.length})
              </h2>
            </div>
            <button
              onClick={() => setActiveMobileTab('explore')}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Back to All Rentals →
            </button>
          </div>
        )}

        {/* Preload Skeleton vs Real Property Grid */}
        {isLoading ? (
          <PropertyGridSkeleton count={8} />
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                activeCurrency={activeCurrency}
                isWishlisted={wishlist.includes(property.id)}
                onToggleWishlist={handleToggleWishlist}
                onClick={handleSelectProperty}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-16 text-center flex flex-col items-center justify-center max-w-md mx-auto gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shadow-xs">
              <Search className="w-8 h-8 stroke-[2]" />
            </div>
            <div className="flex flex-col gap-1 px-4">
              <h3 className="text-lg font-bold text-gray-900">No properties found</h3>
              <p className="text-xs text-gray-500">
                Try searching for another city or area in India, resetting filters, or list your property on ezy.homes.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilters({
                    destination: '',
                    city: '',
                    rentalType: 'all',
                    genderFilter: 'all',
                    category: 'all',
                    checkIn: '',
                    checkOut: '',
                    guests: 1,
                    minPriceUSD: 0,
                    maxPriceUSD: 1000,
                    amenities: [],
                    instantCallOnly: false,
                  });
                  setActiveMobileTab('explore');
                }}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 text-xs font-bold hover:bg-gray-200"
              >
                Reset Search
              </button>
              <button
                onClick={() => setIsHostModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600"
              >
                + List Property
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer Section */}
      <footer className="mt-12 bg-gray-50 border-t border-gray-100 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-black text-gray-900 text-sm">ezy<span className="text-rose-500">.homes</span></span>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">
                Direct Rental Platform India
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Daily Rentals, PG Hostels & Monthly Rooms across all Indian cities with direct WhatsApp & phone contact.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-700">
            <button onClick={() => setIsSitemapModalOpen(true)} className="hover:text-rose-600 transition-colors flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> Cities Sitemap & Directory
            </button>
            <span>•</span>
            <button onClick={() => setIsMyListingsModalOpen(true)} className="hover:text-rose-600 transition-colors flex items-center gap-1 text-rose-600 font-extrabold">
              <Building2 className="w-3.5 h-3.5 text-rose-500" /> My Listings
            </button>
            <span>•</span>
            <button onClick={() => setIsHostModalOpen(true)} className="hover:text-rose-600 transition-colors">
              List Your Property
            </button>
            <span>•</span>
            <button onClick={handleOpenPrivacyPolicy} className="hover:text-rose-600 transition-colors flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" /> Privacy Policy
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <MessageSquare className="w-3.5 h-3.5" /> Direct Owner Contact
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile App Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeMobileTab}
        onSelectTab={handleSelectMobileTab}
        wishlistCount={wishlist.length}
        onOpenHostModal={() => setIsHostModalOpen(true)}
      />

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          activeCurrency={activeCurrency}
          isWishlisted={wishlist.includes(selectedProperty.id)}
          onToggleWishlist={handleToggleWishlist}
          onClose={() => handleSelectProperty(null)}
        />
      )}

      {/* Host Property Creator Modal */}
      {isHostModalOpen && (
        <HostPropertyModal
          onSaveProperty={handleSaveNewProperty}
          onClose={() => setIsHostModalOpen(false)}
        />
      )}

      {/* My Listings Management Modal */}
      {isMyListingsModalOpen && (
        <MyListingsModal
          properties={properties}
          onDeleteProperty={handleDeleteProperty}
          onSaveProperty={handleSaveNewProperty}
          onOpenHostModal={() => setIsHostModalOpen(true)}
          onClose={() => setIsMyListingsModalOpen(false)}
        />
      )}

      {/* India Cities Sitemap & SEO Directory Modal */}
      {isSitemapModalOpen && (
        <SitemapDirectoryModal
          onSelectLocation={(city, area) => {
            setFilters(prev => ({ ...prev, city, destination: area || city }));
          }}
          onClose={() => setIsSitemapModalOpen(false)}
        />
      )}

      {/* Official Privacy Policy Modal & Public Page View */}
      {isPrivacyModalOpen && (
        <PrivacyPolicyModal
          onClose={handleClosePrivacyPolicy}
        />
      )}

      {/* Self-Host Architecture Panel Modal */}
      {isSelfHostModalOpen && (
        <SelfHostPanel
          config={selfHostConfig}
          onSaveConfig={handleSaveSelfHostConfig}
          onClose={() => setIsSelfHostModalOpen(false)}
        />
      )}

      {/* Progressive Web App Install Banner for iOS, Android & Desktop */}
      <PWAInstallPrompt />

    </div>
  );
}


