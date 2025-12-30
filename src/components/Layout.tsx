import { useState } from "react";
import Sidebar from "./Sidebar";
import AddContact from "./contact/AddContact";
import ContactList from "./contact/ContactList";
import Profile from "./settings/Profile";
import ChatWindow from "./chats/ChatWindow";
import { MobileHeader } from "./MobileHeader";

export default function Layout() {
	const [view, setView] = useState("");
	const [, setonSelectContact] = useState("");
	const [selectedContactId, setselectedContactId] = useState();

	return (
		<div className="h-screen flex bg-gray-100 dark:bg-neutral-900 bg-blackdark:bg-black dark:text-white overflow-hidden">
			{/* Sidebar */}
			<div
				className={`w-full md:w-72 border-r border-gray-200 dark:border-neutral-700
					${view ? "hidden md:block" : "block"}
				`}
			>
				<Sidebar
					onMenuSelect={setView}
					onSelectContact={setonSelectContact}
					selectedContactId={setselectedContactId}
				/>
			</div>

			{/* Content */}
			<div
				className={`flex-1 h-full
						${view ? "block" : "hidden md:block"}
				`}
			>
				{view === "addContact" && (
					<div className="h-full flex flex-col">
						<MobileHeader
							title="Add Contact"
							onBack={() => setView("")}
						/>
						<AddContact />
					</div>
				)}

				{view === "contactList" && (
					<div className="h-full flex flex-col">
						<MobileHeader
							title="Contacts"
							onBack={() => setView("")}
						/>
						<ContactList />
					</div>
				)}

				{view === "Profile" && (
					<div className="h-full flex flex-col">
						<MobileHeader
							title="Profile"
							onBack={() => setView("")}
						/>
						<Profile />
					</div>
				)}

				{view === "chat" && selectedContactId && (
					<div className="h-full flex flex-col">
						<ChatWindow
							contactId={selectedContactId}
							onBack={() => setView("")}
						/>
					</div>
				)}

			</div>
		</div>

	);
}
