import React, { useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useMovieReviews, useTmdbReviews } from "@/hooks/useReviews";
import { ReviewCard } from "./ReviewCard";
import { ReviewEditor } from "./ReviewEditor";
import { TmdbReviewCard } from "./TmdbReviewCard";

const TAB_CLASS =
	"px-4 py-2 rounded-full text-sm font-semibold focus:outline-none data-[selected]:bg-red-600 data-[selected]:text-white text-gray-300 hover:text-white";

const LoadMoreButton: React.FC<{ onClick: () => void; loading: boolean }> = ({ onClick, loading }) => (
	<button type="button" onClick={onClick} disabled={loading} className="mx-auto block px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-sm">
		{loading ? "Loading…" : "Show more reviews"}
	</button>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="text-gray-400">{children}</p>;

export const ReviewsSection: React.FC<{ movieId: number }> = ({ movieId }) => {
	const [tabIndex, setTabIndex] = useState(0);
	const reviews = useMovieReviews(movieId);
	// TMDB reviews load only once their tab is opened
	const tmdb = useTmdbReviews(movieId, tabIndex === 1);

	const ourReviews = reviews.data?.pages.flatMap((page) => page.results) ?? [];
	const ourTotal = reviews.data?.pages[0]?.totalResults;
	const tmdbReviews = tmdb.data?.pages.flatMap((page) => page.results) ?? [];
	const tmdbTotal = tmdb.data?.pages[0]?.total_results;

	return (
		<section className="px-4 sm:px-6 lg:px-8 mt-12 border-t border-gray-700 pt-8" aria-labelledby="reviews-heading">
			<h2 id="reviews-heading" className="text-3xl font-bold mb-6">Reviews</h2>
			<TabGroup selectedIndex={tabIndex} onChange={setTabIndex}>
				<TabList className="flex gap-2 mb-6">
					<Tab className={TAB_CLASS}>MovieVerse{ourTotal !== undefined && ` (${ourTotal})`}</Tab>
					<Tab className={TAB_CLASS}>TMDB{tmdbTotal !== undefined && ` (${tmdbTotal})`}</Tab>
				</TabList>
				<TabPanels>
					<TabPanel className="space-y-4 max-w-4xl">
						<ReviewEditor movieId={movieId} />
						{reviews.isLoading && <div className="h-24 rounded-lg bg-gray-800 animate-pulse" />}
						{reviews.isError && <Empty>Couldn't load reviews. Please try again later.</Empty>}
						{reviews.isSuccess && ourReviews.length === 0 && <Empty>No reviews yet. Be the first to share your thoughts.</Empty>}
						{ourReviews.map((review) => (
							<ReviewCard key={review.id} movieId={movieId} review={review} />
						))}
						{reviews.hasNextPage && (
							<LoadMoreButton onClick={() => reviews.fetchNextPage()} loading={reviews.isFetchingNextPage} />
						)}
					</TabPanel>
					<TabPanel className="space-y-4 max-w-4xl">
						{tmdb.isLoading && <div className="h-24 rounded-lg bg-gray-800 animate-pulse" />}
						{tmdb.isError && <Empty>Couldn't load TMDB reviews. Please try again later.</Empty>}
						{tmdb.isSuccess && tmdbReviews.length === 0 && <Empty>TMDB has no reviews for this movie yet.</Empty>}
						{tmdbReviews.map((review) => (
							<TmdbReviewCard key={review.id} review={review} />
						))}
						{tmdb.hasNextPage && <LoadMoreButton onClick={() => tmdb.fetchNextPage()} loading={tmdb.isFetchingNextPage} />}
					</TabPanel>
				</TabPanels>
			</TabGroup>
		</section>
	);
};
