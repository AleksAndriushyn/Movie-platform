import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { getLoginUrl } from "@/api/me";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";

const MENU_ITEM_CLASS = "block w-full text-left px-4 py-2 text-sm text-gray-200 data-[focus]:bg-gray-700";

const AuthControls: React.FC = () => {
	const location = useLocation();
	const { data: user, isLoading } = useCurrentUser();
	const logout = useLogout();

	if (isLoading) {
		// keeps the header from shifting while the session loads
		return <div className="w-9 h-9 rounded-full bg-gray-800 animate-pulse" />;
	}

	if (!user) {
		return (
			<a href={getLoginUrl(location.pathname + location.search)} className="auth-button text-center whitespace-nowrap">
				Sign in
			</a>
		);
	}

	const displayName = user.name ?? user.email ?? "Account";

	return (
		<Menu as="div" className="relative">
			<MenuButton className="flex rounded-full focus:outline-none focus:ring-2 focus:ring-red-600" aria-label="Account menu">
				{user.avatarUrl ? (
					<img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover" />
				) : (
					<span className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center font-bold">
						{displayName[0].toUpperCase()}
					</span>
				)}
			</MenuButton>
			<MenuItems anchor="bottom end" className="z-30 mt-2 w-56 rounded-lg bg-gray-800 shadow-xl border border-gray-700 py-1 focus:outline-none">
				<div className="px-4 py-2 border-b border-gray-700">
					<p className="text-sm font-semibold text-white truncate">{displayName}</p>
					{user.email && <p className="text-xs text-gray-400 truncate">{user.email}</p>}
				</div>
				<MenuItem>
					<Link to="/favorites" className={MENU_ITEM_CLASS}>Favorites</Link>
				</MenuItem>
				<MenuItem>
					<Link to="/watchlist" className={MENU_ITEM_CLASS}>Watchlist</Link>
				</MenuItem>
				<MenuItem>
					<button type="button" onClick={() => logout.mutate()} className={MENU_ITEM_CLASS}>
						Sign out
					</button>
				</MenuItem>
			</MenuItems>
		</Menu>
	);
};

export default AuthControls;
