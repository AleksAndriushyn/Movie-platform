import React from "react";
import clsx from "clsx";
import { useListToggle } from "@/hooks/useLists";
import type { MovieListName } from "@/types/user";

const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
	<svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
		<path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
	</svg>
);

const BookmarkIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
	<svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
		<path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
	</svg>
);

const LISTS: Record<MovieListName, { add: string; remove: string; activeClass: string; Icon: React.FC<{ filled: boolean }> }> = {
	favorites: { add: "Add to favorites", remove: "Remove from favorites", activeClass: "text-red-500", Icon: HeartIcon },
	watchlist: { add: "Add to watchlist", remove: "Remove from watchlist", activeClass: "text-yellow-400", Icon: BookmarkIcon },
};

type ListToggleProps = {
	list: MovieListName;
	movieId: number;
	variant: "icon" | "labeled";
};

const ListToggle: React.FC<ListToggleProps> = ({ list, movieId, variant }) => {
	const { isInList, toggle, isPending } = useListToggle(list, movieId);
	const { add, remove, activeClass, Icon } = LISTS[list];
	const label = isInList ? remove : add;

	return (
		<button
			type="button"
			onClick={toggle}
			disabled={isPending}
			aria-pressed={isInList}
			aria-label={label}
			title={label}
			className={clsx(
				"flex items-center gap-2 transition disabled:opacity-60",
				variant === "icon"
					? "p-2 rounded-full bg-gray-900/70 backdrop-blur-sm hover:bg-gray-900"
					: "px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-sm font-semibold",
				isInList ? activeClass : "text-white"
			)}
		>
			<Icon filled={isInList} />
			{variant === "labeled" && <span className="text-white">{label}</span>}
		</button>
	);
};

type ListToggleButtonsProps = {
	movieId: number;
	variant?: "icon" | "labeled";
	className?: string;
};

export const ListToggleButtons: React.FC<ListToggleButtonsProps> = ({ movieId, variant = "icon", className }) => (
	<div className={clsx("flex gap-2", variant === "icon" && "flex-col", className)}>
		<ListToggle list="favorites" movieId={movieId} variant={variant} />
		<ListToggle list="watchlist" movieId={movieId} variant={variant} />
	</div>
);
