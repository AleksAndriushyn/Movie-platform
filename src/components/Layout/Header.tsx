import useMovieGenres from '@/hooks/useMovieGenres';
import React from 'react';
import { Link } from 'react-router-dom';
import Search from '../Search/Search';

const Header: React.FC = () => {
  const { data: genres, isLoading: isLoadingGenres } = useMovieGenres();

  return (
    <header className="main-header">
      <div className="header-container flex justify-between gap-2 items-center h-20">
        <div className="flex items-center md:gap-8">
          <Link
            to="/"
            className="header-logo flex items-center space-x-2 shrink-0"
          >
            <span className="text-red-600">Movie</span>
            <span>Verse</span>
          </Link>

          <nav className="hidden lg:block">
            {isLoadingGenres ? (
              <span className="text-gray-400">Loading Genres...</span>
            ) : (
              <ul className="flex gap-4 text-white">
                {genres?.slice(0, 5).map((genre) => (
                  <li key={genre.id}>
                    <Link
                      to={`/genre/${genre.id}`}
                      className="hover:text-red-500 transition"
                    >
                      {genre.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Search/>
          {/* <button className="auth-button">Sign in</button> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
