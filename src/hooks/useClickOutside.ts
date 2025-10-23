import { useEffect, useRef, type RefObject } from "react";

export const useClickOutside = (
	callback: () => void
): RefObject<HTMLDivElement> => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClick = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				callback();
			}
		};
		document.addEventListener("mousedown", handleClick, true);
		return () => {
			document.removeEventListener("mousedown", handleClick, true);
		};
	}, [callback]);

	return ref as RefObject<HTMLDivElement>;
};
