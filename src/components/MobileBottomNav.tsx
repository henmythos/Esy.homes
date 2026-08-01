import React from 'react';
import { Search, Heart, PlusCircle } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'explore' | 'wishlist';
  onSelectTab: (tab: 'explore' | 'wishlist') => void;
  wishlistCount: number;
  onOpenHostModal: () => void;
  onOpenSelfHostModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  wishlistCount,
  onOpenHostModal,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2 flex items-center justify-around shadow-lg">
      
      {/* Explore Tab */}
      <button
        onClick={() => onSelectTab('explore')}
        className={`flex flex-col items-center gap-1 min-w-[60px] py-1 transition-colors ${
          activeTab === 'explore' ? 'text-rose-500 font-extrabold' : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <Search className={`w-5 h-5 ${activeTab === 'explore' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px]">Explore</span>
      </button>

      {/* Wishlist Tab */}
      <button
        onClick={() => onSelectTab('wishlist')}
        className={`relative flex flex-col items-center gap-1 min-w-[60px] py-1 transition-colors ${
          activeTab === 'wishlist' ? 'text-rose-500 font-extrabold' : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <div className="relative">
          <Heart className={`w-5 h-5 ${activeTab === 'wishlist' ? 'fill-rose-500 stroke-[2.5]' : ''}`} />
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {wishlistCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Wishlist</span>
      </button>

      {/* Host Home Tab */}
      <button
        onClick={onOpenHostModal}
        className="flex flex-col items-center gap-1 min-w-[60px] py-1 text-gray-500 hover:text-rose-500 transition-colors"
      >
        <PlusCircle className="w-5 h-5 text-rose-500" />
        <span className="text-[10px] text-gray-800 font-semibold">Host</span>
      </button>

    </div>
  );
};
