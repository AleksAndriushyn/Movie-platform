import { useState, useEffect } from "react";
import { useSearchMovies } from "./useMovies";
import { useSearchParams } from "react-router-dom";

export const useSearchDebounce = () => {
	const [searchParams] = useSearchParams();
	const urlQuery = searchParams.get("query") || "";

	const [searchTerm, setSearchTerm] = useState(urlQuery);
	const [debouncedTerm, setDebouncedTerm] = useState("");

	const { data, isLoading, isError } = useSearchMovies(debouncedTerm, 1);

	useEffect(() => {
		const timerId = setTimeout(() => {
			setDebouncedTerm(searchTerm);
		}, 500);

		return () => {
			clearTimeout(timerId);
		};
	}, [searchTerm]);

	// placeholderData keeps the previous results around, so drop them once the term is cleared
	const searchResults = debouncedTerm.trim() ? data?.movies ?? [] : [];

	return {
		searchTerm,
		setSearchTerm,
		searchResults,
		isLoading,
		isError,
		debouncedTerm,
  };
};
