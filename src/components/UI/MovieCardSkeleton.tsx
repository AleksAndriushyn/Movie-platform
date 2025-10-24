import React from 'react';

const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col rounded-lg bg-gray-800 animate-pulse">
      <div className="relative aspect-[2/3] w-full shrink-0 bg-gray-700 rounded-t-lg"></div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  );
};

export default MovieCardSkeleton;