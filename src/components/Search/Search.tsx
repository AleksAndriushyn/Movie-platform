import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchDebounce } from "@/hooks/useSearchDebounce";
import SearchInput from "./SearchInput";
import SearchModal from "../modals/SearchModal/SearchModal";
import { SearchResultItem } from "./SearchItem";
import type { Movie } from "@/types/movie";
import { useClickOutside } from "@/hooks/useClickOutside";

const Search: React.FC = () => {
	const navigate = useNavigate();

	const [isOpen, setIsOpen] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const {
		searchTerm,
		setSearchTerm,
		searchResults,
		isLoading,
		setSearchResults,
		debouncedTerm,
	} = useSearchDebounce();

	const containerRef = useClickOutside(() => closePopup());

	useEffect(() => {
		if (debouncedTerm.trim()) {
			openPopup();
		} else {
			setSearchResults([]);
		}
	}, [searchResults.length, debouncedTerm, setSearchResults]);

	useEffect(() => {
		if (isOpen && window.innerWidth < 640) {
			setTimeout(() => searchInputRef.current?.focus(), 100);
		}
	}, [isOpen]);

	const closePopup = () => {
		setIsOpen(false);
	};

	const openPopup = () => {
		setIsOpen(true);
		searchInputRef.current?.focus();
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchTerm.trim()) {
			navigate(`/search?query=${searchTerm}`);
			closePopup();
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);
	};

	const handleFocus = () => {
		if (searchTerm.trim()) {
			openPopup();
		}
	};

	return (
		<div ref={containerRef} className="relative">
			<div className="hidden sm:block">
				<SearchInput
					value={searchTerm}
					onChange={handleInputChange}
					onFocus={handleFocus}
					onSubmit={handleSubmit}
				/>
			</div>
			<button
				onClick={openPopup}
				className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition sm:hidden"
				aria-label="Open search"
			>
				<svg
					className="w-5 h-5 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					></path>
				</svg>
			</button>

			<SearchModal isOpen={isOpen} onClose={closePopup}>
				<div className="rounded-2xl bg-gray-800 text-center align-middle">
					<div className="p-4 sm:hidden">
						<SearchInput
							ref={searchInputRef}
							value={searchTerm}
							onChange={handleInputChange}
							onSubmit={handleSubmit}
						/>
					</div>
					{debouncedTerm.trim() && (
						<div className="p-4 pt-0 sm:pt-4 max-h-[70vh] overflow-y-auto text-left">
							{isLoading && <p className="text-gray-400">Searching...</p>}

							{!isLoading && !searchResults?.length && debouncedTerm.trim() && (
								<p className="text-gray-400">
									No results found for "{debouncedTerm}". Try a different search
									term.
								</p>
							)}

							{!isLoading && searchResults?.length > 0 && (
								<ul>
									{searchResults.map((movie: Movie) => (
										<SearchResultItem
											key={movie.id}
											movie={movie}
											onClick={closePopup}
										/>
									))}
								</ul>
							)}
						</div>
					)}
				</div>
			</SearchModal>
		</div>
	);
};

export default Search;
