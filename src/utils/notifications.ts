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

export function askForNotifications() {
	console.log("askForNotifications")
	if (!("Notification" in window)) {
		console.warn("Browser does not support notifications");
		return;
	}
	console.log("askForNotifications 1")

	if (Notification.permission === "default") {
		Notification.requestPermission().then((permission) => {
			if (permission === "granted") {
				console.log("Notification permission granted");
			}
		});
	}
}

export function showNotification(title: string, message: string) {
	if (document.visibilityState === "visible") return; // 👈 avoid spam

	if (Notification.permission === "granted") {
		const notification = new Notification(title, {
			body: message,
			icon: "/logo.png",
			badge: "/logo.png"
		});

		notification.onclick = () => {
			window.focus();
			notification.close();
		};
	}
}
