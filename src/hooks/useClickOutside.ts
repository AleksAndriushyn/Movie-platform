import { useEffect, useRef, type RefObject } from "react";

export const useClickOutside = (
	callback: () => void
): RefObject<HTMLDivElement> => {
	const ref = useRef<HTMLDivElement>(null);
	// keep the latest callback without re-subscribing the listener on every render
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		const handleClick = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				callbackRef.current();
			}
		};
		document.addEventListener("mousedown", handleClick, true);
		return () => {
			document.removeEventListener("mousedown", handleClick, true);
		};
	}, []);

	return ref as RefObject<HTMLDivElement>;
};
