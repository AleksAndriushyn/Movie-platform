import React from "react";
import { useParams } from "react-router-dom";
import { useMovie } from "@/hooks/useMovie";
import { getImageUrl } from "@/utils/image-helper";
import Spinner from "@/components/UI/Spinner";

const MoviePage: React.FC = () => {
	const { movieId } = useParams<{ movieId: string }>();
	const id = Number(movieId);

	const { data: movie, isLoading, isError } = useMovie(id);

	if (isLoading) {
		return <Spinner />;
	}

	if (isError || !movie) {
		return (
			<div className="text-center p-20 text-red-500 text-2xl">
				Movie Not Found or API Error.
			</div>
		);
	}

	const backdropUrl = getImageUrl(movie.backdrop_path, "original");
	const posterUrl = getImageUrl(movie.poster_path, "w500");

	return (
		<div>
			<div className="relative -mx-4 -mt-8 h-96 overflow-hidden">
				<div
					className="absolute inset-0 bg-cover bg-center transition duration-500"
					style={{ backgroundImage: `url(${backdropUrl})` }}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
			</div>

			<div className="relative -mt-64 flex pb-12">
				<img
					src={posterUrl}
					alt={movie.title}
					className="w-64 h-96 object-cover rounded-xl shadow-2xl shrink-0"
				/>

				<div className="ml-8 pt-16">
					<h1 className="text-6xl font-extrabold text-white mb-3">
						{movie.title}
					</h1>

					<p className="text-lg text-gray-400 mb-6">
						{new Date(movie.release_date).getFullYear()} | ⭐{" "}
						{movie.vote_average.toFixed(1)} / 10
					</p>

					<h2 className="text-2xl font-semibold mb-2 text-red-500">Overview</h2>
					<p className="text-gray-300 leading-relaxed max-w-4xl">
						{movie.overview}
					</p>
				</div>
			</div>
		</div>
	);
};

export default MoviePage;
