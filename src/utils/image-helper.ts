export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const POSTER_SIZES = ['w92', 'w154', 'w185', 'w342', 'w500', 'w780'];

export function getImageUrl(path: string | null | undefined, size: string = 'w500'): string {
  if (!path) {
    return ''; 
  }
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
}

export function getPosterSrcSet(path: string | null | undefined): string {
  if (!path) {
    return '';
  }

  return POSTER_SIZES.map(size => {
    const width = size.substring(1);
    return `${getImageUrl(path, size)} ${width}w`;
  }).join(', ');
}