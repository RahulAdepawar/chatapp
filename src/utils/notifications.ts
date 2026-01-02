export const showBrowserNotification = (
	title: string,
	body: string
) => {
	if (!("Notification" in window)) return;

	if (Notification.permission === "granted") {
		new Notification(title, { body });
	}
};

export const requestNotificationPermission = async () => {
	if (!("Notification" in window)) return;

	if (Notification.permission === "default") {
		await Notification.requestPermission();
	}
};
