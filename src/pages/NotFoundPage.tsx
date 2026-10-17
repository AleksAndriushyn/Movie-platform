import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
	return (
		<div className="text-center py-20">
			<p className="text-6xl font-extrabold text-red-600 mb-4">404</p>
			<h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
				Page not found
			</h1>
			<p className="text-gray-400 mb-8">
				The page you are looking for doesn't exist or has been moved.
			</p>
			<Link
				to="/"
				className="inline-block px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
			>
				Back to home
			</Link>
		</div>
	);
};

export default NotFoundPage;
