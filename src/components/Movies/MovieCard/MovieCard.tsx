import React from "react";
import type { Movie } from "@/types/movie";
import { getImageUrl, getPosterSrcSet } from "@/utils/image-helper";
import clsx from "clsx";
import { Link } from "react-router-dom";
import getReleaseYear from "@/utils/release-year";
import { ListToggleButtons } from "@/components/Lists/ListToggleButtons";
import { useListMembership } from "@/hooks/useLists";
type MovieCardProps = {
	movie: Movie;
	eagerLoad?: boolean;
};

const MovieCard: React.FC<MovieCardProps> = ({ movie, eagerLoad = false }) => {
	const { data: membership } = useListMembership();
	const userRating = membership?.ratings[movie.id] ?? movie.user_rating;

	const posterUrl = getImageUrl(movie.poster_path, "w500");
	const srcSet = getPosterSrcSet(movie.poster_path);

	const rating = movie.vote_average.toFixed(1);
	const ratingColorClass = clsx({
		"bg-green-600": movie.vote_average >= 8,
		"bg-yellow-600": movie.vote_average >= 6 && movie.vote_average < 8,
		"bg-red-600": movie.vote_average < 6,
	});

	return (
		// buttons sit beside the link, not inside it: a <button> can't be nested in an <a>
		<div className="movie-card-wrapper">
			<Link to={`/movie/${movie.id}`}>
				<div className="movie-card">
					<div className="relative aspect-[2/3] w-full shrink-0">
						{movie.poster_path ? (
							<img
								src={posterUrl}
								srcSet={srcSet}
								sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
								alt={movie.title}
								className="absolute inset-0 w-full h-full object-cover"
								loading={eagerLoad ? "eager" : "lazy"}
								fetchPriority={eagerLoad ? "high" : "auto"}
							/>
						) : (
							<div className="absolute inset-0 flex items-center justify-center bg-gray-700 text-gray-400 text-sm p-4 text-center">
								No poster available
							</div>
						)}
	
						<div className={`movie-card-rating ${ratingColorClass}`}>
							{rating}
						</div>

						{userRating && (
							<div className="movie-card-user-rating" title={`Your rating: ${userRating}/10`}>
								★ {userRating}
							</div>
						)}
					</div>
	
					<div className="p-4 flex flex-col flex-grow">
						<h3
							title={movie.title}
							className="text-lg font-semibold text-white truncate mb-1 hover:text-red-500 transition duration-150">
							{movie.title}
						</h3>
	
						<p className="text-sm text-gray-400">
							{getReleaseYear(movie.release_date) ?? "N/A"}
						</p>
	
						<p className="text-xs text-gray-500 mt-2 line-clamp-2">
							{movie.overview || "Description not available."}
						</p>
					</div>
				</div>
			</Link>
			<ListToggleButtons movieId={movie.id} className="absolute top-2 right-2" />
		</div>
	);
};

export default MovieCard;
