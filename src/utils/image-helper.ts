export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const POSTER_SIZES = {
  SMALL: 'w185',
  MEDIUM: 'w342',
  LARGE: 'w500',
};

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

  const srcsetParts = [
    `${getImageUrl(path, POSTER_SIZES.SMALL)} ${185}w`,
    `${getImageUrl(path, POSTER_SIZES.MEDIUM)} ${342}w`,
    `${getImageUrl(path, POSTER_SIZES.LARGE)} ${500}w`,
  ];

  return srcsetParts.join(', ');
}