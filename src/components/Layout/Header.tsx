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
      <div className="header-container">
        <div className="flex justify-between items-center h-20 space-x-2">

          <div className="flex-shrink-0">
            <a href="/" className="header-logo">
              <span className="text-red-600">Movie</span>Verse 🍿
            </a>
          </div>

          <nav>
            {isLoadingGenres ? (
              <span className="text-gray-400">Loading Genres...</span>
            ) : (
              <ul className="flex space-x-4 text-white">
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

          <div className="flex items-center space-x-4">
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type="search"
                placeholder="Search movies and series..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </form>
            <button className="auth-button">Sign in</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
