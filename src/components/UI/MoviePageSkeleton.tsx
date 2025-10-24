import React from 'react';

export const MoviePageSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-[40vh] md:h-[50vh] bg-gray-800"></div>

      <div className="container mx-auto px-4 -mt-24 md:-mt-32 relative z-10 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 md:w-64 shrink-0">
            <div className="aspect-[2/3] w-full bg-gray-700 rounded-lg"></div>
          </div>

          <div className="flex-grow pt-12 md:pt-20">
            <div className="h-10 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="h-7 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};