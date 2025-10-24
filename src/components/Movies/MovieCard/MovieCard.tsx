import React from "react";
import type { Movie } from "@/types/movie";
import { getImageUrl, getPosterSrcSet } from "@/utils/image-helper";
import clsx from "clsx";
import { Link } from "react-router-dom";
type MovieCardProps = {
	movie: Movie;
	eagerLoad?: boolean;
};

const MovieCard: React.FC<MovieCardProps> = ({ movie, eagerLoad = false }) => {
	const posterUrl = getImageUrl(movie.poster_path, "w342");
	const srcSet = getPosterSrcSet(movie.poster_path);

	const rating = movie.vote_average.toFixed(1);
	const ratingColorClass = clsx({
		"bg-green-600": movie.vote_average >= 8,
		"bg-yellow-600": movie.vote_average >= 6 && movie.vote_average < 8,
		"bg-red-600": movie.vote_average < 6,
	});

	return (
		<Link to={`/movie/${movie.id}`}>
			<div className="movie-card">
				<div className="relative aspect-[2/3] w-full shrink-0">
					<img
						src={posterUrl}
						srcSet={srcSet}
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
						alt={movie.title}
						className="absolute inset-0 w-full h-full object-cover"
						loading={eagerLoad ? "eager" : "lazy"}
						fetchPriority={eagerLoad ? "high" : "auto"}
					/>

					<div className={`movie-card-rating ${ratingColorClass}`}>
						{rating}
					</div>
				</div>

				<div className="p-4 flex flex-col flex-grow">
					<h3
						title={movie.title}
						className="text-lg font-semibold text-white truncate mb-1 hover:text-red-500 transition duration-150">
						{movie.title}
					</h3>

					<p className="text-sm text-gray-400">
						{movie.release_date
							? new Date(movie.release_date).getFullYear()
							: "N/A"}
					</p>

					<p className="text-xs text-gray-500 mt-2 line-clamp-2">
						{movie.overview || "Description not available."}
					</p>
				</div>
			</div>
		</Link>
	);
};

export default MovieCard;
