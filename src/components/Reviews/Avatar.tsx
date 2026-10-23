import React from "react";

type AvatarProps = {
	name: string | null;
	url?: string | null;
};

export const Avatar: React.FC<AvatarProps> = ({ name, url }) =>
	url ? (
		<img src={url} alt="" referrerPolicy="no-referrer" loading="lazy" className="w-10 h-10 rounded-full object-cover shrink-0" />
	) : (
		<span className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold shrink-0" aria-hidden="true">
			{(name?.[0] ?? "?").toUpperCase()}
		</span>
	);
