importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
	apiKey: "",
	authDomain: "",
	projectId: "",
	storageBucket: "",
	messagingSenderId: "",
	appId: "",
	measurementId: "",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
	console.log("[SW] Background message:", payload);

	const title = payload.data.title;
	const options = {
		body: payload.data.body,
		icon: "/icon.png",
		data: payload.data, // important for click handling
	};

	self.registration.showNotification(title, options);
});
