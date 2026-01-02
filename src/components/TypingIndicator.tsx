const TypingIndicator = () => {
	return (
		<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
			<div className="flex gap-1">
				<span className="typing-dot" />
				<span className="typing-dot animation-delay-1" />
				<span className="typing-dot animation-delay-2" />
			</div>
			<span>typing…</span>
		</div>
	);
};

export default TypingIndicator;