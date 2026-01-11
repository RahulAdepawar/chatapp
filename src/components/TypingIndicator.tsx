
const TypingIndicator = () => {
	return (
		<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
			<div className={`black-hole-orbit`}>
				<span className="typing-dot orbit-1" />
				<span className="typing-dot orbit-2" />
				<span className="typing-dot orbit-3" />
			</div>
			<span>typing…</span>
		</div>
	);
};

export default TypingIndicator;