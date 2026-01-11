
import { useState, useEffect } from "react";
import AxiosApi from "@/lib/axios";
import { socket } from "@/lib/socket";
import { playNotificationSound } from "@/utils/sound";
import { showBrowserNotification } from "@/utils/notifications";

type ContactList = {
	contact_user_id: number;
	contact_user_name: string;
	mute: number;
	profile_image?: string;
	is_saved: number; // 1 = saved, 0 = not saved
	pending: number;
	last_sender_id: number;
	last_message: string;
	last_time: Date;
};

interface Props {
	onMenuSelect: (view: "chat") => void;
	selectedContactId: (contactId: number) => void;
	onSelectContact: (contactId: number) => void;
}

type Message = {
	id: number;
	sender_id: number;
	receiver_id: number;
	message: string | null;
	attachments?: any[]; // optional, if you send attachments
};


export default function ContactList({ onMenuSelect, onSelectContact, selectedContactId }: Props) {
	const [contactsList, setContactsList] = useState<ContactList[]>([]);
	const [selected_contact_id, setSelectedContactId] = useState<number | null>(null);
	let [newMessage, setNewMessage] = useState(0);

	/* -------------------- SOCKET CONNECT -------------------- */
	useEffect(() => {
		const connectSocket = () =>
			new Promise((resolve, reject) => {
				if (socket.connected) {
					return resolve(socket);
				}

				socket.connect();

				socket.once("connect", () => {
					let userId = localStorage.getItem("user_id");
					socket.emit("join_user", userId);
					resolve(socket);
				});

				socket.once("connect_error", (err) => {
					reject(err);
				});
			});


		connectSocket().then(() => {
			console.log("socket.connected in promise", socket.connected);
		}).catch(console.error);

		return () => {
			// socket.off(); // optional
		};
	}, []);

	/* -------------------- FETCH CONTACTS -------------------- */
	useEffect(() => {

		const fetchContacts = async () => {
			const res = await AxiosApi.get("/api/get_contacts");
			setContactsList(res.data.data);
		};
		fetchContacts();
	}, [newMessage]);

	useEffect(() => {
		const handleNewMessage = () => {
			setNewMessage((prev) => prev + 1);
		};

		socket.on("new_message", handleNewMessage);

		return () => {
			socket.off("new_message", handleNewMessage);
		};
	}, []);


	/* -------------------- SOCKET MESSAGE LISTENER -------------------- */
	useEffect(() => {
		const handleReceiveMessage = (msg: Message) => {
			setContactsList(prev =>
				prev.map(contact => {
					if (contact.contact_user_id !== msg.sender_id) return contact;

					const isChatOpen = selected_contact_id === msg.sender_id;

					if (!isChatOpen) {
						playNotificationSound();
						if (document.hidden) {
							showBrowserNotification(
								contact.contact_user_name,
								msg.message || "📎 Attachment"
							);
						}
					}

					return {
						...contact,
						last_message: msg.message || "📎 Attachment",
						last_sender_id: msg.sender_id,
						pending: isChatOpen ? 0 : contact.pending + 1,
					};
				})
			);
		};

		socket.on("receive_message", handleReceiveMessage);
		return () => {
			socket.off("receive_message", handleReceiveMessage);
		};
	}, [selected_contact_id]);

	/* -------------------- CLICK CONTACT -------------------- */
	function handleOnClick(contact: ContactList) {
		onSelectContact(contact.contact_user_id);
		onMenuSelect("chat");
		selectedContactId(contact.contact_user_id);
		setSelectedContactId(contact.contact_user_id);

		// reset pending when opened
		setContactsList(prev =>
			prev.map(c =>
				c.contact_user_id === contact.contact_user_id
					? { ...c, pending: 0 }
					: c
			)
		);
	}


	return (
		<ul className="divide-y divide-gray-200 dark:divide-neutral-700 overflow-y-auto pb-24">
			{contactsList.map(contact => {
				const isSelected = selected_contact_id === contact.contact_user_id;
				const isIncomingLast = contact.last_sender_id === contact.contact_user_id;
				const pendingCount = Number(contact.pending) || 0;

				return (
					<li
						key={contact.contact_user_id}
						onClick={() => handleOnClick(contact)}
						className={`
							flex items-center gap-3 p-4 cursor-pointer transition
							${contact.is_saved !== 1
								? "bg-red-50 dark:bg-red-900/20"
								: isSelected
									? "bg-blue-100 dark:bg-blue-900/30"
									: "hover:bg-gray-100 dark:hover:bg-neutral-800"
							}
						`}
					>
						{/* Avatar */}
						{contact.profile_image ? (
							<img
								src={`${import.meta.env.VITE_SERVER_ORIGIN}${contact.profile_image}`}
								className="w-10 h-10 rounded-full object-cover"
							/>
						) : (
							<div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
								{contact.contact_user_name.charAt(0).toUpperCase()}
							</div>
						)}

						{/* Content */}
						<div className="flex-1 min-w-0">
							<div className="flex justify-between items-center">
								<span className="font-medium truncate">
									{contact.contact_user_name}
								</span>

								{contact.last_time && (
									<span className="text-xs text-gray-400 whitespace-nowrap">
										{new Date(contact.last_time).toLocaleTimeString("en-IN", {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								)}
							</div>

							<div
								className={`flex justify-between text-sm truncate ${pendingCount > 0 && isIncomingLast
									? "font-semibold text-gray-900 dark:text-gray-100"
									: "text-gray-500 dark:text-neutral-400"
									}`}
							>
								<span>
									{contact.last_message || "No messages yet"}
								</span>
								{pendingCount > 0 && (
									<span className="min-w-[20px] h-5 px-2 text-xs rounded-full bg-blue-600 text-white flex items-center justify-center">
										{pendingCount}
									</span>
								)}
							</div>
						</div>
					</li>
				);
			})}
		</ul>
	);
}
