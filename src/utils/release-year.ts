// TMDB dates are "YYYY-MM-DD"; new Date() parses them as UTC midnight,
// so getFullYear() returns the previous year for Jan 1 releases west of UTC
const getReleaseYear = (releaseDate: string | null | undefined): string | null => {
  if (!releaseDate) return null;
  return releaseDate.slice(0, 4);
};

export default getReleaseYear;
