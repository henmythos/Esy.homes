import React from 'react';
import { Search, Heart, PlusCircle, LayoutList } from 'lucide-react';

export type MobileTab = 'explore' | 'wishlist' | 'my_listings';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  wishlistCount: number;
  onOpenHostModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  wishlistCount,
  onOpenHostModal,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/98 backdrop-blur-md border-t border-gray-200 shadow-lg">
      <div className="flex items-end justify-around px-2 pb-safe">

        {/* Explore Tab */}
        <button
          onClick={() => onSelectTab('explore')}
          className={`flex flex-col items-center gap-0.5 min-w-[56px] pt-2 pb-2 transition-colors ${
            activeTab === 'explore' ? 'text-rose-500' : 'text-gray-500'
          }`}
        >
          <Search className={`w-5 h-5 ${activeTab === 'explore' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[10px] font-bold ${activeTab === 'explore' ? 'text-rose-500' : 'text-gray-500'}`}>
            Explore
          </span>
        </button>

        {/* Wishlist Tab */}
        <button
          onClick={() => onSelectTab('wishlist')}
          className={`relative flex flex-col items-center gap-0.5 min-w-[56px] pt-2 pb-2 transition-colors ${
            activeTab === 'wishlist' ? 'text-rose-500' : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${activeTab === 'wishlist' ? 'fill-rose-500 stroke-rose-500' : 'stroke-2'}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold ${activeTab === 'wishlist' ? 'text-rose-500' : 'text-gray-500'}`}>
            Saved
          </span>
        </button>

        {/* ── Centre FAB: Post Property ── */}
        <div className="flex flex-col items-center -mt-5">
          <button
            onClick={onOpenHostModal}
            className="w-14 h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 shadow-lg flex items-center justify-center transition-all"
            aria-label="Post a Property"
          >
            <PlusCircle className="w-7 h-7 text-white stroke-2" />
          </button>
          <span className="text-[10px] font-bold text-gray-500 mt-1">Post</span>
        </div>

        {/* My Listings Tab */}
        <button
          onClick={() => onSelectTab('my_listings')}
          className={`flex flex-col items-center gap-0.5 min-w-[56px] pt-2 pb-2 transition-colors ${
            activeTab === 'my_listings' ? 'text-rose-500' : 'text-gray-500'
          }`}
        >
          <LayoutList className={`w-5 h-5 ${activeTab === 'my_listings' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[10px] font-bold ${activeTab === 'my_listings' ? 'text-rose-500' : 'text-gray-500'}`}>
            My Listings
          </span>
        </button>

        {/* Placeholder for symmetry */}
        <div className="min-w-[10px]" />

      </div>
    </div>
  );
};
