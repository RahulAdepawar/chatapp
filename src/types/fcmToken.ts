import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

const VAPID_KEY = "YOUR_PUBLIC_VAPID_KEY";

export const requestFCMToken = async () => {
	const permission = await Notification.requestPermission();
	if (permission !== "granted") return;

	const token = await getToken(messaging, {
		vapidKey: VAPID_KEY,
	});

	if (token) {
		await fetch("/api/save-fcm-token", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token }),
		});
	}
};
