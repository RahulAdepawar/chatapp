import { useState, useEffect } from "react";
import AxiosApi from "@/lib/axios";

type ContactList = {
	contact_list_id: number;
	contact_user_id: number;
	contact_user_name: string;
	mute: number;
	is_saved: number;
};

export default function ContactList() {
	const [search, setSearch] = useState("");
	let [contactsList, setContactsList] = useState<ContactList[]>([]);
	const [openMenuId, setOpenMenuId] = useState<number | null>(null);

	const toggleMute = async (contact_list_id: number, contactId: number, mute: number) => {
		try {
			const response = await AxiosApi.post("/api/contact/mute", {
				contact_list_id: contact_list_id,
				contact_id: contactId,
				mute: mute ? 0 : 1,
			});

			const status = await response.data.status;

			if (status) {
				setContactsList((prev) =>
					prev.map((c) =>
						c.contact_user_id === contactId
							? { ...c, mute: mute ? 0 : 1 }
							: c
					)
				);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const deleteContact = async (contact_list_id: number, contactId: number, deleted: number) => {
		if (!confirm("Are you sure you want to delete this contact?")) return;

		try {
			const response = await AxiosApi.post(`/api/contact/delete`, {
				contact_list_id: contact_list_id,
				contact_id: contactId,
				deleted: deleted ? 0 : 1,
			});
			console.log(response);
			if (response.data.status) {
				setContactsList((prev) =>
					prev.filter((c) => c.contact_user_id !== contactId)
				);
			}
		} catch (err) {
			console.error(err);
		}
	};


	useEffect(() => {
		const fetchProfile = async () => {
			let response = await AxiosApi.get("/api/contact_list");
			let contact_list = await response.data;
			setContactsList(contact_list.data);
		};

		fetchProfile();
	}, []);

	return (
		<div className="h-full flex flex-col bg-white dark:bg-neutral-900 bg-blackdark:bg-black dark:text-white">
			{/* Header */}
			<div className="p-4 border-b border-gray-200 dark:border-neutral-700">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
					Contacts
				</h2>

				<input
					type="text"
					placeholder="Search contacts"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="mt-3 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
			</div>

			{/* List */}
			<ul className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-neutral-700">
				{contactsList.length === 0 && (
					<li className="p-6 text-center text-gray-500 dark:text-gray-400">
						No contacts found
					</li>
				)}

				{contactsList.map((contact, index) => (
					<li
						key={index}
						className="relative flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
					>
						{/* Avatar */}
						<div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
							{contact.contact_user_name.charAt(0).toUpperCase()}
						</div>

						{/* Info */}
						<div className="flex-1 min-w-0">
							<p className="font-medium text-gray-900 dark:text-white truncate">
								{contact.contact_user_name}
							</p>

							{contact.mute === 1 && (
								<p className="text-xs text-gray-500 dark:text-gray-400">
									Muted
								</p>
							)}
						</div>

						{/* 3-dot menu */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								setOpenMenuId(
									openMenuId === contact.contact_user_id
										? null
										: contact.contact_user_id
								);
							}}
							className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700"
						>
							⋮
						</button>

						{/* Dropdown */}
						{openMenuId === contact.contact_user_id && (
							<div className="absolute right-4 top-14 w-40 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-md z-10">
								<button
									onClick={() =>
										toggleMute(contact.contact_list_id ,contact.contact_user_id, contact.mute)
									}
									className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
								>
									{contact.mute ? "Unmute" : "Mute"}
								</button>

								<button
									onClick={() =>
										deleteContact(contact.contact_list_id ,contact.contact_user_id, contact.is_saved)
									}
									className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
								>
									Delete
								</button>
							</div>
						)}
					</li>

				))}
			</ul>
		</div>
	);
}
