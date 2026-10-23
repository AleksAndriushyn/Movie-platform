import React, { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useCurrentUser } from "@/hooks/useAuth";
import { useReportReview } from "@/hooks/useReviews";
import type { ReportReason, Review } from "@/types/review";
import { Avatar } from "./Avatar";
import { formatReviewDate } from "./format";

const REPORT_REASONS: { reason: ReportReason; label: string }[] = [
	{ reason: "spam", label: "Spam or advertising" },
	{ reason: "offensive", label: "Offensive or abusive" },
	{ reason: "spoilers", label: "Unmarked spoilers" },
	{ reason: "other", label: "Something else" },
];

type ReviewCardProps = {
	movieId: number;
	review: Review;
};

export const ReviewCard: React.FC<ReviewCardProps> = ({ movieId, review }) => {
	const { data: user } = useCurrentUser();
	const report = useReportReview(movieId);
	const [spoilerShown, setSpoilerShown] = useState(false);

	const isReported = review.reportedByMe || report.isSuccess;
	const hideBody = review.containsSpoilers && !spoilerShown && !review.isOwn;

	return (
		<article className="rounded-lg bg-gray-800 p-4">
			<header className="flex items-center gap-3 mb-3">
				<Avatar name={review.author.name} url={review.author.avatarUrl} />
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-white truncate">
						{review.author.name ?? "MovieVerse user"}
						{review.isOwn && <span className="ml-2 text-xs font-normal text-gray-400">(your review)</span>}
					</p>
					<p className="text-xs text-gray-400">
						{formatReviewDate(review.createdAt)}
						{review.updatedAt && " · edited"}
					</p>
				</div>
				{review.authorRating && (
					<span className="text-sm font-bold text-yellow-400 shrink-0" title={`Rated ${review.authorRating}/10`}>
						★ {review.authorRating}
					</span>
				)}
			</header>

			{hideBody ? (
				<div className="rounded bg-gray-900/60 p-4 text-center">
					<p className="text-sm text-gray-400 mb-2">This review contains spoilers.</p>
					<button type="button" onClick={() => setSpoilerShown(true)} className="text-sm text-red-400 hover:text-red-300 underline">
						Show anyway
					</button>
				</div>
			) : (
				<>
					{review.containsSpoilers && (
						<p className="mb-2 inline-block rounded bg-yellow-900/60 px-2 py-0.5 text-xs text-yellow-200">Spoilers</p>
					)}
					<p className="text-gray-300 whitespace-pre-line break-words">{review.body}</p>
				</>
			)}

			{user && !review.isOwn && (
				<footer className="mt-3 flex justify-end">
					{isReported ? (
						<span className="text-xs text-gray-500">Reported. Thanks for letting us know.</span>
					) : (
						<Menu as="div" className="relative">
							<MenuButton className="text-xs text-gray-400 hover:text-white" disabled={report.isPending}>
								Report
							</MenuButton>
							<MenuItems anchor="bottom end" className="z-30 mt-1 w-52 rounded-lg bg-gray-700 shadow-xl py-1 focus:outline-none">
								{REPORT_REASONS.map(({ reason, label }) => (
									<MenuItem key={reason}>
										<button
											type="button"
											onClick={() => report.mutate({ reviewId: review.id, reason })}
											className="block w-full text-left px-4 py-2 text-sm text-gray-200 data-[focus]:bg-gray-600"
										>
											{label}
										</button>
									</MenuItem>
								))}
							</MenuItems>
						</Menu>
					)}
				</footer>
			)}
		</article>
	);
};
