import React, { forwardRef } from "react";

interface SearchInputProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onFocus?: () => void;
	onSubmit: (e: React.FormEvent) => void;
	id?: string;
	onBlur?: () => void;
	onClick?: () => void;
	className?: string;
	disabled?: boolean;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
	({ onSubmit, ...props }, ref) => {
		return (
			<form onSubmit={onSubmit}>
				<input
					{...props}
					ref={ref}
					type="search"
					placeholder="Search movies and series..."
					className="search-input"
				/>
			</form>
		);
	}
);

export default SearchInput;
