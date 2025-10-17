import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-gray-900/95 backdrop-blur-sm shadow-2xl border-b border-red-800/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex-shrink-0">
            <a href="/" className="text-3xl font-extrabold text-white tracking-wider">
              <span className="text-red-600">Movie</span>Verse 🍿
            </a>
          </div>

          <div className="hidden md:block">
            <input
              type="text"
              placeholder="Search movies and series..."
              className="w-80 p-2 pl-4 text-sm text-gray-200 bg-gray-800 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition duration-150"
            />
          </div>

          <nav className="flex items-center space-x-6">
            <a href="/" className="text-gray-300 hover:text-red-500 font-medium transition duration-150">Trending</a>
            <a href="/movies" className="text-gray-300 hover:text-red-500 transition duration-150">Movies</a>
            <a href="/series" className="text-gray-300 hover:text-red-500 transition duration-150">Series</a>
            
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;