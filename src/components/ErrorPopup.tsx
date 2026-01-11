type ErrorPopupProps = {
	message: string;
	onClose: () => void;
};

export default function ErrorPopup({ message, onClose }: ErrorPopupProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="w-80 rounded-2xl bg-white dark:bg-neutral-900 p-5 shadow-xl animate-scaleIn">
				<h2 className="text-lg font-semibold text-red-600">Error</h2>
				<p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
					{message}
				</p>

				<button
					onClick={onClose}
					className="mt-4 w-full rounded-xl bg-red-600 text-white py-2 hover:bg-red-700 transition"
				>
					OK
				</button>
			</div>
		</div>
	);
}
