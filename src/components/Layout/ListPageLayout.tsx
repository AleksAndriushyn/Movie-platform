import React from "react";
import type { Movie } from "@/types/movie";
import MovieGrid from "../Movies/MovieGrid/MovieGrid";
import Pagination from "../Pagination/Pagination";
import { useSearchParams } from "react-router-dom";
import MovieCardSkeleton from "../UI/MovieCardSkeleton";

interface ListPageLayoutProps {
	title: string;
	movies: Movie[];
	totalPages: number;
	isLoading: boolean;
	isFetching: boolean;
	isError: boolean;
	handlePageChange?: (page: number) => void;
}

export const ListPageLayout: React.FC<ListPageLayoutProps> = ({
	title,
	movies,
	totalPages,
	isLoading,
	isFetching,
	isError,
	handlePageChange,
}) => {
	const [searchParams] = useSearchParams();
	const urlQuery = searchParams.get("query") || "";

	let content: React.ReactNode;

	if (isLoading) {
		content = (
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
				{Array.from({ length: 20 }).map((_, index) => (
					<MovieCardSkeleton key={index} />
				))}
			</div>
		);
	} else if (isError) {
		content = (
			<div className="text-center p-20 text-red-500">
				Error loading data. Please try again later.
			</div>
		);
	} else if (movies.length === 0 && !isLoading && urlQuery) {
		content = (
			<div className="text-center p-20 text-gray-400">
				No results found for "{urlQuery}". Try a different search term.
			</div>
		);
	} else {
		content = (
			<>
				<div
					className={
						isFetching ? "opacity-50 transition-opacity" : "transition-opacity"
					}
				>
					<MovieGrid movies={movies} />
				</div>
				<div className="flex justify-center mt-12">
					<Pagination totalPages={totalPages} isFetching={isFetching} />
				</div>
			</>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between gap-4 items-center mb-8 border-b border-gray-700 pb-4">
				<h1 className="text-3xl sm:text-4xl font-bold text-white shrink-0">
					{title}
				</h1>
				<div className="hidden lg:block">
					<Pagination
						totalPages={totalPages}
						isFetching={isFetching}
						onPageChange={handlePageChange}
					/>
				</div>
			</div>
			{content}
		</div>
	);
};
