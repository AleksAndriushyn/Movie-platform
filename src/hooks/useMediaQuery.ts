import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  // read the real value on first render so mobile doesn't start with desktop settings
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    listener();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};
