type MobileHeaderProps = {
	title: string;
	onBack: () => void;
};

export function MobileHeader({ title, onBack }: MobileHeaderProps) {
	return (
		<div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
			<button
				onClick={onBack}
				className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700"
			>
				←
			</button>
			<h2 className="font-semibold text-gray-900 dark:text-white">
				{title}
			</h2>
		</div>
	);
}
