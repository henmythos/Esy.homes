import React from 'react';

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl p-2.5 bg-white border border-gray-100 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-4/3 w-full rounded-xl bg-gray-200" />

      {/* Details Skeleton */}
      <div className="flex flex-col gap-2 px-1 py-1">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-10" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="pt-2 border-t border-gray-100 flex justify-between items-center mt-1">
          <div className="h-5 bg-gray-200 rounded w-24" />
          <div className="h-6 bg-gray-200 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
};

export const PropertyGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <PropertyCardSkeleton key={idx} />
      ))}
    </div>
  );
};
