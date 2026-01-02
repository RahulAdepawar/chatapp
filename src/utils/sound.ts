let notificationAudio: HTMLAudioElement | null = null;

/**
 * Play notification sound safely
 * - Reuses same Audio instance
 * - Handles browser autoplay restrictions
 */
export const playNotificationSound = () => {
	try {
		if (!notificationAudio) {
			notificationAudio = new Audio("/sounds/chat_notification.wav");
			notificationAudio.volume = 0.6;
		}

		notificationAudio.currentTime = 0;
		notificationAudio.play().catch(() => {
			// Autoplay blocked (user interaction required)
		});
	} catch (err) {
		console.error("Sound error:", err);
	}
};
