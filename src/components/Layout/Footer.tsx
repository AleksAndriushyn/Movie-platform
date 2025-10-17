import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 border-t border-red-800/20 mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start space-y-6 md:space-y-0 pb-6 border-b border-gray-700/50">
          
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-extrabold text-red-600 mb-2">MovieVerse 🍿</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Your guide to the world of movies and TV series. Data provided by The Movie Database (TMDB).
            </p>
          </div>
          
          <div className="flex space-x-8 text-sm">
            <div className="flex flex-col space-y-2">
              <h4 className="font-semibold text-white mb-1 uppercase">Explore</h4>
              <a href="/" className="text-gray-400 hover:text-white transition duration-150">Trending</a>
              <a href="/movies" className="text-gray-400 hover:text-white transition duration-150">Movies</a>
              <a href="/series" className="text-gray-400 hover:text-white transition duration-150">Series</a>
            </div>
            
            <div className="flex flex-col space-y-2">
              <h4 className="font-semibold text-white mb-1 uppercase">Info</h4>
              <a href="/about" className="text-gray-400 hover:text-white transition duration-150">About Us</a>
              <a href="/contact" className="text-gray-400 hover:text-white transition duration-150">Contact</a>
              <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition duration-150">API (TMDB)</a>
            </div>
          </div>
        </div>

        <div className="pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} MovieVerse. All rights reserved. Built with ❤️ using React and Bun.
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;