import React, { useState } from "react";
import clsx from "clsx";
import { useMovieRating } from "@/hooks/useLists";

const MAX_SCORE = 10;

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
	<svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
		<path strokeLinejoin="round" d="M11.48 3.5a.56.56 0 011.04 0l2.13 5.11a.56.56 0 00.47.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 00-.18.56l1.28 5.38a.56.56 0 01-.84.61l-4.72-2.88a.56.56 0 00-.59 0l-4.72 2.88a.56.56 0 01-.84-.61l1.28-5.38a.56.56 0 00-.18-.56l-4.2-3.6a.56.56 0 01.32-.99l5.52-.44a.56.56 0 00.47-.35l2.13-5.11z" />
	</svg>
);

type RatingStarsProps = {
	movieId: number;
	className?: string;
};

/** The signed-in user's 1-10 score for a movie; signed-out clicks go to sign-in. */
export const RatingStars: React.FC<RatingStarsProps> = ({ movieId, className }) => {
	const { rating, setRating, isPending } = useMovieRating(movieId);
	const [hovered, setHovered] = useState<number | null>(null);

	const shown = hovered ?? rating ?? 0;

	return (
		<div className={clsx("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
			<span className="font-bold text-white">Your rating:</span>
			<div role="group" aria-label="Rate this movie from 1 to 10" className="flex" onMouseLeave={() => setHovered(null)}>
				{Array.from({ length: MAX_SCORE }, (_, index) => {
					const score = index + 1;
					return (
						<button
							key={score}
							type="button"
							onClick={() => setRating(score)}
							onMouseEnter={() => setHovered(score)}
							onFocus={() => setHovered(score)}
							onBlur={() => setHovered(null)}
							disabled={isPending}
							aria-label={`Rate ${score} out of ${MAX_SCORE}`}
							aria-pressed={rating === score}
							className={clsx(
								"p-0.5 transition-colors disabled:cursor-wait",
								score <= shown ? "text-yellow-400" : "text-gray-600 hover:text-gray-400"
							)}
						>
							<StarIcon filled={score <= shown} />
						</button>
					);
				})}
			</div>
			<span className="text-sm text-gray-300 w-12" aria-live="polite">
				{shown ? `${shown}/${MAX_SCORE}` : "—"}
			</span>
			{rating !== null && (
				<button
					type="button"
					onClick={() => setRating(null)}
					disabled={isPending}
					className="text-sm text-gray-400 hover:text-white underline"
				>
					Clear
				</button>
			)}
		</div>
	);
};
