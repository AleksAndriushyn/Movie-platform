import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchDebounce } from "@/hooks/useSearchDebounce";
import SearchInput from "./SearchInput";
import SearchModal from "../modals/SearchModal/SearchModal";
import { SearchResultItem } from "./SearchItem";
import type { Movie } from "@/types/movie";

const Search: React.FC = () => {
	const navigate = useNavigate();

	const [isOpen, setIsOpen] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const { searchTerm, setSearchTerm, searchResults, isLoading } =
		useSearchDebounce();

	useEffect(() => {
		if (searchResults.length > 0 && searchTerm.trim()) {
			openPopup();
		}
		if (!searchTerm.trim()) {
			closePopup();
		}
	}, [searchResults.length, searchTerm]);

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

	const handleClick = () => {
		if (searchTerm.trim() && searchResults.length > 0) {
			openPopup();
		}
	};

	const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
		if (!e.currentTarget.contains(e.relatedTarget)) {
			closePopup();
		}
	};

	return (
		<div ref={containerRef} onBlur={handleBlur} className="relative">
			<div className="hidden sm:block">
				<SearchInput
					value={searchTerm}
					onChange={handleInputChange}
					onFocus={handleClick}
					onSubmit={handleSubmit}
				/>
			</div>
			<button
				onClick={openPopup}
				className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition sm:hidden"
				aria-label="Open search">
				<svg
					className="w-5 h-5 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
				</svg>
			</button>

			<SearchModal isOpen={isOpen} onClose={closePopup}>
				<div className="rounded-2xl bg-gray-800 text-left align-middle">
					<div className="p-4 sm:hidden">
						<SearchInput
							ref={searchInputRef}
							value={searchTerm}
							onChange={handleInputChange}
							onSubmit={handleSubmit}
						/>
					</div>
					<div className="p-4 pt-0 sm:pt-4 max-h-[70vh] overflow-y-scroll">
						{isLoading && <p className="text-gray-400">Searching...</p>}
						
						{!isLoading && !searchResults?.length && searchTerm.trim() && (
							<p className="text-gray-400">No results found.</p>
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
				</div>
			</SearchModal>

			{/* <Transition appear show={isOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-30"
					onClose={closePopup}
					initialFocus={searchInputRef}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0">
						<div className="fixed inset-0 bg-black/50 sm:hidden" />
					</Transition.Child>

					<div className="fixed inset-0 sm:top-0 sm:right-4">
						<div className="flex min-h-full items-start justify-center sm:justify-end">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95">
								<Dialog.Panel className="w-full max-w-xs transform rounded-2xl bg-gray-800 text-left align-middle shadow-xl transition-all mt-4 sm:mt-[4.5rem]">
									<div className="p-4 sm:hidden">
										<SearchInput
											ref={searchInputRef}
											value={searchTerm}
											onChange={handleInputChange}
											onSubmit={handleSubmit}
										/>
									</div>

									<div className="p-4 pt-0 sm:pt-4 max-h-[70vh] overflow-y-auto">
										{isLoading && <p className="text-gray-400">Searching...</p>}
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
										{!isLoading &&
											!searchResults?.length &&
											searchTerm.trim() && (
												<p className="text-gray-400">No results found.</p>
											)}
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition> */}
		</div>
	);
};

export default Search;
