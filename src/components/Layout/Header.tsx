import useMovieGenres from '@/hooks/useMovieGenres';
import debounce from '@/utils/debounce';
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const Header: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('query') || '';

  const [searchTerm, setSearchTerm] = useState(urlQuery);
  const navigate = useNavigate();

  const coreNavigate = useCallback(
    (query: string) => {
      if (query.trim()) {
        navigate(`/search?query=${query}`, { replace: true });
      }
    },
    [navigate]
  );

  const debouncedNavigate = useMemo(
    () => debounce(coreNavigate, 1200),
    [coreNavigate]
  );

  const { data: genres, isLoading: isLoadingGenres } = useMovieGenres();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchTerm(query);
    debouncedNavigate(query);
  };

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
          <form
            onSubmit={(e) => e.preventDefault()}
            className='hidden sm:block'
          >
            <input
              type="search"
              placeholder="Search movies and series..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </form>
          <button
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition sm:hidden"
            aria-label="Open search page"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </button>

          <button className="auth-button">Sign in</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
