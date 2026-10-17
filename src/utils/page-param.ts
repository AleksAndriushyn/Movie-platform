import { TMDB_MAX_PAGES } from '@/api/AxiosInstance';

// TMDB rejects page < 1 or > 500, so keep hand-edited ?page= values in range
const getPageParam = (searchParams: URLSearchParams): number => {
  const page = Math.floor(Number(searchParams.get('page')));
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, TMDB_MAX_PAGES);
};

export default getPageParam;
