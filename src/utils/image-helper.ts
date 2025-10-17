export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export function getImageUrl(path: string | null | undefined, size: string = 'w500'): string {
  if (!path) {
    return '/react.svg'; 
  }
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
}