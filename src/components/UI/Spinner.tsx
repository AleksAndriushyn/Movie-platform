import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-20">
      <div 
        className="w-12 h-12 rounded-full border-4 border-t-4 border-gray-700 border-t-red-600 animate-spin"
        role="status"
        aria-label="loading"
      />
      <p className="ml-4 text-xl text-gray-400">Loading...</p>
    </div>
  );
};

export default Spinner;