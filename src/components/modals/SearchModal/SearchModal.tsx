import React, { useEffect, Fragment } from "react";
import { Transition } from "@headlessui/react";

interface PopupProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

const SearchModal: React.FC<PopupProps> = ({ isOpen, onClose, children }) => {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
		}
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<div>
				<div className="fixed inset-0 flex items-start justify-center p-4 sm:absolute sm:p-0 sm:top-full sm:left-0 sm:w-full sm:mt-2">
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95">
						<div onClick={(e) => e.stopPropagation()}>{children}</div>
					</Transition.Child>
				</div>
			</div>
		</Transition>
	);
};

export default SearchModal;
