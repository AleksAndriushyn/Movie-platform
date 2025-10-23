import { useState, useEffect } from "react";
import { useSearchMovies } from "./useMovies";
import { useSearchParams } from "react-router-dom";
import type { Movie } from "@/types/movie";

export const useSearchDebounce = () => {
	const [searchParams] = useSearchParams();
	const urlQuery = searchParams.get("query") || "";

	const [searchTerm, setSearchTerm] = useState(urlQuery);
	const [debouncedTerm, setDebouncedTerm] = useState("");

	const { data, isLoading } = useSearchMovies(debouncedTerm, 1);

	const [searchResults, setSearchResults] = useState<Movie[]>([]);

	useEffect(() => {
		const timerId = setTimeout(() => {
			setDebouncedTerm(searchTerm);
		}, 500);

		return () => {
			clearTimeout(timerId);
		};
	}, [searchTerm]);

	useEffect(() => {
		setSearchResults(data?.movies || []);
	}, [data?.movies]);

	return {
		searchTerm,
		setSearchTerm,
		searchResults,
		isLoading,
		setSearchResults,
		debouncedTerm,
  };
};
