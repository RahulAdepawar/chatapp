
import { useState, useEffect } from "react";
import AxiosApi from "@/lib/axios";

type ContactList = {
	contact_user_id: number;
	contact_user_name: string;
	mute: number;
	profile_image?: string;
	is_saved: number; // 1 = saved, 0 = not saved
	pending: number;
	last_sender_id: number;
	last_message: string;
};

interface Props {
	onMenuSelect: (view: "chat") => void;
	selectedContactId: (contactId: number) => void;
	onSelectContact: (contactId: number) => void;
}

export default function ContactList({ onMenuSelect, onSelectContact, selectedContactId }: Props) {
	let [contactsList, setContactsList] = useState<ContactList[]>([]);
	let [selected_contact_id, setSelectedContactId] = useState<number>();
	// let [penfingMessage, setPendingMessage] = useState(0);

	useEffect(() => {
		const fetchProfile = async () => {
			let response = await AxiosApi.get("/api/get_contacts");
			let contact_list = await response.data;
			console.log("contact_list", contact_list)

			setContactsList(contact_list.data);
		};

		fetchProfile();
	}, []);

	function handleOnClick(contact: ContactList) {
		onSelectContact(contact.contact_user_id);
		onMenuSelect("chat");
		selectedContactId(contact.contact_user_id);
		setSelectedContactId(contact.contact_user_id)
	}

	return (
		<>
			<ul className="divide-y divide-gray-200 dark:divide-neutral-700 overflow-y-auto pb-24">
				{contactsList.map((contact) => {
					const isSelected = selected_contact_id === contact.contact_user_id;
					const isSaved = contact.is_saved === 1;
					const pendingCount = Number(contact.pending) || 0;
					const isIncomingLast = contact.last_sender_id === contact.contact_user_id;

					return (
						<li
							key={contact.contact_user_id}
							onClick={() => handleOnClick(contact)}
							className={`
								flex items-center gap-3 p-4 cursor-pointer transition
								${
									!isSaved
										? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
										: isSelected
											? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
											: "hover:bg-gray-100 dark:hover:bg-neutral-800"
								}
							`}
						>
							{/* Avatar */}
							{contact.profile_image ? (
								<img
									src={`${import.meta.env.VITE_SERVER_ORIGIN}${contact.profile_image}`}
									alt={contact.contact_user_name}
									className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-neutral-700 flex-shrink-0"
								/>
							) : (
								<div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
									{contact.contact_user_name.charAt(0).toUpperCase()}
								</div>
							)}

							{/* Name + Last message */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between">
									<span className="font-medium truncate">
										{contact.contact_user_name}
									</span>

									{/* Pending badge */}
									{pendingCount > 0 && (
										<span className="ml-2 min-w-[20px] h-5 px-2 text-xs flex items-center justify-center rounded-full bg-blue-600 text-white">
											{pendingCount}
										</span>
									)}
								</div>

								{/* Last message */}
								<p
									className={`text-sm truncate ${
										pendingCount > 0 && isIncomingLast
											? "font-semibold text-gray-900 dark:text-gray-100"
											: "text-gray-500 dark:text-neutral-400"
									}`}
								>
									{contact.last_message || "No new messages yet"}
								</p>
							</div>
						</li>
					);
				})}
			</ul>


		</>
	);
};