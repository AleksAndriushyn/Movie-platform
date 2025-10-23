import { Link } from 'react-router-dom';
import type { Movie } from '@/types/movie';
import { getImageUrl } from '@/utils/image-helper';

type SearchResultItemProps = {
  movie: Movie;
  onClick: () => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({ movie, onClick }) => {
  const posterUrl = getImageUrl(movie.poster_path, 'w92');

  return (
		<Link
			to={`/movie/${movie.id}`}
			onClick={onClick}
			className="flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors"
		>
			<img src={posterUrl} alt={movie.title} className="w-12 h-auto rounded" />
			<div className="ml-3">
				<p className="text-white font-semibold">{movie.title}</p>
				{movie.release_date && (
					<p className="text-sm text-gray-400">
						{new Date(movie.release_date).getFullYear()}
					</p>
				)}
			</div>
		</Link>
	);
};