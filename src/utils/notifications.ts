import { messaging } from "@/types/firebase";
import { getToken } from "firebase/messaging";
import AxiosApi from "@/lib/axios";

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

	if (!("Notification" in window)) {
		console.warn("Browser does not support notifications");
		return;
	}

	const permission = await Notification.requestPermission();
	console.log("permission", permission);

	if (permission === "granted") {
		const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
		console.log("token", token);
		let res = await AxiosApi.post("/api/save-fcm-token", {
			token,
		});

		console.log("res", res)
		console.log("Notification permission granted");
	}
	else {
		console.log("Notification permission granted");
	}
};

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
