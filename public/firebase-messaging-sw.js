importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
	apiKey: "AIzaSyBk1DIZhDq2fJqljR9bb53B5KTwGaVjVLk",
	authDomain: "chatapp-b9c00.firebaseapp.com",
	projectId: "chatapp-b9c00",
	storageBucket: "chatapp-b9c00.firebasestorage.app",
	messagingSenderId: "98584393552",
	appId: "1:98584393552:web:b7081b57cea4c77c971e55",
	measurementId: "G-ZWW1SRTPXK",
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
