import React, { useState } from "react";
import type { TmdbReview } from "@/types/review";
import { Avatar } from "./Avatar";
import { formatReviewDate } from "./format";

const PREVIEW_LENGTH = 600;

export const TmdbReviewCard: React.FC<{ review: TmdbReview }> = ({ review }) => {
	const [expanded, setExpanded] = useState(false);
	const isLong = review.content.length > PREVIEW_LENGTH;
	const text = expanded || !isLong ? review.content : `${review.content.slice(0, PREVIEW_LENGTH).trimEnd()}…`;
	const rating = review.author_details.rating;

	return (
		<article className="rounded-lg bg-gray-800 p-4">
			<header className="flex items-center gap-3 mb-3">
				<Avatar name={review.author} />
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-white truncate">{review.author}</p>
					<p className="text-xs text-gray-400">{formatReviewDate(review.created_at)} · on TMDB</p>
				</div>
				{rating !== null && (
					<span className="text-sm font-bold text-yellow-400 shrink-0" title={`Rated ${rating}/10`}>
						★ {rating}
					</span>
				)}
			</header>
			{/* TMDB content is plain text (sometimes with markdown); React escapes it */}
			<p className="text-gray-300 whitespace-pre-line break-words">{text}</p>
			<footer className="mt-3 flex gap-4 text-sm">
				{isLong && (
					<button type="button" onClick={() => setExpanded(!expanded)} className="text-red-400 hover:text-red-300">
						{expanded ? "Show less" : "Show more"}
					</button>
				)}
				<a href={review.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
					Read on TMDB
				</a>
			</footer>
		</article>
	);
};
